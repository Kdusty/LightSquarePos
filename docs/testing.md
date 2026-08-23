# Testing

Manual test checklists per critical flow. No automated test suite exists. Run these before marking any task complete that touches the relevant flow.

---

## 1. Authentication Flow

- [ ] Load the app → shows "Authenticating Session..." spinner briefly
- [ ] With no session: redirected to LoginScreen (dark background, LightSquare logo visible)
- [ ] Sign in with correct credentials → enters app, reaches LockScreen
- [ ] Sign in with wrong password → shows inline error message (not a page crash)
- [ ] Sign up with new email → success message appears, mode flips to login
- [ ] Password recovery link → shows "Secure Your Account" form, not the login form
- [ ] Signing out from any state → returns to LoginScreen, no stale data visible
- [ ] Page reload with active session → auth resolves within 1 second, LockScreen shown

---

## 2. Staff Lock Screen

- [ ] LockScreen shows all active staff avatars (inactive staff NOT shown)
- [ ] Correct PIN → enters POS view as that staff member
- [ ] Wrong PIN → shake animation or error, does not unlock
- [ ] Owner PIN → all sidebar items visible (POS, Order Display, Analytics, Transactions, Inventory, Settings)
- [ ] Manager PIN → Settings NOT visible in sidebar
- [ ] Cashier PIN → only POS and Order Display visible
- [ ] Lock button in sidebar → returns to LockScreen, clears current user state
- [ ] After locking, cannot navigate to analytics/transactions by URL manipulation

---

## 3. POS — Core Transaction Flow

- [ ] Product grid loads with correct items and categories
- [ ] Category tabs filter correctly ("All" shows everything)
- [ ] Search filters products by name in real-time
- [ ] Clicking a product with no variants adds it directly to cart
- [ ] Clicking a product with variants opens the Variant Picker modal
- [ ] Variant Picker: required groups block "Add to Cart" if not selected
- [ ] Variant Picker: optional groups can be skipped
- [ ] Cart shows correct line-item price including variant modifiers
- [ ] Same product + different variants = separate cart lines
- [ ] Same product + same variants = quantity increments on existing line
- [ ] Out-of-stock product is non-clickable (stock = 0)
- [ ] Cart quantity cannot exceed current stock level
- [ ] Discount applied → shows discount line in cart totals
- [ ] Tax displayed uses the configured tax rate from Settings (not hardcoded 12%)
- [ ] Tax formula is inclusive: customer pays menu price, tax is extracted
- [ ] "Hold Order" saves cart and clears it; held order badge increments on sidebar
- [ ] "Restore" on a held order loads it back into the cart
- [ ] Order name field saves to the transaction record

---

## 4. Payment Flow

- [ ] Cash modal: enter amount → shows correct change calculation
- [ ] Cash modal: amount less than total → blocks Confirm button
- [ ] GCash modal: shows QR code if configured in Settings
- [ ] Confirm Payment → success toast "Payment successful!"
- [ ] After payment: cart clears, held orders unaffected
- [ ] Receipt modal shows: items, variants, cashier name, discount, tax, total, payment method
- [ ] Print button triggers browser print dialog (or hardware print if printer connected)
- [ ] Order appears on Order Display immediately after payment (same terminal and other terminals)
- [ ] Transaction appears in Transactions view immediately (real-time update)
- [ ] Product stock decremented correctly after payment (refresh Inventory to verify)

---

## 5. Order Display (Kitchen)

- [ ] New orders appear at the top of the queue without page refresh
- [ ] Timer shows elapsed time since order was placed
- [ ] Timer colour: green < 5min, amber 5–10min, red > 10min
- [ ] Checking off an item marks it visually without affecting other items
- [ ] All items checked → "Done" button available
- [ ] "Done" button moves ticket to the "Done Today" tab
- [ ] "Recall" on a done ticket returns it to the active queue
- [ ] Ticket marked done on one terminal disappears from all other terminals immediately (Realtime)
- [ ] Cashier tab badge shows count of active queue tickets

---

## 6. Inventory

- [ ] Products list shows all active products with current stock
- [ ] Low-stock products highlighted (at or below threshold)
- [ ] Add Product (owner only): form validates name and price before saving
- [ ] New product appears in Inventory and POS grid after save (Realtime)
- [ ] Edit Product: existing values pre-filled in form
- [ ] Variant builder: add group, add options, set required/optional, set prices
- [ ] Delete Product: soft-deletes (active = false); disappears from Inventory and POS grid
- [ ] Image upload: file under 5MB accepted; larger file rejected with toast
- [ ] Managers see Inventory in view-only mode (no add/edit/delete buttons)
- [ ] Cashiers cannot reach Inventory view

---

## 7. Transactions

- [ ] Full transaction history loads sorted newest first
- [ ] Search by order ID or item name filters correctly
- [ ] Payment method filter works (Cash / GCash / All)
- [ ] Date range filter works (Today / 7 Days / 30 Days / Custom)
- [ ] Click a transaction row → receipt modal opens with full BIR receipt format
- [ ] Void button (today's orders, manager/owner): requires reason, updates status to Voided
- [ ] Voided transaction: restores stock to affected products
- [ ] Refund button (any order, manager/owner): full and partial refund options
- [ ] Partial refund: correct amount calculated proportionally
- [ ] Refunded transaction stock restore toggle works
- [ ] CSV Export: downloads file with current filtered data
- [ ] Voided/Refunded transactions excluded from revenue summary stats

---

## 8. Analytics

- [ ] Revenue KPIs load for Today / 7 Days / 30 Days ranges
- [ ] Custom date range picker works (start and end dates)
- [ ] Voided and refunded transactions excluded from all revenue figures
- [ ] Net Profit displayed (after COGS deduction)
- [ ] Profit margin % calculated correctly
- [ ] Bar chart: hover shows tooltip with date and revenue
- [ ] Category breakdown shows correct proportions
- [ ] Low stock panel lists products at or below threshold

---

## 9. Settings

- [ ] Store name change → persists after page reload
- [ ] Tax rate change → immediately reflected in cart totals
- [ ] GCash QR upload → appears in GCash payment modal
- [ ] BIR fields → appear on printed receipts
- [ ] Low stock threshold slider → immediately updates low-stock badge count
- [ ] Staff tab: add new staff → appears in LockScreen immediately
- [ ] Staff tab: disable staff → removed from LockScreen
- [ ] Subscription tab: shows current tier and days remaining
- [ ] Upgrade flow: submits GCash reference, status shows "Pending"
- [ ] Hardware: Connect Printer button triggers browser USB permission popup (Chrome only)
- [ ] Image Migration: runs without error on products with base64 images
- [ ] Settings NOT accessible to managers or cashiers

---

## 10. Offline Mode

- [ ] Disable network (DevTools → Network → Offline)
- [ ] Offline banner or indicator appears (if implemented)
- [ ] Products still visible (cached in localStorage)
- [ ] Can complete a Cash transaction while offline → receipt shown
- [ ] Transaction saved to offline queue (check DevTools → Application → localStorage)
- [ ] Re-enable network → offline queue syncs automatically
- [ ] Transaction appears in Transactions view after sync
- [ ] Stock decremented correctly after sync (not double-decremented)
- [ ] GCash payment cannot be completed offline (handled gracefully)
