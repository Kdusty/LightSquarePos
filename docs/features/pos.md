# Feature: Point of Sale

## What it does
The core selling interface. Staff select products, build a cart, apply discounts, process payment, and fire the order to the kitchen display — all in a single screen.

## Files

| File | Role |
|---|---|
| `src/components/POSView.jsx` | Layout shell: wraps ProductGrid and Cart side by side |
| `src/components/ProductGrid.jsx` | Product catalog with category tabs, search, and variant trigger |
| `src/components/Cart.jsx` | Cart panel: items, quantities, notes, hold orders, discounts, totals |
| `src/components/PaymentModals.jsx` | Cash/GCash payment flows; receipt display |
| `src/components/MiscModals.jsx` | Variant Picker modal |
| `src/App.jsx` | All POS handlers: addItem, updateQty, holdOrder, confirmPayment |

## Props (POSView receives from App.jsx)

| Prop | Type | Purpose |
|---|---|---|
| `products` | array | Product list from useProducts |
| `cart` | array | Current cart items |
| `addItem(product)` | fn | Add plain product (no variants) to cart |
| `setVariantModal(product)` | fn | Open variant picker for product with variants |
| `updateQty(cartKey, delta)` | fn | Increment/decrement a cart line |
| `setNote(cartKey, text)` | fn | Set per-item note |
| `holdOrder()` | fn | Save cart to heldOrders and clear |
| `restoreHold(held)` | fn | Load a held order back into cart |
| `discount` / `setDiscount` | state | Active discount or null |
| `setModal("pay")` | fn | Open payment modal |
| `taxRate` | number | Current tax rate from settings |

## Data Sources

- Products: `useProducts()` → Supabase `products` table (Realtime subscribed)
- Cart: local React state in `App.jsx` (not persisted to DB until payment confirmed)
- Held orders: local React state (lost on page reload)
- Tax rate: `useStoreSettings()` → Supabase `store_settings.tax_rate`

## Cart Key Generation

Cart items use a `cartKey` string to differentiate the same product with different variants:
```
cartKey = `${product.id}__${variantOptionIds.join("_")}` // e.g. "42__o5_o8_o11"
cartKey = Date.now().toString()  // for plain products (no variants)
```
The same `cartKey` → quantity increments. Different `cartKey` → separate line item.

## Financial Math (in App.jsx)

```js
subtotal = sum(item.price × item.qty)
discAmt  = Math.round(subtotal × discPct / 100)
total    = subtotal - discAmt
vatableSales = total / (1 + taxRate/100)   // Inclusive VAT (BIR-compliant)
tax      = Math.round((total - vatableSales) × 100) / 100
total_cogs = sum((item.cogs || 0) × item.qty)
net_profit = total - total_cogs
```

## BREAK RISK

| If you do this | This breaks |
|---|---|
| Change `cartKey` generation format | Existing held orders become unstuck; offline queue items won't match |
| Remove `safeTaxRate = parseFloat(taxRate) \|\| 12` guard | Blank white screen if taxRate is undefined during load |
| Change product `id` type (e.g. from uuid to integer) | Cart items won't match Supabase products; checkout_cart RPC will fail |
| Modify `confirmPayment` without testing both online and offline branches | One branch silently breaks — cashiers only discover it when the network drops |
| Remove variant `selectedVariants` from cart item shape | Receipt modal, kitchen tickets, and COGS calculation all read this field |

## Dependencies

- `useProducts` — live product list with Realtime sync
- `useKitchen` → `addTicket` — called inside `confirmPayment` to fire kitchen order
- `useTransactions` → `saveTransaction` — called inside `confirmPayment`
- `usePrinter` → `printReceipt` — called inside `confirmPayment` if printer connected
- `useStoreSettings` → `taxRate`, `gcashQR` — used in cart math and GCash modal
- `useNetwork` → `isOnline` — switches between online and offline checkout branches
