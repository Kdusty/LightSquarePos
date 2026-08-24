# Architecture

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18.2.0 |
| Build tool | Vite | 5.0.0 |
| Language | JavaScript (JSX) | — |
| Database | Supabase (PostgreSQL) | @supabase/supabase-js 2.45.0 |
| Auth | Supabase Auth (email/password) | via Supabase client |
| Realtime | Supabase Realtime (WebSockets) | via Supabase client |
| Storage | Supabase Storage | bucket: `product-images` |
| Hosting | Vercel | auto-deploy from GitHub |
| Icons | lucide-react | 0.263.1 |
| Styling | Inline CSS via `buildCSS.js` template literal | — |

---

## Request Lifecycle

### Authenticated page load
1. `main.jsx` renders `<AuthProvider>` → `<App>`
2. `useAuth` calls `supabase.auth.getSession()` → sets `user`
3. `App` checks `authLoading` → shows "Authenticating..." spinner
4. Once resolved: if no user → `<LoginScreen>`; if user exists → `<MainApp authUser={user}>`
5. `MainApp` mounts all data hooks in parallel (useProducts, useStaff, useTransactions, useStoreSettings, useSubscription, useKitchen)
6. Each hook fetches from Supabase, then subscribes to Realtime WebSocket channel
7. Once all three loading states clear (staffLoading, productsLoading, transactionsLoading) → full app renders
8. LockScreen is shown first — staff must select avatar and enter PIN before accessing any view

### Checkout flow
1. Cashier builds cart → clicks Pay → selects Cash or GCash
2. `confirmPayment()` called in App.jsx
3. If offline → queues locally in localStorage, creates kitchen ticket, shows receipt
4. If online → calls `checkout_cart` RPC (atomic, row-locked)
5. On RPC success → calls `saveTransaction()` → inserts into `transactions` table
6. Supabase Realtime broadcasts the INSERT to all other connected terminals
7. `addTicket()` fires → inserts kitchen ticket → Realtime broadcasts to kitchen display
8. If hardware printer connected → `buildReceiptPayload()` → `printReceipt()` via Web Serial API

---

## Multi-tenancy

Every store is an isolated Supabase Auth user. All database tables have an `owner_id uuid` column that references `auth.users(id)`.

- Row Level Security (RLS) is active on all tables
- Every SELECT/INSERT/UPDATE/DELETE policy checks `owner_id = auth.uid()`
- Exception: the super-admin `is_super_admin()` SECURITY DEFINER function bypasses RLS for the platform owner UUID
- Storage: product images are uploaded to `{user.id}/filename.ext` paths; RLS policies enforce that users can only access their own folder
- On `auth.users` DELETE: all rows cascade-delete via FK ON DELETE CASCADE

New tenant provisioning is automatic: a `AFTER INSERT` trigger on `auth.users` calls `handle_new_user()`, which creates the tenant's `store_settings` and `subscriptions` rows.

---

## File Structure

```
/
├── index.html                    # HTML entry point, Vite injects bundle here
├── vite.config.js                # Vite config (React plugin only)
├── package.json
├── .env.example                  # Env var template (credentials hardcoded — see security.md)
├── .env                          # Local secrets (gitignored)
├── public/
│   ├── lightsquare-logo.png      # Favicon
│   └── gcash-qr.jpg              # Default GCash QR placeholder
└── src/
    ├── main.jsx                  # Entry: wraps App in AuthProvider + StrictMode
    ├── App.jsx                   # Auth gate + MainApp (state manager, routing wrapper)
    ├── styles/
    │   └── buildCSS.js           # Global CSS template literal (dark/light mode toggle)
    ├── hooks/
    │   ├── useAuth.jsx           # AuthContext, AuthProvider, email auth flows
    │   ├── useProducts.js        # Products CRUD + Realtime subscription
    │   ├── useStaff.js           # Staff CRUD (no Realtime)
    │   ├── useTransactions.js    # Transactions CRUD + Realtime subscription
    │   ├── useStoreSettings.js   # Store config load/save + offline cache
    │   ├── useSubscription.js    # Tier, limits, upgrade request
    │   ├── useKitchen.js         # Kitchen tickets CRUD + Realtime subscription
    │   ├── useNetwork.js         # Online/offline state via navigator.onLine events
    │   └── usePrinter.js         # Web Serial API: connect/print/disconnect
    ├── lib/
    │   ├── supabase.js           # Supabase client (credentials currently hardcoded — fix!)
    │   ├── storage.js            # Product image upload/delete/URL helpers
    │   ├── escpos.js             # ESC/POS byte command builder for thermal printers
    │   ├── formatters.js         # fmt() currency, todayStr() date, genId()
    │   └── permissions.js        # PERMISSIONS map + can() helper (NOTE: App.jsx has its own inline can())
    ├── data/
    │   └── initialData.js        # Icon library, seed products, seed staff, discount types, fmt/todayStr exports
    └── components/
        ├── LoginScreen.jsx       # Email/password auth UI (sign in, sign up, password recovery)
        ├── LockScreen.jsx        # Staff PIN selection screen (shown after login)
        ├── Sidebar.jsx           # Navigation sidebar (role-gated, God Mode section)
        ├── NavItem.jsx           # Individual sidebar navigation item
        ├── ErrorBoundary.jsx     # React error boundary (catches render errors)
        ├── POSView.jsx           # POS layout shell (wraps ProductGrid + Cart)
        ├── ProductGrid.jsx       # Product catalog with search, category tabs, variant trigger
        ├── Cart.jsx              # Cart panel (items, quantities, notes, discount, totals)
        ├── PaymentModals.jsx     # Cash/GCash payment flows, receipt viewer, transaction viewer
        ├── KitchenView.jsx       # Order Display (queue + done tabs, timers, check-off)
        ├── InventoryView.jsx     # Product list (add/edit/delete, stock levels)
        ├── TransactionsView.jsx  # Transaction history (filter, search, void, refund, CSV export)
        ├── AnalyticsView.jsx     # Revenue analytics (KPIs, chart, COGS, net profit)
        ├── SettingsView.jsx      # Store config, staff, subscription, hardware, BIR info
        ├── EODReport.jsx         # End-of-day cash reconciliation modal
        ├── MiscModals.jsx        # Product modal, staff modal, void modal, refund modal, variant picker
        └── SuperAdminView.jsx    # God Mode: subscription approval for all tenants
```

---

## Key Data Flows

### 1. Stock decrement on sale
`confirmPayment` → `supabase.rpc("checkout_cart", { items })` → PostgreSQL function acquires row-level lock, validates qty > 0, decrements `products.stock` — all or nothing. Realtime broadcasts product UPDATEs to all terminals.

### 2. Multi-terminal product sync
`useProducts` subscribes to `postgres_changes` on `products` table filtered by `owner_id`. Any change from any terminal propagates to all others in ~50ms via WebSocket. Duplicate guard prevents double-render on self-writes.

### 3. Kitchen ticket lifecycle
Payment confirmed → `addTicket()` → INSERT into `kitchen_tickets` → Realtime broadcasts to kitchen display terminal → cashier/chef checks items off → `updateTicket()` sets `doneAt` → Realtime UPDATE triggers filter: `if doneAt` → ticket removed from queue.

### 4. Offline → online sync
`useNetwork` detects reconnect → `processOfflineQueue()` reads `localStorage["lightsquare_offline_queue"]` → for each queued txn: checks Postgres if ID already exists (`maybeSingle()`) → if missing, runs `checkout_cart` RPC + `saveTransaction` → clears queue on success.

### 5. Auth session persistence
Supabase client auto-stores session in localStorage. On page reload, `getSession()` returns the cached session without a network call. The `onAuthStateChange` listener handles token refresh, invite flows, and password recovery intercept.

### 6. POS → CRM subscription approval flow
Store owner submits GCash upgrade in SettingsView → `useSubscription.requestUpgrade()` writes `subscriptions: { status: "pending", gcash_ref, order_code }` → optimistically sets local status to "pending" (drops the paywall immediately) → invokes `notify-payment` Edge Function non-blocking → Edge Function sends HTML email via Resend API linking to crm.lightsquarepos.com → Admin reviews in CRM Pending Payments → Approve sets `status = "active" + expires_at` → POS `useSubscription` picks up the change → store unlocked.

**Sister app:** LightSquare CRM — `crm.lightsquarepos.com` | Local: `/Users/johnvasquez/Documents/COMPANY/LightSquareCRM` | GitHub: Kdusty/LightSquareCRM | Protocol: `LightSquareCRM/CLAUDE.md`
