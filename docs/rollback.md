# Rollback

## Decision Table: Rollback vs Hotfix

| Scenario | Action |
|---|---|
| Frontend bug, no DB change involved | Hotfix: fix code, deploy |
| Frontend bug causing data corruption | Rollback frontend → hotfix → redeploy |
| DB migration broke queries, data intact | Hotfix: apply reverse migration, fix code |
| DB migration corrupted or deleted data | Rollback frontend → assess data damage → restore from backup |
| Auth is completely broken | Rollback frontend immediately (users locked out) |
| Core POS checkout broken mid-day | Rollback frontend immediately (revenue impact) |
| Analytics/settings broken, POS OK | Hotfix is acceptable, rollback optional |

**Rule of thumb:** If cashiers cannot complete transactions → rollback first, investigate second.

---

## How to Roll Back the Frontend (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the **LightSquare** project
3. Click **Deployments** in the top nav
4. Find the last known-good deployment (check the date)
5. Click the three-dot menu → **Promote to Production**
6. Confirm — the rollback is instant (CDN serves the previous bundle within seconds)

The rollback does NOT affect the database. Any data written by the bad deploy remains in Supabase.

---

## How to Reverse a Database Migration

Write a reverse migration SQL file alongside every migration that adds or removes columns.

### Template for every destructive migration

```sql
-- MIGRATION: add_cogs_to_products
ALTER TABLE products ADD COLUMN cogs numeric;
ALTER TABLE transactions ADD COLUMN total_cogs numeric;
ALTER TABLE transactions ADD COLUMN net_profit numeric;

-- REVERSE (run this to undo):
-- ALTER TABLE products DROP COLUMN cogs;
-- ALTER TABLE transactions DROP COLUMN net_profit;
-- ALTER TABLE transactions DROP COLUMN total_cogs;
```

Apply reverse SQL via: Supabase Dashboard → SQL Editor → paste and run.

### Specific reversals for known migrations

**phase2_owner_id_and_rls** — reversing this would break RLS entirely. Do not reverse unless starting fresh. Instead, fix individual policies.

**store_settings_unique_owner_id** — do not reverse. The UNIQUE constraint is required for `.update()` to work correctly.

**checkout_cart RPC** — to reverse: drop the function via SQL editor. App will fall back to failing gracefully on checkout (the online branch will fail; offline mode still works).

---

## What Rollback Does NOT Fix

- **Transactions already saved** — voided, refunded, or completed transactions are in Postgres permanently. Rolling back the frontend does not undo database writes.
- **Stock already decremented** — a bad checkout that decremented stock twice cannot be undone by a frontend rollback. Requires manual SQL to correct inventory levels.
- **Uploaded images** — product images uploaded to Supabase Storage persist after rollback. Clean up manually via Storage dashboard if needed.
- **Auth state** — Supabase sessions are not affected by frontend rollback. Users remain logged in.

---

## Post-Rollback Checklist

- [ ] Open `docs/incidents.md` and create a new INC entry immediately
- [ ] Assess whether any data was corrupted during the bad deployment window
- [ ] Check Supabase logs (Dashboard → Database → Logs) for query errors during the incident window
- [ ] Identify the root cause before redeploying (don't just redeploy the fixed code without understanding what broke)
- [ ] If stock was double-decremented: run SQL to audit and correct: `SELECT id, name, stock FROM products WHERE owner_id = 'uuid'`
- [ ] If transactions are duplicated: mark extras as Voided via SQL update
- [ ] Document the root cause and fix in `docs/incidents.md`
- [ ] Add a corresponding entry to `docs/changelog.md`
- [ ] Run the relevant checklist from `docs/testing.md` on staging before redeploying
