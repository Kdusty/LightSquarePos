# Feature: Subscriptions

## What it does
Enforces SaaS tier limits and manages the manual GCash upgrade approval workflow. The super-admin approves upgrades via God Mode; there is no automated payment gateway.

## Files

| File | Role |
|---|---|
| `src/hooks/useSubscription.js` | Loads tier/status/limits from `subscriptions` table; `requestUpgrade()` |
| `src/components/SettingsView.jsx` | Subscription UI: current tier display, days remaining, upgrade CTA |
| `src/components/SuperAdminView.jsx` | Platform admin view: lists all pending subscriptions, approves upgrades |
| `src/components/Sidebar.jsx` | God Mode section gated by hardcoded UUID |
| `src/App.jsx` | Product limit enforcement in `saveProd()` |

## Tier Limits (TIER_LIMITS in useSubscription.js)

| Tier | Products | Devices | Price |
|---|---|---|---|
| trial | 14 | 1 | ₱0 (14-day) |
| starter | Unlimited | 1 | ₱299/mo |
| growth | Unlimited | 3 | ₱599/mo |
| annual | Unlimited | 1 | ₱2,988/yr |

## Limit Enforcement

In `saveProd()` (App.jsx):
```js
if (!editProd && limits && products.length >= limits.products) {
  showToast(`Limit Reached: Your plan restricts you to ${limits.products} products.`, "error");
  return;
}
```
Only the product count limit is enforced on the frontend. Device limits are not technically enforced.

## Upgrade Workflow

1. Tenant selects target tier in SettingsView, enters GCash reference number
2. `requestUpgrade(targetTier, gcashRef)` calls `subscriptions` UPDATE:
   ```js
   { tier: targetTier, status: "pending", gcash_ref: gcashRef, updated_at: now }
   ```
3. Super-admin sees the pending row in `SuperAdminView`
4. Super-admin clicks Approve → UPDATE `{ tier, status: "active", expires_at }` via God Mode
5. Tenant's `useSubscription` reflects the new tier on next page load

## Super-Admin Access

`SuperAdminView` bypasses RLS via the `is_super_admin()` SECURITY DEFINER function. The God Mode nav item only appears if `authUser.id === "e2f7ca54-3572-4085-b665-96113c8b30da"` (hardcoded in `Sidebar.jsx:13`).

## BREAK RISK

| If you do this | This breaks |
|---|---|
| Rename `tier` values (e.g. `"starter"` → `"basic"`) | `TIER_LIMITS` lookup returns undefined; product limit defaults to trial (14) |
| Change `requestUpgrade` to use `.upsert()` | Unique constraint on `owner_id` will cause a conflict error |
| Remove the `is_super_admin()` RLS bypass | SuperAdminView queries return empty (tenant isolation blocks super-admin reads) |
| Change the hardcoded super-admin UUID in Sidebar without updating App.jsx | God Mode nav shows but SuperAdminView query scope mismatches |

## Dependencies

- `subscriptions` table in Supabase (RLS-protected; super-admin bypass via SECURITY DEFINER)
- `useProducts` → `products.length` compared against `limits.products` in `saveProd`
- Supabase Auth → `authUser.id` compared to hardcoded UUID for God Mode gate
