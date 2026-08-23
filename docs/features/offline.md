# Feature: Offline Mode

## What it does
Keeps the POS functional when the internet drops. Cash transactions are queued locally in `localStorage` and automatically synced to Supabase when connectivity is restored.

## Files

| File | Role |
|---|---|
| `src/hooks/useNetwork.js` | Listens to browser `online`/`offline` events; returns `isOnline` boolean |
| `src/App.jsx` | `offlineQueue` state; `processOfflineQueue()`; `executeOfflineCheckout()` |
| `src/hooks/useProducts.js` | localStorage fallback if Supabase fetch fails |
| `src/hooks/useStoreSettings.js` | localStorage fallback if Supabase fetch fails |

## Data Cached in localStorage

| Key | Contents | Written by |
|---|---|---|
| `lightsquare_offline_queue` | Array of queued offline transactions | `executeOfflineCheckout()` in App.jsx |
| `lightsquare_cached_products` | Full products array | `useProducts.js` on every successful fetch |
| `lightsquare_cached_settings` | store_settings row | `useStoreSettings.js` on every successful load |

## Offline Transaction Format (queue item)

```js
{
  id: crypto.randomUUID(),           // stable UUID for idempotency
  items: validCart,                  // cart items with product_id and qty
  payload: {                         // full transaction payload for saveTransaction()
    id: sameUUID,
    date, items, subtotal, discount, tax, total, total_cogs, net_profit,
    method, status: "Completed",     // NOTE: was "Completed (Offline)" before INC-006 fix
    cashier
  }
}
```

## Sync Logic (`processOfflineQueue` in App.jsx)

```
For each queued transaction:
  1. Call checkout_cart RPC with the cart items
     - If RPC errors with "insufficient_stock": log, skip (stock sold while offline)
  2. Call saveTransaction(txn.payload)
     - Idempotency: Supabase transaction INSERT uses the stable UUID; duplicate INSERTs return error
  3. If both succeed: remove from queue
  4. If either fails: keep in failedQueue, retry next time online
After loop:
  - Persist failedQueue back to localStorage
  - Refresh products to get correct stock levels
```

## Known Limitations

- **GCash offline is not supported.** The offline branch only covers Cash transactions. GCash requires QR scan confirmation which needs network.
- **Race condition between two offline terminals.** If two tablets both go offline and sell the last unit of the same product, both will queue the transaction. When both come back online, the first sync succeeds and the second gets `insufficient_stock`. The second transaction is logged but stock goes negative for the period between the two syncs. See `docs/incidents.md` (Risk logged in Phase 4 summary).
- **Offline queue survives page reload** but is stored unencrypted in `localStorage`. Do not store sensitive data (e.g. card numbers) in the queue payload.
- **Settings cannot be modified offline.** `saveSettings` checks `navigator.onLine` and shows an alert if offline.

## BREAK RISK

| If you do this | This breaks |
|---|---|
| Change the `status` CHECK constraint in `transactions` to exclude `"Completed"` | Offline sync fails — the payload sets `status: "Completed"` |
| Remove `crypto.randomUUID()` and go back to `"offline-" + Date.now()` | Idempotency check breaks; double-billing risk (see INC-006) |
| Change `checkout_cart` RPC signature | Offline sync loop calls RPC with old format; all offline syncs fail |
| Clear localStorage manually during a sync | Queue is lost; pending transactions are orphaned |

## Dependencies

- `useNetwork` — provides `isOnline` to gate checkout branches
- `useTransactions` → `saveTransaction` — used in sync loop
- `supabase.rpc("checkout_cart")` — used in sync loop
- `useProducts` → `refreshProducts` — called after successful sync to correct stock levels
