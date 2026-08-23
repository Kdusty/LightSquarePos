# Monitoring

## Current State

No automated error tracking service (e.g. Sentry) is connected. Monitoring is currently manual via Supabase logs and Vercel runtime logs.

---

## Checking Errors Right Now (No Setup Required)

### Supabase Logs
- Dashboard → **Logs** → choose log type:
  - **API Logs** — every query and RPC call with status codes; filter for 4xx/5xx
  - **Auth Logs** — login attempts, failures, invite events
  - **Edge Functions Logs** — N/A (no Edge Functions in use)
  - **Realtime Logs** — WebSocket connection events and errors

### Vercel Runtime Logs
- Vercel Dashboard → LightSquare project → **Functions** (or **Logs** tab)
- There are no server functions — this project is entirely client-side, so Vercel logs will only show build errors and edge network events
- Build failures: Dashboard → **Deployments** → failed deployment → **Build Logs**

### Browser Console
For production debugging, users can open DevTools → Console and share the output. Critical errors will appear here since `ErrorBoundary` logs the caught error to `console.error`.

---

## Errors That Must Alert Immediately

| Error | Symptom | How to catch it |
|---|---|---|
| Auth gate broken | All users locked out, can't log in | Login attempt returns 400/500 in Supabase Auth Logs |
| `checkout_cart` RPC down | Cashiers cannot complete any sale | 400/500 on `rpc/checkout_cart` in API Logs |
| Supabase project paused | Entire app returns network errors | Dashboard shows "Project paused" banner |
| Realtime connection limit hit | Stock/kitchen sync stops across fleet | Dashboard → Database → Replication → connection count |

---

## Watch but Don't Alert

- Individual failed Supabase queries (transient network, offline user)
- `autoConnectPrinter` failures — hardware not connected is expected
- Offline sync failures on individual transactions — the queue retries on reconnect
- Auth rate limit hits (email invite rate limit is 3/hour on free tier)

---

## Recommended: Add Sentry

When MRR justifies it, add Sentry for automatic error capture:

```bash
npm install @sentry/react
```

```js
// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.1,
});
```

Wrap `ErrorBoundary` calls with `Sentry.ErrorBoundary` for automatic capture of render crashes. Add `Sentry.captureException(err)` in catch blocks in `confirmPayment` and `processOfflineQueue`.

Priority errors to configure as Sentry alerts:
- Any error in `confirmPayment` (revenue impact)
- Any error in `processOfflineQueue` (data loss risk)
- `ErrorBoundary` catches on POS or Kitchen views (cashier blocked)

---

## How Errors Feed Back into incidents.md

For every production error that is confirmed (not a one-off browser quirk):

1. Open `docs/incidents.md`
2. Create a new INC entry with the next number
3. In the entry, note:
   - **Monitoring caught it:** "Yes — Supabase API logs showed 400 on `checkout_cart` at 14:32"
   - **Monitoring missed it:** "No — discovered via user report; Supabase logs confirmed post-hoc"
4. Fill in the investigation, fix, and commits fields once resolved

This creates a feedback loop: incidents that monitoring missed become the justification for adding alerts.
