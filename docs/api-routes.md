# API Routes

LightSquare has no custom backend server. All data operations go through the Supabase client directly from the React frontend. This document catalogues every Supabase call organised by feature.

---

## Auth (`src/hooks/useAuth.jsx`)

| Operation | Supabase call | Notes |
|---|---|---|
| Get session on load | `supabase.auth.getSession()` | Returns cached session from localStorage |
| Subscribe to auth changes | `supabase.auth.onAuthStateChange()` | Fires on login, logout, token refresh, invite, recovery |
| Sign in | `supabase.auth.signInWithPassword({ email, password })` | — |
| Sign up | `supabase.auth.signUp({ email, password })` | Triggers `handle_new_user` on confirm |
| Sign out | `supabase.auth.signOut()` | — |
| Update password (recovery) | `supabase.auth.updateUser({ password })` | Used in recovery mode |
| Get current user | `supabase.auth.getUser()` | Called inside each hook before writes to get `user.id` |

---

## Products (`src/hooks/useProducts.js`)

| Operation | Table | Shape | Filter |
|---|---|---|---|
| Load all active | `products` SELECT * | `.eq("active", true).eq("owner_id", uid).order("id")` | Owner-scoped |
| Realtime subscribe | `products-sync` channel | `postgres_changes`, all events | `owner_id=eq.{uid}` |
| Add product | `products` INSERT | `{ ...product, variants: [], owner_id: uid }` | — |
| Update product | `products` UPDATE | `changes` object | `.eq("id", id)` |
| Soft-delete | `products` UPDATE | `{ active: false }` | `.eq("id", id)` |
| Manual refresh | `products` SELECT * | Same as initial load | Owner-scoped |

---

## Staff (`src/hooks/useStaff.js`)

| Operation | Table | Shape | Filter |
|---|---|---|---|
| Load all | `staff` SELECT * | `.eq("owner_id", uid).order("created_at")` | Owner-scoped |
| Add member | `staff` INSERT | `{ ...member, owner_id: uid }` | — |
| Update member | `staff` UPDATE | `changes` | `.eq("id", id)` |
| Toggle active | `staff` UPDATE | `{ active: bool }` | `.eq("id", id)` |

No Realtime subscription on staff — changes require a page reload to reflect on other terminals.

---

## Transactions (`src/hooks/useTransactions.js`)

| Operation | Table | Shape | Filter |
|---|---|---|---|
| Load all | `transactions` SELECT * | `.eq("owner_id", uid).order("date", desc)` | Owner-scoped |
| Realtime subscribe | `transactions-sync` channel | `postgres_changes`, all events | `owner_id=eq.{uid}` |
| Save transaction | `transactions` INSERT | `{ ...txn, owner_id: uid }` | — |
| Void transaction | `transactions` UPDATE | `{ status: "Voided" }` | `.eq("id", id)` |
| Refund transaction | `transactions` UPDATE | `{ status: "Refunded" }` | `.eq("id", id)` |

---

## Store Settings (`src/hooks/useStoreSettings.js`)

| Operation | Table | Shape | Filter |
|---|---|---|---|
| Load settings | `store_settings` SELECT * | `.eq("owner_id", uid).single()` | Owner-scoped |
| Save settings | `store_settings` UPDATE | `updates` object | `.eq("owner_id", uid)` |
| Update BIR info | `store_settings` UPDATE | `{ bir_info: updatedObj }` | `.eq("owner_id", uid)` |

Uses `.update()` — the row MUST already exist (provisioned by `handle_new_user` trigger).

---

## Subscriptions (`src/hooks/useSubscription.js`)

| Operation | Table | Shape | Filter |
|---|---|---|---|
| Load subscription | `subscriptions` SELECT * | `.eq("owner_id", uid).order("id", desc).limit(1).single()` | Owner-scoped |
| Request upgrade | `subscriptions` UPDATE | `{ tier, status: "pending", gcash_ref, updated_at }` | `.eq("owner_id", uid)` |

---

## Kitchen Tickets (`src/hooks/useKitchen.js`)

| Operation | Table | Shape | Filter |
|---|---|---|---|
| Load active queue | `kitchen_tickets` SELECT * | `.eq("owner_id", uid).is("doneAt", null).order("firedAt", asc)` | Owner-scoped |
| Realtime subscribe | `kitchen-sync` channel | `postgres_changes`, all events | `owner_id=eq.{uid}` |
| Add ticket | `kitchen_tickets` INSERT | `{ ...ticket, owner_id: uid }` | — |
| Update ticket | `kitchen_tickets` UPDATE | `changes` (items, doneAt, etc.) | `.eq("id", id)` |

---

## Storage (`src/lib/storage.js`)

| Operation | Bucket | Path pattern |
|---|---|---|
| Upload image | `product-images` | `{user.id}/{timestamp}-{random}.{ext}` |
| Delete image | `product-images` | Extracted from public URL |
| Get public URL | `product-images` | `supabase.storage.from(bucket).getPublicUrl(path)` |

---

## RPC Functions (`src/App.jsx`)

| Function | When called | Input |
|---|---|---|
| `checkout_cart` | On every successful online payment | `{ items: [{ product_id, qty }] }` |
| `checkout_cart` | During offline sync for each queued transaction | Same |

---

## SuperAdminView (`src/components/SuperAdminView.jsx`)

Queries `subscriptions` table directly (bypasses tenant RLS via `is_super_admin()` SECURITY DEFINER function). Reads all pending subscriptions and can approve/update tier+status for any tenant.
