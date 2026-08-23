# Feature: Order Display (Kitchen Display System)

## What it does
Shows the live queue of paid orders waiting to be prepared. Kitchen staff check off items as they plate them, then mark tickets done. Supports multi-terminal real-time sync — a cashier confirming payment on Terminal A instantly adds the ticket to Terminal B's kitchen display.

## Files

| File | Role |
|---|---|
| `src/hooks/useKitchen.js` | Supabase CRUD + Realtime subscription for `kitchen_tickets` table |
| `src/components/KitchenView.jsx` | Queue + Done tabs, timers, check-off UI |
| `src/App.jsx` | Ticket handlers: `kitchenCheckItem`, `kitchenDoneTicket`, `kitchenRecallTicket`, `kitchenElapsed` |
| `src/App.jsx` (confirmPayment) | `addTicket()` call fires after every successful payment (both online and offline) |

## Data Flow

```
Payment confirmed (App.jsx confirmPayment)
  → addTicket({ id: txn.id, orderName, items, firedAt, cashier, method })
  → INSERT into kitchen_tickets (Supabase)
  → Realtime broadcasts INSERT to all subscribed terminals
  → KitchenView re-renders with new ticket

Kitchen staff taps item
  → kitchenCheckItem(ticketId, cartKey)
  → Updates item.checkedOff toggle in ticket.items array
  → updateTicket(id, { items: newItems }) → Supabase UPDATE
  → Realtime broadcasts UPDATE to all terminals

Staff marks ticket Done
  → kitchenDoneTicket(ticketId)
  → updateTicket(id, { doneAt: new Date().toISOString() })
  → Realtime UPDATE: doneAt is now set
  → useKitchen Realtime handler: if payload.new.doneAt → remove from queue
  → Local state: push to kitchenDone array
```

## Active Queue Filter

`useKitchen` fetches `WHERE doneAt IS NULL` on load. Realtime handler filters done tickets out when `doneAt` is set by any terminal.

## Timer Logic (`kitchenElapsed` in App.jsx)

```js
const secs = Math.floor((Date.now() - new Date(ticket.firedAt).getTime()) / 1000);
// green < 5min, amber 5–10min, red > 10min
```

`KitchenView` uses a `setInterval` heartbeat (1000ms) to re-render timers without a full page reload. The interval is cleaned up on component unmount to prevent memory leaks.

## BREAK RISK

| If you do this | This breaks |
|---|---|
| Change `doneAt` column name | Queue filter `.is("doneAt", null)` breaks; all tickets appear in queue forever |
| Remove `addTicket()` call from `confirmPayment` | Kitchen display stops receiving orders after payment |
| Remove `kitchenDone` local state | Done tickets have no UI home; "Done Today" tab is empty even if tickets were completed |
| Change `cartKey` format in cart items | `kitchenCheckItem` looks up items by `cartKey`; check-off system breaks |
| Rename the `items` JSONB field | Check-off UI can't find `checkedOff` property; items appear pre-checked |

## Dependencies

- `useTransactions` → transactions generate the `id` reused as the kitchen ticket ID
- `useKitchen` → `addTicket`, `updateTicket` called from `App.jsx`
- Supabase Realtime channel: `kitchen-sync` (3 channels total per session — see Realtime connection limit warning in `docs/security.md`)
