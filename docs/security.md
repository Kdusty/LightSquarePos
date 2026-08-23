# Security

## Auth Model

Two separate authentication layers operate independently:

### Layer 1 — Store access (Supabase Auth)
Email/password login via Supabase Auth. Controls who can access the web app at all. Manages multi-tenancy: each authenticated user is an isolated store owner.

### Layer 2 — Staff switching (Internal PIN system)
After the store owner logs in, a LockScreen requires staff to select their avatar and enter a 4-digit PIN. This is purely a UI-level access control for role-based feature gating within a single store. It does not interact with Supabase Auth. PINs are stored in plaintext in the `staff` table.

---

## Role Hierarchy

| Role | Who | Access |
|---|---|---|
| Platform super-admin | Developer (hardcoded UUID) | Sees all stores; can approve subscriptions via SuperAdminView |
| Store owner | Supabase Auth user | Full access to their store data; manages staff, products, settings |
| Staff: owner | PIN-authenticated | All POS views + settings + analytics + inventory edit |
| Staff: manager | PIN-authenticated | POS + analytics + transactions + inventory (view only) + void + refund |
| Staff: cashier | PIN-authenticated | POS + Order Display only |

**Important:** The `can()` function in `App.jsx` (line 254) is the active permission check. The `src/lib/permissions.js` file exists but is NOT imported by App.jsx — it is effectively dead code for access control. Any permission changes must go into the `can()` function in App.jsx.

---

## Access Control Rules — Must Never Be Broken

1. **Every Supabase query must be RLS-protected.** All tables have `owner_id` and RLS policies that enforce `owner_id = auth.uid()`. Never disable RLS on any table.

2. **The `checkout_cart` RPC must validate qty.** The function must reject any `qty_needed <= 0` payload to prevent stock synthesis via negative quantity injection.

3. **The super-admin UUID must never be changed without updating all hardcoded references.** It appears in: `src/components/Sidebar.jsx:13` and `src/App.jsx:822`. If changed in one place but not the other, God Mode silently breaks.

4. **Storage bucket `product-images` must require authentication.** The bucket RLS policy ensures only authenticated users can upload to their own UUID folder. Never make the bucket public-upload or allow unauthenticated writes.

5. **Staff PINs are not encrypted.** Do not escalate their sensitivity (e.g. do not use PINs to gate financial data or Supabase queries). They are purely cosmetic role-switchers for the UI.

6. **The auth gate in App.jsx must never be commented out in production.** Line: `if (!user || recoveryMode) return <LoginScreen />;` (line 49). If this is removed or bypassed, any anonymous visitor can access the store's live POS and data.

7. **Supabase credentials must be in `.env`, never hardcoded.** Currently `src/lib/supabase.js` hardcodes the URL and anon key — this must be migrated. The anon key is public-safe by design but the URL is project-identifying. See known issues.

8. **ON DELETE CASCADE is wired.** Deleting a user from `auth.users` automatically deletes all their products, staff, transactions, settings, and subscriptions. This is intentional and permanent. Never delete auth users carelessly.

---

## Known Limitations

- **Staff PINs are plaintext.** They are not hashed in the database. A database breach exposes all PINs. Acceptable for the current MVP where PINs gate UI views, not data access.

- **Credentials hardcoded.** `src/lib/supabase.js` hardcodes the Supabase URL and anon key instead of using `import.meta.env.VITE_SUPABASE_URL`. This is a housekeeping issue (the anon key is designed to be public), but must be fixed to use the proper Vite env pattern.

- **Super-admin UUID hardcoded in source.** The God Mode check uses a literal UUID string in two component files. A compromised account with that UUID would have admin-level read/write on all tenant subscriptions.

- **Offline transactions bypass the checkout_cart RPC.** When offline, stock is decremented client-side optimistically. A malicious actor with devtools access could manipulate localStorage to inject fraudulent offline transactions. This is an accepted MVP risk.

- **Realtime connections.** Supabase Free Tier allows ~200 concurrent Realtime connections. 3 active Realtime channels per store session (`products-sync`, `transactions-sync`, `kitchen-sync`). At ~66 concurrent store sessions the connection limit is reached and Realtime stops working fleet-wide.

- **No HTTPS enforcement in code.** Handled by Vercel (all HTTP redirected to HTTPS). Do not serve the app over plain HTTP.
