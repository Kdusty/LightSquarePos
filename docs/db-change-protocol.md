# DB Change Protocol

## Checklist before any database mutation

- [ ] Read `docs/db-schema.md` — confirm the current column names and types match what you're changing
- [ ] Check if the change affects `checkout_cart` RPC — if modifying `products.stock` column type or name, the function must be rewritten
- [ ] If adding/removing columns: update `docs/db-schema.md` before closing the task (mandatory per changelog protocol)
- [ ] If changing a status string (transaction status, subscription tier/status): find all hardcoded references first — see list below
- [ ] Write reverse SQL for any destructive migration before running it (see `docs/rollback.md`)
- [ ] Test RLS policies after any schema change — adding a column does NOT automatically include it in existing RLS policies
- [ ] If changing `owner_id` FK structure: verify ON DELETE CASCADE still holds
- [ ] If adding a new table: add RLS SELECT/INSERT/UPDATE/DELETE policies immediately — never leave a table without RLS enabled

---

## Critical Columns — Do Not Rename or Remove Without Full Audit

| Column | Table | Used in |
|---|---|---|
| `owner_id` | all tables | Every RLS policy, all hook queries, `is_super_admin()` |
| `active` | `products` | `useProducts.js` soft-delete filter, `deleteProduct()` |
| `doneAt` | `kitchen_tickets` | `useKitchen.js` queue filter (`.is("doneAt", null)`) |
| `status` | `transactions` | `voidTransaction()`, `refundTransaction()`, UI badges |
| `tier` | `subscriptions` | `TIER_LIMITS` map in `useSubscription.js`, product limit enforcement |
| `stock` | `products` | `checkout_cart` RPC, low stock alerts, cart qty validation |
| `variants` | `products` | `MiscModals.jsx` variant builder, `ProductGrid.jsx` trigger, cart key generation |
| `items` | `transactions` | Receipt viewer, refund modal, CSV export |
| `items` | `kitchen_tickets` | `KitchenView.jsx` check-off system |
| `bir_info` | `store_settings` | Receipt PDFs, `updBir()` in `useStoreSettings.js` |

---

## Hardcoded Strings — Must Be Kept in Sync

### Transaction status values
Files that hardcode `"Completed"`, `"Voided"`, `"Refunded"`:
- `src/App.jsx` — `txnPayload.status = "Completed"` (lines ~434)
- `src/App.jsx` — `txnPayload.status = "Completed (Offline)"` (offline branch, line ~334) — NOTE: this may violate the DB CHECK constraint; verify the CHECK allows this value
- `src/hooks/useTransactions.js` — `voidTransaction`: sets `"Voided"`; `refundTransaction`: sets `"Refunded"`
- `src/components/TransactionsView.jsx` — status badge display
- `src/components/EODReport.jsx` — status filter for daily totals

### Subscription tier values
Files that hardcode `"trial"`, `"starter"`, `"growth"`, `"annual"`:
- `src/hooks/useSubscription.js` — `TIER_LIMITS` object keys
- `src/components/SettingsView.jsx` — subscription UI rendering
- `src/components/SuperAdminView.jsx` — approval flow

### Payment method values
Files that hardcode `"Cash"`, `"GCash"`:
- `src/App.jsx` — `payMethod` default state, cash drawer kick condition
- `src/lib/escpos.js` — cash drawer pulse check (`txn.method === "Cash"`)
- `src/components/Cart.jsx` — payment method selector
- `src/components/TransactionsView.jsx` — filter options

---

## Safe Ways to Add a Column

1. Add with a DEFAULT value (not NOT NULL without default) to avoid locking the table
2. Update `docs/db-schema.md`
3. Update the relevant hook to read/write the new column
4. Test RLS still applies correctly

## Safe Ways to Rename a Column

Never rename a column directly in production without:
1. Adding the new column name
2. Migrating existing data
3. Updating all references in source
4. Deploying source changes
5. Dropping the old column only after confirming the deploy is stable
