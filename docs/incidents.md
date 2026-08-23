# Incidents

Confirmed production bugs, numbered in order of discovery. Open this file first when debugging.

---

## INC-001 — VAT calculation was exclusive (non-BIR-compliant)

**Status:** Resolved — 2026-02-25

### What broke
Official Receipts were computing tax as `subtotal × 0.12` added on top of the total (US-style exclusive tax). Philippine BIR law requires inclusive VAT where the tax is extracted backwards from the total price.

### Platform impact
All receipts generated before the fix were legally non-compliant. `vatableSales` was equal to `subtotal - discount` instead of `total / (1 + taxRate/100)`.

### Root cause
The VAT formula was ported directly from the original single-file artifact without adjustment for Philippine BIR rules.

### Fix
Rewrote cart math in `App.jsx`. New formula:
```js
const vatableSales = total / (1 + (safeTaxRate / 100));
const tax = Math.round((total - vatableSales) * 100) / 100;
```

### Cross-check
Verify: for a ₱100 item at 12% VAT → `vatableSales = 89.29`, `tax = 10.71`, `total = 100`. Customer pays exactly the menu price.

---

## INC-002 — Blank white screen from undefined taxRate

**Status:** Resolved — 2026-02-26

### What broke
After the monolith split, `taxRate` arrived as `undefined` during the initial render cycle before `useStoreSettings` finished fetching. Components that used `taxRate` directly in calculations crashed on first render, producing a blank white screen.

### Platform impact
App was non-functional on load until a workaround was deployed.

### Root cause
`useStoreSettings` default state for `taxRate` is `12`, but timing between hook mount and render meant some child components received `undefined` before the first state set.

### Fix
Added safety fallback everywhere `taxRate` is used in math:
```js
const safeTaxRate = parseFloat(taxRate) || 12;
```

### Cross-check
If blank screen appears again: check browser console for `NaN` or `undefined` in financial calculations.

---

## INC-003 — Kitchen queue not receiving orders after monolith split

**Status:** Resolved — 2026-02-26

### What broke
After extracting `confirmPayment` into `App.jsx`, the kitchen ticket creation logic was not ported from the original monolith. Orders confirmed at checkout did not appear on the Order Display.

### Platform impact
Café kitchen was fully blind to incoming orders for the period between the monolith split and this fix.

### Root cause
Handler migration was incomplete — the `addTicket` call was missing from the new `confirmPayment` function.

### Fix
Added the full ticket creation block to `confirmPayment` in `App.jsx` — both the online and offline branches. See commit history for full diff.

### Cross-check
Testing checklist: `docs/testing.md` → POS flow → step "order appears on Order Display immediately after payment."

---

## INC-004 — Parallel stock decrement race condition

**Status:** Resolved — 2026-02-27

### What broke
Two cashiers selling the last unit of the same product simultaneously would each complete the sale independently. The `Promise.all` parallel update in the original code ran both decrements without locking, resulting in `stock = -1`.

### Platform impact
Negative stock in the database, incorrect inventory counts, potential overselling.

### Root cause
Client-side sequential `UPDATE` calls have no atomicity guarantee. No row-level locking.

### Fix
Replaced all client-side stock decrements with a single PostgreSQL RPC function `checkout_cart(items jsonb)`. The function uses `SELECT ... FOR UPDATE` (row-level lock) and validates stock before decrementing. All-or-nothing transaction.

### Cross-check
Simulate by opening the app on two browsers simultaneously and attempting to buy the last unit on both at the same time.

---

## INC-005 — Settings changes not persisting (amnesia bug)

**Status:** Resolved — 2026-02-27

### What broke
Store settings (store name, tax rate, etc.) appeared to save successfully but reverted on page reload. The save button had no visible error.

### Root cause
`useStoreSettings` was using `.upsert()`. Supabase's upsert tried to INSERT a new row on conflict, but the UNIQUE constraint on `owner_id` caused a silent failure. The update never actually wrote to the database.

### Fix
Changed `saveSettings()` to use `.update()` instead of `.upsert()`. The row is guaranteed to exist by the `handle_new_user` provisioning trigger, so upsert was never needed.

---

## INC-006 — Offline sync double-billing (idempotency failure)

**Status:** Resolved — 2026-03-04

### What broke
If the network dropped mid-sync, the `processOfflineQueue` loop would retry already-processed transactions. The `checkout_cart` RPC would run twice on the same items, decrementing stock twice. Same transaction appeared twice in the ledger.

### Root cause
The offline queue used `"offline-" + Date.now()` as the transaction ID, which was being stripped before the Postgres insert. Without a stable UUID, the idempotency check (does this ID already exist?) always returned false.

### Fix
- Stopped stripping the ID: offline transactions now use `crypto.randomUUID()` as their ID
- Added `.maybeSingle()` lookup before each RPC call: if the transaction ID already exists in `transactions`, skip it
- Added status sanitisation to scrub the illegal `"Completed (Offline)"` status from trapped legacy queue items

### Cross-check
Go offline → complete a transaction → go online → confirm queue processes once and transaction appears only once in the ledger.

---

## INC-007 — Negative inventory exploit via malicious qty payload

**Status:** Resolved — 2026-02-28

### What broke
The `checkout_cart` RPC accepted arbitrary integer values for `qty`. A malicious request with `qty = -500` would invert the subtraction to an addition, synthesising stock from thin air.

### Root cause
No server-side input validation in the original RPC implementation.

### Fix
Added a guard at the top of the `checkout_cart` function:
```sql
IF qty_needed <= 0 THEN
  RAISE EXCEPTION 'invalid_quantity';
END IF;
```

### Cross-check
Attempt to call the RPC manually via Supabase SQL editor with a negative qty — should receive an exception.
