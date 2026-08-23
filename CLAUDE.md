# LightSquare POS — Project Protocol

**Stack:** React 18 + Vite 5 + Supabase (auth, db, realtime, storage) + lucide-react  
**Live:** app.lightsquarepos.com | **Supabase:** rjgbnxaahmfyaasyqirp | **GitHub:** devaidusty/LightSquare

---

## 1. Docs Index

| File | Description |
|---|---|
| `docs/setup.md` | Env vars, local dev, external services, first user creation |
| `docs/architecture.md` | Stack, request lifecycle, multi-tenancy, file structure, data flows |
| `docs/security.md` | Auth model, role hierarchy, rules that must never be broken |
| `docs/db-schema.md` | Every table, every column, FK relationships, JSONB shapes |
| `docs/db-change-protocol.md` | Pre-mutation checklist, critical columns, hardcoded string locations |
| `docs/api-routes.md` | All Supabase calls organised by feature |
| `docs/incidents.md` | Confirmed production bugs — open this first when debugging |
| `docs/changelog.md` | Every task logged here — no exceptions |
| `docs/testing.md` | Manual test checklists per critical flow |
| `docs/rollback.md` | When to roll back vs hotfix; how to do each |
| `docs/monitoring.md` | Current error tracking status; how to check logs now |
| `docs/features/pos.md` | POS cart, variants, payment, financial math |
| `docs/features/auth.md` | Supabase Auth + staff PIN system + can() function |
| `docs/features/kitchen.md` | Order Display queue, timers, Realtime sync |
| `docs/features/offline.md` | localStorage queue, sync idempotency, known limitations |
| `docs/features/subscriptions.md` | Tier limits, upgrade workflow, God Mode |
| `docs/features/hardware.md` | ESC/POS thermal printing, Web Serial API, cash drawer |

---

## 2. Pre-Change Table

| You are about to edit… | Read first |
|---|---|
| `src/hooks/useAuth.jsx` | `docs/features/auth.md`, `docs/security.md` |
| `src/components/LoginScreen.jsx` | `docs/features/auth.md` |
| `src/components/LockScreen.jsx` | `docs/features/auth.md` |
| `src/App.jsx` (can() function) | `docs/security.md`, `docs/features/auth.md` |
| `src/App.jsx` (confirmPayment) | `docs/features/pos.md`, `docs/features/offline.md`, `docs/features/kitchen.md` |
| `src/App.jsx` (processOfflineQueue) | `docs/features/offline.md`, `docs/incidents.md` (INC-006) |
| `src/App.jsx` (saveProd) | `docs/features/subscriptions.md`, `docs/db-schema.md` |
| `src/hooks/useProducts.js` | `docs/features/pos.md`, `docs/api-routes.md` |
| `src/hooks/useTransactions.js` | `docs/api-routes.md`, `docs/db-change-protocol.md` |
| `src/hooks/useKitchen.js` | `docs/features/kitchen.md`, `docs/api-routes.md` |
| `src/hooks/useStoreSettings.js` | `docs/db-schema.md` (store_settings), `docs/incidents.md` (INC-005) |
| `src/hooks/useSubscription.js` | `docs/features/subscriptions.md` |
| `src/components/Sidebar.jsx` | `docs/features/auth.md`, `docs/security.md` (super-admin UUID) |
| `src/components/SuperAdminView.jsx` | `docs/features/subscriptions.md`, `docs/security.md` |
| `src/lib/escpos.js` | `docs/features/hardware.md` |
| `src/hooks/usePrinter.js` | `docs/features/hardware.md` |
| `src/lib/supabase.js` | `docs/security.md` (hardcoded credentials warning) |
| `src/lib/storage.js` | `docs/db-schema.md` (products.image), `docs/security.md` |
| Any `docs/db-schema.md` migration | `docs/db-change-protocol.md` + `docs/rollback.md` |
| Any task start or completion | `docs/changelog.md` |
| Any error investigation | `docs/monitoring.md` + `docs/incidents.md` |
| Any critical flow change | `docs/testing.md` |

---

## 3. Security Rules — Must Never Be Broken

1. **The auth gate must not be bypassed.** `if (!user || recoveryMode) return <LoginScreen />` in `App.jsx:49` must always be active. Never comment it out.

2. **RLS must be active on all Supabase tables.** Every table has `owner_id` and policies enforcing `owner_id = auth.uid()`. Never disable RLS on any table.

3. **Supabase credentials must come from `import.meta.env`.** `src/lib/supabase.js` currently hardcodes them — this must be fixed. The fix: replace hardcoded strings with `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`, and set these in Vercel's environment variable settings.

4. **The `checkout_cart` RPC must validate qty.** The guard `IF qty_needed <= 0 THEN RAISE EXCEPTION 'invalid_quantity'` must never be removed. Its removal allows stock injection via negative quantities.

5. **The super-admin UUID must be updated in both hardcoded locations simultaneously** if ever changed: `src/components/Sidebar.jsx:13` and `src/App.jsx:822`.

6. **ON DELETE CASCADE must remain wired.** Never remove the FK cascade between `auth.users` and `public.*` tables — it is the only way to properly clean up tenant data on account deletion.

7. **Staff PINs are plaintext — do not escalate their trust.** They gate UI views only. Never use them to authorise Supabase queries or financial operations.

8. **Storage bucket `product-images` must stay authenticated-upload only.** The RLS policy enforces `{user.id}/` path isolation. Never set the bucket to public-upload.

---

## 4. Critical Data Flows — Easy to Accidentally Break

### 1. Cart → Checkout → Kitchen (three-step chain)
`confirmPayment` in App.jsx runs three async operations in sequence: RPC stock decrement → `saveTransaction` → `addTicket`. If you add error handling that `return`s early after the RPC but before `addTicket`, kitchen display stops receiving orders. Both online and offline branches must always call `addTicket`.

### 2. Inclusive VAT formula (BIR compliance)
The tax is extracted from the total, not added on top: `vatableSales = total / (1 + taxRate/100)`. Changing this to `total × taxRate/100` flips to US-style exclusive tax and makes all receipts legally non-compliant in the Philippines. The formula was wrong once (INC-001) and took production time to catch.

### 3. Offline queue idempotency
The offline queue uses `crypto.randomUUID()` as stable transaction IDs. The sync loop checks if the UUID already exists in Postgres before calling the RPC. Reverting to `"offline-" + Date.now()` removes idempotency and re-introduces the double-billing bug (INC-006).

### 4. Realtime duplicate guard
Every Realtime INSERT handler checks `prev.some(item => item.id === payload.new.id)` before appending. Without this guard, optimistic writes (the hook writes locally before Realtime broadcasts back) cause duplicate rows in React state. Do not remove these guards.

### 5. `can()` function vs permissions.js
There are TWO permission implementations. `src/lib/permissions.js` exists but App.jsx does NOT import it — it has its own inline `can()` function (line 254). If you change permissions in `permissions.js`, it has zero effect. All permission changes go in the inline `can()` in App.jsx.

### 6. `saveSettings` uses UPDATE not UPSERT
`useStoreSettings.saveSettings()` uses `.update()`. The `store_settings` row is guaranteed by the `handle_new_user` provisioning trigger. Using `.upsert()` here silently fails due to the UNIQUE constraint on `owner_id` (see INC-005). Never change to upsert.

---

## 5. Changelog Protocol

Every task must be logged in `docs/changelog.md`. No exceptions.

**Before starting:** Add CHG entry with date, type, requested, decision. Mark changes and commits as (pending).

**After completing:** Fill in every file touched and commit hash(es).

**DB migration rule:** After any migration, `docs/db-schema.md` must be updated before the task closes. A migration with no `db-schema.md` update is incomplete.

**Type labels:**
- `Feature` — new capability
- `Fix` — bug fix
- `Refactor` — restructure without behaviour change
- `Config (Frontend)` — vite.config, package.json, env vars, build config
- `Config (Supabase)` — RLS policies, migrations, functions, auth settings, storage
- `Docs` — documentation only

---

## 6. Incident Protocol

**Before debugging:** Check `docs/incidents.md` first. If the symptom matches a known incident, go straight to the documented fix.

**After fixing a confirmed production bug:** Add INC entry before closing the task.

**In every INC entry, note** whether monitoring caught it or missed it. This feeds back into `docs/monitoring.md` to justify adding new alerts.

---

## 7. PRE-IMPLEMENTATION GATE — HARD STOP

Before implementing any change, state:
- Confidence level: HIGH / MEDIUM / LOW
- What could break if this goes wrong
- Whether investigation is needed first

LOW → stop, investigate, plan, wait for approval  
MEDIUM → propose approach + risks, wait for confirmation  
HIGH → proceed, flag BREAK RISK areas inline; if the change touches a critical flow, state which checklist items from `docs/testing.md` were verified

HARD STOP: You MUST write the gate output in your response text BEFORE calling any Edit / Write / NotebookEdit tool or any Bash command that modifies files or runs git. The gate must be VISIBLE in your response — thinking it does not count. A code change with no gate text above it is a protocol violation.

Format (copy exactly):
**GATE**
- Confidence: HIGH / MEDIUM / LOW
- Break risk: [what breaks if this goes wrong]
- Investigation needed: yes / no — [why]
