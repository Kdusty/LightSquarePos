# Changelog

Running log of every task, most recent first.

---

## CHG-014 — Resurrect project for modernisation sprint

**Date:** 2026-08-23  
**Type:** Feature  
**Requested:** Resume development; make the platform modern and updated  
**Decision:** Full codebase audit first; docs/protocol system as foundation before any code changes  
**Changes:**
- `docs/` — Created complete documentation suite (pending)
- `CLAUDE.md` — Created project protocol file (pending)
**Commits:** (pending)

---

## CHG-013 — Variant COGS tracking + offline sync idempotency

**Date:** 2026-03-04  
**Type:** Fix  
**Requested:** Fix offline sync double-billing; fix variant COGS blind spot  
**Decision:** UUID-based idempotency for offline queue; COGS field added to variant options in builder  
**Changes:**
- `src/App.jsx` — `processOfflineQueue`: added `.maybeSingle()` pre-check; UUID generation for offline IDs; offline status sanitisation
- `src/components/MiscModals.jsx` — Added COGS input to variant option builder
- `src/App.jsx` — `addToCartWithVariants`: accumulates `extraCogs` from variant selections
- `src/components/KitchenView.jsx` — Rebranded "Kitchen Display" → "Order Display"
- `src/components/Sidebar.jsx` — "Kitchen" label updated
- `src/components/EODReport.jsx` — "Kitchen" label updated
- `src/components/SettingsView.jsx` — Added `daysLeft` badge for paying tiers
**Commits:** (backfilled from session summary 2026-03-04)

---

## CHG-012 — Phase 4: Realtime, COGS, hardware bridge

**Date:** 2026-03-02  
**Type:** Feature  
**Requested:** Multi-terminal Realtime sync, COGS profitability tracking, ESC/POS thermal printer support  
**Decision:** Supabase Realtime WebSockets on products/transactions/kitchen; COGS column added; Web Serial API hardware bridge  
**Changes:**
- `src/hooks/useProducts.js` — Supabase Realtime channel `products-sync`
- `src/hooks/useTransactions.js` — Supabase Realtime channel `transactions-sync`
- `src/hooks/useKitchen.js` — Supabase Realtime channel `kitchen-sync`; rewritten from local state
- `src/lib/escpos.js` — Created: ESC/POS byte command builder
- `src/hooks/usePrinter.js` — Created: Web Serial API connect/print/disconnect/auto-reconnect
- `src/App.jsx` — COGS math injected into `confirmPayment`; printer bridge execution; COGS state
- `src/components/AnalyticsView.jsx` — Net profit KPI, margin %, COGS display
**Commits:** (backfilled from session summary 2026-03-02)

---

## CHG-011 — Phase 3: Error boundaries, dynamic categories, checkout_cart security

**Date:** 2026-02-28  
**Type:** Feature / Fix  
**Requested:** Error boundaries, dynamic product categories, negative inventory exploit patch  
**Decision:** Class-based ErrorBoundary wrapping all views; categories extracted from live product payload; RPC qty validation  
**Changes:**
- `src/components/ErrorBoundary.jsx` — Created
- `src/App.jsx` — Wrapped all views in ErrorBoundary
- `src/components/ProductGrid.jsx` — Categories extracted dynamically from products array
- `src/components/MiscModals.jsx` — Add Product form uses `<select>` with "Create New Category" toggle
- Database — `checkout_cart` RPC updated with `qty_needed <= 0` guard; RLS policies updated with `is_super_admin()` bypass
**Commits:** (backfilled from session summary 2026-02-28)

---

## CHG-010 — Phase 2 stabilisation: auth, provisioning, cascades, storage security

**Date:** 2026-02-27  
**Type:** Config (Supabase) / Fix  
**Requested:** Wire `handle_new_user` trigger; fix ID generation; cascade deletes; storage RLS; subscription enforcement  
**Decision:** Full schema stabilisation sprint  
**Changes:**
- Database — `handle_new_user` trigger wired to `auth.users` AFTER INSERT
- Database — `store_settings` and `subscriptions` converted to IDENTITY columns
- Database — ON DELETE CASCADE added to all FK relationships
- Database — `is_super_admin()` SECURITY DEFINER function created
- Database — Storage bucket RLS locked to authenticated uploads in UUID folders
- `src/lib/storage.js` — Rewrote upload path to use `{user.id}/filename.ext`
- `src/hooks/useSubscription.js` — Fixed `.upsert()` → `.update()`; TIER_LIMITS export
- `src/components/LoginScreen.jsx` — Added Sign Up and Password Recovery modes
- `src/App.jsx` — Subscription product limit enforcement in `saveProd`
**Commits:** (backfilled from session summary 2026-02-27)

---

## CHG-009 — Phase 2: RLS policies, owner_id, atomic checkout

**Date:** 2026-02-27  
**Type:** Config (Supabase) / Feature  
**Requested:** Multi-tenant data isolation; race condition fix  
**Decision:** RLS on all tables; owner_id on all tables; checkout_cart RPC  
**Changes:**
- Database — `owner_id uuid` column added to all 5 tables
- Database — 17 RLS policies created (SELECT/INSERT/UPDATE/DELETE per table)
- Database — `checkout_cart(items jsonb)` RPC created
- Database — All existing data stamped with owner UUID `8e03f947-...`
- `src/hooks/useProducts.js` — All queries filtered by owner_id
- `src/hooks/useStaff.js` — All queries filtered by owner_id
- `src/hooks/useTransactions.js` — All queries filtered by owner_id
- `src/hooks/useStoreSettings.js` — All queries filtered by owner_id
- `src/hooks/useSubscription.js` — Rewrote to filter by owner_id
**Commits:** (backfilled from session summary 2026-02-27)

---

## CHG-008 — SuperAdminView God Mode

**Date:** 2026-02-28  
**Type:** Feature  
**Requested:** Developer-only admin dashboard to manually approve GCash subscriptions  
**Decision:** Hardcoded UUID check gates a `superadmin` view; RLS bypassed via SECURITY DEFINER  
**Changes:**
- `src/components/SuperAdminView.jsx` — Created
- `src/components/Sidebar.jsx` — God Mode section visible only to hardcoded UUID
- `src/App.jsx` — `view === "superadmin"` routing
**Commits:** (backfilled)

---

## CHG-007 — Global toast system, transaction receipt modal, KDS cleanup

**Date:** 2026-02-28  
**Type:** Feature / Fix  
**Requested:** Replace window.alert with non-blocking toasts; BIR receipt modal on transaction click; purge UUIDs from kitchen display  
**Decision:** Toast state in App.jsx with auto-dismiss; `viewTxn` state in PaymentModals  
**Changes:**
- `src/App.jsx` — Toast state + `showToast()` helper; passed to all components
- `src/components/TransactionsView.jsx` — Short `#A74B1` IDs; click-to-view receipt
- `src/components/PaymentModals.jsx` — Transaction viewer receipt modal
- `src/components/KitchenView.jsx` — UUIDs removed from ticket display
**Commits:** (backfilled)

---

## CHG-006 — Monolith split: App.jsx → 12 components

**Date:** 2026-02-25  
**Type:** Refactor  
**Requested:** Split 2000-line App.jsx monolith to fix performance on low-end tablets  
**Decision:** Strangler Fig pattern — extracted UI to standalone components; App.jsx becomes pure state manager  
**Changes:**
- `src/components/Sidebar.jsx` — Extracted
- `src/components/LockScreen.jsx` — Extracted
- `src/components/NavItem.jsx` — Extracted
- `src/components/InventoryView.jsx` — Extracted
- `src/components/KitchenView.jsx` — Extracted
- `src/components/TransactionsView.jsx` — Extracted
- `src/components/SettingsView.jsx` — Extracted
- `src/components/AnalyticsView.jsx` — Extracted
- `src/components/EODReport.jsx` — Extracted
- `src/components/POSView.jsx` — Extracted
- `src/components/ProductGrid.jsx` — Extracted
- `src/components/Cart.jsx` — Extracted
- `src/components/PaymentModals.jsx` — Extracted
- `src/components/MiscModals.jsx` — Created (all 5 modal dialogs)
- `src/App.jsx` — Rewritten as state manager + routing wrapper (~650 lines)
**Commits:** (backfilled)

---

## CHG-005 — Phase 1: Supabase Auth gate

**Date:** 2026-02-25  
**Type:** Feature  
**Requested:** Email/password auth gate before store access  
**Decision:** AuthProvider wrapping App; LoginScreen component; auth gate at top of App  
**Changes:**
- `src/hooks/useAuth.jsx` — Created: AuthContext, AuthProvider, signIn/signUp/signOut/updatePassword
- `src/components/LoginScreen.jsx` — Created: email/password UI, dark theme
- `src/main.jsx` — Wrapped App in AuthProvider
- `src/App.jsx` — Auth gate: if (!user) return LoginScreen
**Commits:** (backfilled)

---

## CHG-004 — Dynamic tax rate (BIR compliance partial fix)

**Date:** 2026-02-25  
**Type:** Fix  
**Requested:** Tax rate configurable in Settings, not hardcoded at 12%  
**Decision:** `tax_rate` column added to `store_settings`; `useStoreSettings` reads/writes it  
**Changes:**
- Database — `tax_rate numeric DEFAULT 12` column added to `store_settings`
- `src/hooks/useStoreSettings.js` — Reads `tax_rate`, exposes `taxRate`/`setTaxRate`
- `src/App.jsx` — All hardcoded `12` references replaced with `taxRate`/`safeTaxRate`
**Commits:** (backfilled)

---

## CHG-003 — Vite project scaffold + initial component structure

**Date:** 2026-02-24  
**Type:** Feature  
**Requested:** Convert single-file artifact to proper Vite + React project  
**Decision:** Standard Vite scaffold; all data hooks extracted; Supabase wired; initial component split planned  
**Changes:**
- `package.json` — Created
- `vite.config.js` — Created
- `index.html` — Created
- `src/main.jsx` — Created
- `src/App.jsx` — Created (monolith at this point)
- `src/hooks/` — All hooks created
- `src/lib/supabase.js` — Created (credentials hardcoded — not yet fixed)
- `src/lib/storage.js` — Created
- `src/lib/formatters.js` — Created
- `src/lib/permissions.js` — Created
- `src/data/initialData.js` — Created
**Commits:** (backfilled)

---

## CHG-002 — Offline mode + localStorage cache

**Date:** 2026-03-04  
**Type:** Feature  
**Requested:** App must remain usable when internet drops  
**Decision:** `useNetwork` + `processOfflineQueue`; product and settings cache in localStorage  
**Changes:**
- `src/hooks/useNetwork.js` — Created
- `src/App.jsx` — `offlineQueue` state; `executeOfflineCheckout`; `processOfflineQueue`
- `src/hooks/useProducts.js` — localStorage fallback on Supabase failure
- `src/hooks/useStoreSettings.js` — localStorage fallback on Supabase failure
**Commits:** (backfilled)

---

## CHG-001 — Hardware bridge: thermal printer + cash drawer

**Date:** 2026-03-02  
**Type:** Feature  
**Requested:** Print thermal receipts and kick cash drawer from browser  
**Decision:** Web Serial API; ESC/POS byte builder; auto-reconnect on page load  
**Changes:**
- `src/lib/escpos.js` — Created: ESC/POS commands, `buildReceiptPayload()`
- `src/hooks/usePrinter.js` — Created: connect, autoConnect, print, disconnect
- `src/App.jsx` — Hardware bridge execution in `confirmPayment` (both online and offline branches)
- `src/components/SettingsView.jsx` — Printer connect/disconnect controls
**Commits:** (backfilled)
