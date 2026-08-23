# Setup

## Environment Variables

| Variable | Description | Where to get it |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (publishable) key | Supabase Dashboard → Project Settings → API → anon key |

**WARNING: The current `src/lib/supabase.js` has these values hardcoded instead of reading from `.env`. This must be fixed before any new deployment. See `docs/security.md`.**

```bash
cp .env.example .env
# Edit .env with your credentials
```

The `.env` file is gitignored. The `.env.example` already contains the correct values for the current Supabase project — do not commit `.env`.

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

### 3. Run dev server

```bash
npm run dev
```

App runs at `http://localhost:5173`. Requires Supabase credentials to function — there is no full offline/demo mode once Supabase auth is active.

### 4. Build for production

```bash
npm run build
npm run preview  # local preview of production build
```

---

## External Services

| Service | Purpose | Project/Bucket |
|---|---|---|
| Supabase | Database, Auth, Realtime, Storage | Project ID: `rjgbnxaahmfyaasyqirp` |
| Vercel | Hosting, CI/CD auto-deploy from GitHub | Connected to `devaidusty/LightSquare` |
| GitHub | Source of truth | `https://github.com/devaidusty/LightSquare` |

### Supabase Dashboard
- Project: `https://supabase.com/dashboard/project/rjgbnxaahmfyaasyqirp`
- Auth users: Dashboard → Authentication → Users
- Realtime connections: Dashboard → Database → Replication
- Storage bucket: `product-images` (authenticated uploads only, RLS active)

### Vercel
- Auto-deploys on every push to the connected branch
- Environment variables must be set in Vercel project settings (not in `.env`)
- Live URL: `https://app.lightsquarepos.com`

---

## Creating the First Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click **Invite user** (enter email)
3. User receives invite email → sets password → logs in
4. The `handle_new_user` PostgreSQL trigger fires automatically on first login, creating their `store_settings` and `subscriptions` rows
5. To make a user the platform super-admin: their Supabase `auth.users` UUID must match the hardcoded God Mode UUID in `src/components/Sidebar.jsx:13` and `src/App.jsx:822`

**Public signups are currently enabled** — users can self-register at the login screen via the "Sign Up" tab. To disable this: Supabase Dashboard → Authentication → Providers → Email → uncheck "Enable email signups".

---

## Supabase Database — First-Time Setup

All migrations have already been applied to the live project. For a fresh Supabase project, run migrations in order (see `docs/db-schema.md` for the schema). Key RPCs and triggers that must exist:

- `checkout_cart(items jsonb)` — atomic stock decrement function
- `handle_new_user()` trigger on `auth.users` AFTER INSERT — provisions `store_settings` and `subscriptions` rows

---

## Default Staff PINs (Demo only — not in production DB)

The `src/data/initialData.js` file has seed data that is NOT loaded into the real database. The production database has live staff records set by the store owner.

| Name | PIN | Role |
|---|---|---|
| Admin Owner | 1234 | Owner |
| Maria Santos | 5678 | Manager |
| Juan Reyes | 9012 | Cashier |
| Ana Cruz | 3456 | Cashier (inactive) |
