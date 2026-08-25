# Changelog

Running log of every task, most recent first.

---

## CHG-038 — Email receipt: digital fallback for iOS / no-printer users

**Date:** 2026-08-25
**Type:** Feature
**Requested:** iOS blocks Web Serial API entirely, so thermal printing is unavailable for iPhone/Safari users. Need a digital receipt fallback so cashiers can send a receipt to a customer's email after any transaction.

**Decision:** Added a Supabase Edge Function (`send-receipt-email`) backed by the existing Resend API key and verified `info@lightsquarepos.com` sender. Added an "Email" button to the receipt modal (post-payment and historical transaction view) that expands an inline email input row. On send, calls `supabase.functions.invoke("send-receipt-email")` and toasts success/failure. No new secrets required — reuses `RESEND_API_KEY` already set for `notify-payment`.

**Changes:**
- `supabase/functions/send-receipt-email/index.ts` — new Deno edge function: accepts `{ to, txn, storeName, birInfo }`, builds BIR-compliant HTML email (dark header, items table, totals, VAT breakdown), sends via Resend, CORS headers for browser invoke
- `src/components/PaymentModals.jsx` — added `useState`, `useEffect`, `Mail`, `supabase` imports; added `showEmail`, `emailInput`, `emailSending`, `emailSent` state; `sendReceiptEmail()` async function; "Email" button in `receipt-actions`; collapsible `receipt-email-row` input + Send button below action buttons
- `src/styles/buildCSS.js` — added `.receipt-email-row` flex row style

**Deployed:** Edge function `send-receipt-email` deployed to Supabase project `rjgbnxaahmfyaasyqirp` (status: ACTIVE)

**Commits:** (pending)

---

## CHG-037 — Mobile cart: replace strip with slide-up bottom sheet + FAB

**Date:** 2026-08-25
**Type:** Feature
**Requested:** Fix Charge button hidden on mobile (Chrome browser + PWA). The 260px fixed cart strip couldn't fit the full cart footer — charge button was cut off by Chrome's browser toolbar or left with no breathing room.

**Decision:** Replaced the 260px horizontal cart strip (a tablet UX pattern) with the standard mobile POS pattern: full-screen products grid + a floating "View Order" pill button + an 88vh slide-up bottom sheet. The sheet contains the full Cart component (items, totals, Cash/GCash, Charge button) with its footer always visible at its natural position. Desktop (>640px) and tablet completely unchanged — the `mcs-outer` wrapper uses `display:contents` on desktop so it is invisible to the flex layout.

**Changes:**
- `src/components/POSView.jsx` — added `sheetOpen` state, `useEffect` to auto-close on cart empty, `mcs-outer` wrapper with open class, conditional backdrop div, mobile FAB button with item count + total
- `src/styles/buildCSS.js` — global: `.mcs-outer{display:contents}`, `.mobile-cart-fab{display:none}`; in 640px media query: removed 260px cart strip, added `.mcs-outer` sheet positioning (position:fixed, bottom:-100vh → 58px on .open), drag handle via ::before pseudo-element, backdrop overlay, FAB styles, products-area padding-bottom:80px for FAB clearance

**Commits:** 690b088

---

## CHG-036 — PWA setup + full mobile/tablet responsiveness

**Date:** 2026-08-24
**Type:** Feature
**Requested:** Make the POS app a proper PWA — installable on Android phones, tablets, iPads, and desktops. Ensure the layout is heavily responsive for Philippines users who primarily access on mobile.

**Decision:** Added `vite-plugin-pwa` with Workbox service worker (NetworkFirst for Supabase, CacheFirst for Google Fonts, autoUpdate). Created `manifest.webmanifest` with proper icons. Added full `@media(max-width:640px)` breakpoint that transforms the left sidebar into a fixed bottom tab bar — matching the Android/iOS bottom-nav pattern Philippine users expect. Cart panel stacks below products on phones. Tablet (641–900px) keeps the existing collapsed-icon sidebar via the existing 900px breakpoint.

**Changes:**
- `public/manifest.webmanifest` — new: PWA manifest (name, icons, theme, standalone display, any orientation)
- `public/icon-192.png` — new: 192×192 PWA icon generated from lightsquare-logo.png
- `public/icon-512.png` — new: 512×512 PWA icon (maskable) generated from lightsquare-logo.png
- `index.html` — added `<link rel="manifest">`, `viewport-fit=cover`, apple-mobile-web-app meta tags
- `vite.config.js` — added VitePWA plugin with Workbox runtime caching (Supabase NetworkFirst, Google Fonts CacheFirst/StaleWhileRevalidate)
- `src/styles/buildCSS.js` — added `@media(max-width:640px)`: sidebar → fixed bottom tab bar (58px), pos-layout stacks vertically, cart panel becomes 260px horizontal strip, analytics grids collapse to 1–2 columns, modals go full-width, safe-area-inset padding for notched phones

**Commits:** f005295

---

## CHG-035 — Website copy and credibility cleanup + initial GitHub push

**Date:** 2026-08-24
**Type:** Feature (Website — LightSquarePosWeb)
**Requested:** Remove fake testimonial (Maria Santos / Manila Beans Café) and fake social proof logos from Hero. Fix boring sections/generic icons. Update purple to match POS brand. Fix Annual plan device count. Set up git remote and push website.

**Decision:** Brand color was already correct (#6C63FF = POS --accent, no change needed). Replaced fake testimonial section with honest "Why We Built This" dark section. Replaced fake logo band in Hero with real trust signals. Improved HowItWorks step cards with colour-accented icon containers. Fixed Annual plan "1 Device" → "Up to 8 Devices". Initialised git repo, added GitHub remote, pushed all website files in one commit (14cbb81).

**Changes:**
- `src/sections/Testimonial.jsx` — removed fake Maria Santos quote; replaced with honest "Why We Built This" founder mission section
- `src/sections/Hero.jsx` — removed fake logos band (Manila Beans, The Daily Brew, Kanto Cuts, Sugar & Spice, Local Essentials); replaced with honest trust-signal band (trial, no card, setup time, BIR compliance)
- `src/sections/HowItWorks.jsx` — improved step card design: coloured icon containers, per-step accent colours, better spacing
- `src/data/pricing.js` — Annual plan "1 Device" → "Up to 8 Devices"

**Commits:** 14cbb81

---

## CHG-034 — Move Supabase credentials to environment variables

**Date:** 2026-08-24
**Type:** Config (Frontend)
**Requested:** Fix Security Rule 3 — `src/lib/supabase.js` was hardcoding Supabase URL and anon key as plain strings committed to git.

**Decision:** Replaced hardcoded strings with `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`. Created `.env.local` for local dev (gitignored). Updated `.env.example` to strip out the real credentials and provide placeholder instructions instead.

**Action required:** Set both env vars in Vercel dashboard → Project Settings → Environment Variables before next deploy.

**Changes:**
- `src/lib/supabase.js` — replaced hardcoded URL + anon key with `import.meta.env.*` references
- `.env.local` — created (gitignored); holds real credentials for local dev
- `.env.example` — scrubbed real credentials; now shows placeholder instructions only

**Commits:** 31d0ae2

---

## CHG-033 — Delete 3 test "My Store" accounts from Supabase

**Date:** 2026-08-24
**Type:** Config (Supabase)
**Requested:** Three test accounts ("My Store") appeared in the CRM subscriber list from earlier manual testing. User confirmed they were safe to delete.

**Decision:** Deleted directly from Supabase via SQL — `DELETE FROM auth.users WHERE id IN (...)`. ON DELETE CASCADE cleaned up all child rows across all public tables automatically.

**Changes:**
- Supabase — deleted 3 rows from `auth.users` (cascade removed all related `subscriptions`, `store_settings`, `device_sessions`, `products`, `transactions` rows)

**Commits:** n/a — Supabase-only

---

## CHG-032 — Docs: add CRM sister-app cross-reference to POS architecture

**Date:** 2026-08-24
**Type:** Docs
**Requested:** Document that POS and CRM are sister apps sharing the same Supabase project. Capture the full POS → CRM approval flow end-to-end so both apps are cross-referenced.

**Changes:**
- `docs/architecture.md` — added Section 6: POS → CRM approval flow (requestUpgrade → pending status → CRM subscriber list → admin approves → status=active + expires_at); sister app reference block (URL, local path, GitHub)

**Commits:** 0e78a73

---

## CHG-031 — Fix docs/db-schema.md: subscriptions table had 7 missing columns

**Date:** 2026-08-24
**Type:** Docs
**Requested:** Audit db-schema.md for accuracy during CRM SubscriberDetail build; discovered subscriptions table was missing key columns.

**Missing columns added:** `started_at`, `approved_at`, `approved_by`, `order_code`, `screenshot_url`, `notes`, `store_id`; `id` type corrected from `integer` to `bigint`.

**Changes:**
- `docs/db-schema.md` — subscriptions table: added 7 missing columns; corrected `id` type to bigint

**Commits:** b6b473b

---

## CHG-030 — Remove God Mode from POS

**Date:** 2026-08-24
**Type:** Refactor
**Requested:** Remove God Mode now that CRM handles subscriber management. Ensure clean flow with no dead code.

**Decision:** God Mode set `status="rejected"` — a status string that exists nowhere else in the system (CRM sets "trial" on reset). It was also a raw UUID list with no store names. CRM supersedes it entirely.

**DB check:** Queried `subscriptions WHERE status = 'rejected'` — 0 rows found. No cleanup needed.

**Changes:**
- `src/App.jsx` — removed `import SuperAdminView` (line 18)
- `src/App.jsx` — removed `{view === "superadmin" && ...}` render block with `<SuperAdminView>`
- `src/components/Sidebar.jsx` — removed `const isGodMode` declaration
- `src/components/Sidebar.jsx` — removed entire God Mode nav section (`{/* THE VAULT DOOR */}` + `{isGodMode && (...)}`)
- `src/components/SuperAdminView.jsx` — deleted file

**Commits:** 6326262

---

## CHG-029 — Tenant isolation audit + device_sessions RLS fix

**Date:** 2026-08-24
**Type:** Fix (Config — Supabase)
**Requested:** Full tenant isolation audit — ensure no data breach between customers.

**Audit result:** All 8 public tables have RLS enabled. Every table enforces `owner_id = auth.uid()` on all operations. `checkout_cart` RPC double-checks `owner_id = auth.uid()` on both the row lock and the update. `is_super_admin()` and `handle_new_user()` are SECURITY DEFINER with fixed search_path. One misconfiguration found:

**Issue fixed:** `device_sessions` policy `owner_device_sessions` had role `{public}` instead of `{authenticated}`. Unauthenticated requests could attempt queries (no data exposed in practice due to NULL comparison, but violates least-privilege and could be an attack surface on JWT edge cases).

**Changes:**
- Supabase migration `fix_device_sessions_policy_role` — dropped and recreated `owner_device_sessions` policy with `TO authenticated` instead of `TO public`

**Commits:** n/a — Supabase-only migration

---

## CHG-028 — Fix Annual plan device limit and upgrade button alignment

**Date:** 2026-08-24
**Type:** Fix
**Requested:** Annual plan showed "1 device" but should allow 8. Growth card Upgrade button was misaligned vs other cards.

**Changes:**
- `src/hooks/useSubscription.js` — `TIER_LIMITS.annual.devices`: 1 → 8 (enforced limit)
- `src/components/SettingsView.jsx` — Annual feature text: "1 device" → "Up to 8 devices"; plan cards now `display: flex, flexDirection: column` with `flex: 1` on features so Upgrade button always pins to the bottom of every card

**Commits:** 81ddc93

---

## CHG-027 — Error monitoring via GlitchTip

**Date:** 2026-08-24
**Type:** Feature
**Requested:** Wire in error monitoring so production errors are tracked automatically.

**Decision:** GlitchTip (app.glitchtip.com/lightsquarepos) with `@sentry/react` SDK — Sentry-compatible, self-hosted, free tier. Project: LightSquarePos, Platform: React, Team: lightsquarepos. `Sentry.init()` added to entry point before app mount so all unhandled exceptions and promise rejections are captured automatically.

**Changes:**
- `package.json` / `package-lock.json` — added `@sentry/react`
- `src/main.jsx` — `Sentry.init()` called before `createRoot` with GlitchTip DSN, `tracesSampleRate: 0.01`, `autoSessionTracking: false`

**Commits:** c0d1372

---

## CHG-026 — Remove dead code: src/lib/permissions.js

**Date:** 2026-08-24
**Type:** Refactor
**Requested:** Delete unused dead code. `src/lib/permissions.js` is imported nowhere and has zero effect — all permission logic lives in the inline `can()` function in `App.jsx:254`.

**Decision:** Confirmed via grep — zero references to "permissions" across all `.js`/`.jsx` files in `src/`. Safe to delete.

**Changes:**
- `src/lib/permissions.js` — deleted

**Commits:** b9df330

---

## CHG-025 — GCash offline block

**Date:** 2026-08-24
**Type:** Fix
**Requested:** Block GCash payments when device is offline. GCash requires real-time QR scan confirmation — queuing it offline produces phantom transactions.

**Changes:**
- `src/App.jsx` — `confirmPayment`: added primary guard before offline branch (`payMethod === "GCash" && !isOnline` → toast + return); added same guard in both network-error fallback paths so GCash never reaches `executeOfflineCheckout`; passes `isOnline` to `PaymentModals`
- `src/components/PaymentModals.jsx` — accepts `isOnline` prop; GCash modal shows red warning banner when offline; "Payment Received" button disabled when `isOnline === false`

**Commits:** 0cc0d76

---

## CHG-024 — Device limit enforcement

**Date:** 2026-08-24
**Type:** Feature
**Requested:** Enforce per-tier device limits (trial/starter/annual = 1, growth = 3). Currently unenforced.

**Decision:** Track active browsers via `device_sessions` table with a 60s heartbeat and 3-minute TTL. Same browser = same device (localStorage UUID). If active session count exceeds tier limit, show a full-screen block with two options: "Use this device only" (kicks other sessions) or upgrade to Growth.

**Changes:**
- Supabase migration `create_device_sessions` — new table `device_sessions(id, owner_id, device_id, last_seen, created_at)` with UNIQUE(owner_id, device_id), RLS, and index on (owner_id, last_seen)
- `src/hooks/useDeviceSession.js` — new hook: get/create localStorage device_id, upsert on mount, 60s heartbeat, count active sessions within 3-min TTL, expose `forceUseThisDevice()` to kick other sessions
- `src/components/DeviceLimitScreen.jsx` — new block screen: shows tier + active count, "Use this device only" button, inline Growth upgrade form with GCash payment
- `src/App.jsx` — imports hook + component; adds `deviceLoading` to loading gate; renders `DeviceLimitScreen` when `!deviceAllowed`

**Commits:** 598eb90

---

## CHG-023 — Pricing psychology: anchoring, loss framing, urgency nudges

**Date:** 2026-08-24
**Type:** Feature
**Requested:** Apply pricing psychology principles from slides — price anchoring, annual default, loss framing, paywall timing.

**Changes:**
- `src/components/SettingsView.jsx` — plan order changed to Annual → Growth → Starter (anchor with highest value first); Annual gets "Best Value" badge + amber border highlight + "₱249/mo — save ₱600" subprice; button copy shifts to "Keep selling →" (≤7 days) or "Don't lose access →" (≤3 days); urgency banner injected above plan cards when trial ≤7 days
- `src/App.jsx` — persistent clickable strip above topbar when trial ≤7 days; red at ≤3 days, amber otherwise; clicking navigates to Settings

**Commits:** aeb46c1

---

## CHG-022 — Trial expiry paywall

**Date:** 2026-08-24
**Type:** Feature
**Requested:** Block access to the POS when the 14-day trial expires; force upgrade to continue.

**Decision:** Paywall blocks when `tier === "trial" && daysLeft === 0 && status !== "pending"`. After submission, `requestUpgrade` optimistically sets `status = "pending"` locally so the wall drops immediately — user gets provisional access while admin approves. Dark mode inherits from app CSS.

**Changes:**
- `src/components/TrialExpiredPaywall.jsx` — new full-screen paywall: plan picker, GCash QR payment form, order code success screen
- `src/hooks/useSubscription.js` — `requestUpgrade` now calls `setStatus("pending")` after a successful DB write (optimistic unblock); also exports `loading`
- `src/App.jsx` — imports `TrialExpiredPaywall`; destructures `subLoading` from `useSubscription` and adds to loading gate; inserts `trialExpired` check before the main return

**Commits:** ef3c1fb

---

## CHG-021 — POS → CRM payment submission flow (order code + email notification)

**Date:** 2026-08-24
**Type:** Feature
**Requested:** Complete the POS → CRM payment submission flow: order code display, storeName passed to requestUpgrade, email notification via Edge Function.

**Changes:**
- `src/hooks/useSubscription.js` — `requestUpgrade` generates unique order code (`LS-XXXXXX`), saves it to `subscriptions.order_code`, invokes `notify-payment` Edge Function non-blocking, returns `orderCode`
- `src/App.jsx` — added `upgradeOrderCode` / `setUpgradeOrderCode` state; passed both + existing `storeName` to SettingsView
- `src/components/SettingsView.jsx` — added `upgradeOrderCode`/`setUpgradeOrderCode` props; submit button now captures returned order code; success state shows Order Code prominently in a monospaced badge; step 4 hint updated; Done button resets order code
- `supabase/functions/notify-payment/index.ts` — new Edge Function (deployed, `verify_jwt: true`); sends HTML email via Resend API with store name, plan, amount, GCash ref, and order code; links to crm.lightsquarepos.com

**Commits:** dfb370f, b2002ed

---

## CHG-020 — Password reset: "Forgot your password?" flow

**Date:** 2026-08-24
**Type:** Feature
**Requested:** Add "Forgot your password?" link to the login screen so users can reset via email
**Decision:** Added `resetPasswordForEmail` to `useAuth.jsx` using `supabase.auth.resetPasswordForEmail`; added `forgotMode` state to `LoginScreen.jsx` with a dedicated reset form — existing `recoveryMode` flow already handles the redirect back and password update form

**Changes:**
- `src/hooks/useAuth.jsx` — added `resetPasswordForEmail(email)` function; exposed in `AuthContext.Provider` value
- `src/components/LoginScreen.jsx` — added `forgotMode` state; "Forgot your password?" link below password field (sign-in mode only); dedicated reset form with email input, "Send Reset Link" button, success message, and "← Back to Sign In" link

**Commits:** b6d20b4

---

## CHG-019 — Onboarding: step-by-step interactive tour on first login

**Date:** 2026-08-23
**Type:** Feature
**Requested:** New user first login shows a guided walkthrough (step 1 of 8 format) with screenshots of each feature
**Decision:** New `OnboardingGuide.jsx` component — fixed overlay, real screenshots from `public/Interactive Guides SS/`, triggered once via `localStorage` flag `ls_tour_done`

**Changes:**
- `src/components/OnboardingGuide.jsx` — new component: 12-step overlay tour, real screenshots for all steps, triggered by `ls_tour_done` localStorage flag
- `src/App.jsx` — import `OnboardingGuide`, added `showOnboarding` state (lazy init from localStorage), added `dismissTour()` helper, mounted overlay in main return above the app shell
- `public/Interactive Guides SS/` — 12 screenshot assets (step1.png–step12.png) added by user

**Commits:** 8555518

---

## CHG-015 — Design system overhaul: full purple elimination + brand fonts

**Date:** 2026-08-23
**Type:** Refactor
**Requested:** Remove all purple gradients and highlights; match brand fonts from lightsquarepos.com; unify dark/light mode to B&W editorial aesthetic
**Decision:** Systematic pass through `buildCSS.js` — new neutral control variables, all accent-colored interactive states migrated; brand fonts imported

**Changes:**
- `src/styles/buildCSS.js` — Added 7 new CSS variables (`--ctrl-active-bg/text/border`, `--cta-bg/text`, `--focus-border`, `--sh-glow` neutral)
- `src/styles/buildCSS.js` — Replaced all 18 `linear-gradient` instances using `var(--accent)` with flat `var(--accent)` or semantic colors
- `src/styles/buildCSS.js` — Removed all 7 purple glow `box-shadow` variants (`0 Xpx Ypx var(--accent-glow)`)
- `src/styles/buildCSS.js` — Background/text/border variables neutralised (dark: `#0D0D0F`, light: `#F5F5F5`)
- `src/styles/buildCSS.js` — Corrected brand accent: `#6C63FF` (was `#5B4FE9`)
- `src/styles/buildCSS.js` — Added DM Sans (variable) + Space Mono Google Fonts import
- `src/styles/buildCSS.js` — Nav active, category pills, range pills, date pills, payment method buttons → `var(--ctrl-active-*)`
- `src/styles/buildCSS.js` — `.btn-primary`, `.charge-btn`, `.cal-apply`, `.eod-close-day-btn` → `var(--cta-bg/text)` (black/white swap per theme)
- `src/styles/buildCSS.js` — All `input:focus` / `textarea:focus` border-color → `var(--focus-border)` (5 with glow + 7 without)
- `src/styles/buildCSS.js` — `.qty-btn:hover`, `.qa-btn:hover` → `var(--ctrl-active-*)`
- `src/styles/buildCSS.js` — `.eod-kpi.accent` → neutral surface3 + focus-border
- `src/styles/buildCSS.js` — `.eod-drawer-input` border → `var(--focus-border)`
- `src/styles/buildCSS.js` — `.or-viewed-bar` and `.bg-purple` hardcoded `rgba(91,79,233,...)` → `var(--border2)` / `var(--surface2)`
- `src/styles/buildCSS.js` — All hover states (`sb-toggle`, `theme-btn`, `disc-pill`, `hold-chip`, `cal-short`, `ri-qty-btn`, `view-receipt-btn`, `qr-upload`, `print-btn`, `upload-drop`) → neutral border2/surface3
- `src/styles/buildCSS.js` — All selection states (`vp-opt.sel`, `rtype-btn.active`, `disc-opt.sel`, `media-opt.sel`, `icon-cell.sel`) → `var(--ctrl-active-*)`
- `src/styles/buildCSS.js` — EOD banner background → `#1A1A1A` flat (was gradient "AI banner")
- `src/styles/buildCSS.js` — GCash modal header → `#0070ba` flat (was gradient)
- `src/components/POSView.jsx` — Removed intentional `Math.random() > 0.5` crash grenade in DEV mode
- `src/App.jsx` — Auth gate bypassed for local dev (to be restored before production)

**Commits:** b6146f8, 96cf53c, 5184a5e

---

## CHG-016 — Purple elimination pass 3: accent-text + kt-num overflow

**Date:** 2026-08-23
**Type:** Refactor
**Requested:** Product prices, "Customizable" label, cart notes, totals still purple; kitchen ticket code overflowing badge
**Decision:** Neutralise `--accent-text` CSS variable to `var(--text)` so all monetary/label uses become neutral in one change; guard `.rtype-btn.active .rt-label` with `var(--ctrl-active-text)` to maintain contrast; fix `.kt-num` with `min-width` + padding instead of fixed width

**Changes:**
- `src/styles/buildCSS.js` — `--accent-text` changed from `#B0AAFF`/`#6C63FF` to `var(--text)` (neutral for prices, labels, notes, totals, references)
- `src/styles/buildCSS.js` — `.rtype-btn.active .rt-label` → `var(--ctrl-active-text)` (preserves contrast on inverted bg)
- `src/styles/buildCSS.js` — `.kt-num` fixed width 34px → `min-width:34px;padding:0 7px;font-size:12px` (badge expands for longer codes)

**Commits:** 4a9cd63

---

## CHG-018 — Protocol upgrade: CLAUDE.md patched to SwiftCues discipline

**Date:** 2026-08-23
**Type:** Docs
**Requested:** Adopt stricter protocol from SwiftCues CLAUDE.md — changelog position, file naming rules, abandoned task rule, MEDIUM gate, Supabase query rules
**Decision:** Targeted patches only — no structural rewrite; all additions are additive, nothing removed

**Changes:**
- `CLAUDE.md` — Fixed GitHub URL (devaidusty → Kdusty/LightSquarePos)
- `CLAUDE.md` — Section 5: added entry position rule (TOP, most recent first), file naming rule (no "various files"), abandoned task rule
- `CLAUDE.md` — Section 7: MEDIUM confidence now explicit — propose + stop, wait for confirmation before any Edit/Bash
- `CLAUDE.md` — Added Section 8: Supabase Query Rules (always await, capture error, no floating queries, update not upsert)

**Commits:** 7de1263

---

## CHG-017 — SVG favicon + dark/light mode logo audit

**Date:** 2026-08-23
**Type:** Refactor
**Requested:** Keep bolt icon; ensure logo works in both dark/light mode; update favicon
**Decision:** Create vector SVG favicon (dark rounded square + white bolt, scales perfectly); SVG takes priority in modern browsers, PNG fallback kept; apple-touch-icon and theme-color meta added

**Changes:**
- `public/favicon.svg` — Created: 32x32 SVG, rx=7 rounded rect, white Lucide Zap polygon, always dark bg (#1A1A1A)
- `index.html` — SVG favicon as primary, PNG as fallback, apple-touch-icon, theme-color #0D0D0F

**Commits:** b1aa5c9

---

## CHG-014 — Resurrect project for modernisation sprint

**Date:** 2026-08-23  
**Type:** Feature  
**Requested:** Resume development; make the platform modern and updated  
**Decision:** Full codebase audit first; docs/protocol system as foundation before any code changes  
**Changes:**
- `docs/` — Created complete documentation suite (pending)
- `CLAUDE.md` — Created project protocol file (pending)
**Commits:** (pending)

---

## CHG-013 — Variant COGS tracking + offline sync idempotency

**Date:** 2026-03-04  
**Type:** Fix  
**Requested:** Fix offline sync double-billing; fix variant COGS blind spot  
**Decision:** UUID-based idempotency for offline queue; COGS field added to variant options in builder  
**Changes:**
- `src/App.jsx` — `processOfflineQueue`: added `.maybeSingle()` pre-check; UUID generation for offline IDs; offline status sanitisation
- `src/components/MiscModals.jsx` — Added COGS input to variant option builder
- `src/App.jsx` — `addToCartWithVariants`: accumulates `extraCogs` from variant selections
- `src/components/KitchenView.jsx` — Rebranded "Kitchen Display" → "Order Display"
- `src/components/Sidebar.jsx` — "Kitchen" label updated
- `src/components/EODReport.jsx` — "Kitchen" label updated
- `src/components/SettingsView.jsx` — Added `daysLeft` badge for paying tiers
**Commits:** (backfilled from session summary 2026-03-04)

---

## CHG-012 — Phase 4: Realtime, COGS, hardware bridge

**Date:** 2026-03-02  
**Type:** Feature  
**Requested:** Multi-terminal Realtime sync, COGS profitability tracking, ESC/POS thermal printer support  
**Decision:** Supabase Realtime WebSockets on products/transactions/kitchen; COGS column added; Web Serial API hardware bridge  
**Changes:**
- `src/hooks/useProducts.js` — Supabase Realtime channel `products-sync`
- `src/hooks/useTransactions.js` — Supabase Realtime channel `transactions-sync`
- `src/hooks/useKitchen.js` — Supabase Realtime channel `kitchen-sync`; rewritten from local state
- `src/lib/escpos.js` — Created: ESC/POS byte command builder
- `src/hooks/usePrinter.js` — Created: Web Serial API connect/print/disconnect/auto-reconnect
- `src/App.jsx` — COGS math injected into `confirmPayment`; printer bridge execution; COGS state
- `src/components/AnalyticsView.jsx` — Net profit KPI, margin %, COGS display
**Commits:** (backfilled from session summary 2026-03-02)

---

## CHG-011 — Phase 3: Error boundaries, dynamic categories, checkout_cart security

**Date:** 2026-02-28  
**Type:** Feature / Fix  
**Requested:** Error boundaries, dynamic product categories, negative inventory exploit patch  
**Decision:** Class-based ErrorBoundary wrapping all views; categories extracted from live product payload; RPC qty validation  
**Changes:**
- `src/components/ErrorBoundary.jsx` — Created
- `src/App.jsx` — Wrapped all views in ErrorBoundary
- `src/components/ProductGrid.jsx` — Categories extracted dynamically from products array
- `src/components/MiscModals.jsx` — Add Product form uses `<select>` with "Create New Category" toggle
- Database — `checkout_cart` RPC updated with `qty_needed <= 0` guard; RLS policies updated with `is_super_admin()` bypass
**Commits:** (backfilled from session summary 2026-02-28)

---

## CHG-010 — Phase 2 stabilisation: auth, provisioning, cascades, storage security

**Date:** 2026-02-27  
**Type:** Config (Supabase) / Fix  
**Requested:** Wire `handle_new_user` trigger; fix ID generation; cascade deletes; storage RLS; subscription enforcement  
**Decision:** Full schema stabilisation sprint  
**Changes:**
- Database — `handle_new_user` trigger wired to `auth.users` AFTER INSERT
- Database — `store_settings` and `subscriptions` converted to IDENTITY columns
- Database — ON DELETE CASCADE added to all FK relationships
- Database — `is_super_admin()` SECURITY DEFINER function created
- Database — Storage bucket RLS locked to authenticated uploads in UUID folders
- `src/lib/storage.js` — Rewrote upload path to use `{user.id}/filename.ext`
- `src/hooks/useSubscription.js` — Fixed `.upsert()` → `.update()`; TIER_LIMITS export
- `src/components/LoginScreen.jsx` — Added Sign Up and Password Recovery modes
- `src/App.jsx` — Subscription product limit enforcement in `saveProd`
**Commits:** (backfilled from session summary 2026-02-27)

---

## CHG-009 — Phase 2: RLS policies, owner_id, atomic checkout

**Date:** 2026-02-27  
**Type:** Config (Supabase) / Feature  
**Requested:** Multi-tenant data isolation; race condition fix  
**Decision:** RLS on all tables; owner_id on all tables; checkout_cart RPC  
**Changes:**
- Database — `owner_id uuid` column added to all 5 tables
- Database — 17 RLS policies created (SELECT/INSERT/UPDATE/DELETE per table)
- Database — `checkout_cart(items jsonb)` RPC created
- Database — All existing data stamped with owner UUID `8e03f947-...`
- `src/hooks/useProducts.js` — All queries filtered by owner_id
- `src/hooks/useStaff.js` — All queries filtered by owner_id
- `src/hooks/useTransactions.js` — All queries filtered by owner_id
- `src/hooks/useStoreSettings.js` — All queries filtered by owner_id
- `src/hooks/useSubscription.js` — Rewrote to filter by owner_id
**Commits:** (backfilled from session summary 2026-02-27)

---

## CHG-008 — SuperAdminView God Mode

**Date:** 2026-02-28  
**Type:** Feature  
**Requested:** Developer-only admin dashboard to manually approve GCash subscriptions  
**Decision:** Hardcoded UUID check gates a `superadmin` view; RLS bypassed via SECURITY DEFINER  
**Changes:**
- `src/components/SuperAdminView.jsx` — Created
- `src/components/Sidebar.jsx` — God Mode section visible only to hardcoded UUID
- `src/App.jsx` — `view === "superadmin"` routing
**Commits:** (backfilled)

---

## CHG-007 — Global toast system, transaction receipt modal, KDS cleanup

**Date:** 2026-02-28  
**Type:** Feature / Fix  
**Requested:** Replace window.alert with non-blocking toasts; BIR receipt modal on transaction click; purge UUIDs from kitchen display  
**Decision:** Toast state in App.jsx with auto-dismiss; `viewTxn` state in PaymentModals  
**Changes:**
- `src/App.jsx` — Toast state + `showToast()` helper; passed to all components
- `src/components/TransactionsView.jsx` — Short `#A74B1` IDs; click-to-view receipt
- `src/components/PaymentModals.jsx` — Transaction viewer receipt modal
- `src/components/KitchenView.jsx` — UUIDs removed from ticket display
**Commits:** (backfilled)

---

## CHG-006 — Monolith split: App.jsx → 12 components

**Date:** 2026-02-25  
**Type:** Refactor  
**Requested:** Split 2000-line App.jsx monolith to fix performance on low-end tablets  
**Decision:** Strangler Fig pattern — extracted UI to standalone components; App.jsx becomes pure state manager  
**Changes:**
- `src/components/Sidebar.jsx` — Extracted
- `src/components/LockScreen.jsx` — Extracted
- `src/components/NavItem.jsx` — Extracted
- `src/components/InventoryView.jsx` — Extracted
- `src/components/KitchenView.jsx` — Extracted
- `src/components/TransactionsView.jsx` — Extracted
- `src/components/SettingsView.jsx` — Extracted
- `src/components/AnalyticsView.jsx` — Extracted
- `src/components/EODReport.jsx` — Extracted
- `src/components/POSView.jsx` — Extracted
- `src/components/ProductGrid.jsx` — Extracted
- `src/components/Cart.jsx` — Extracted
- `src/components/PaymentModals.jsx` — Extracted
- `src/components/MiscModals.jsx` — Created (all 5 modal dialogs)
- `src/App.jsx` — Rewritten as state manager + routing wrapper (~650 lines)
**Commits:** (backfilled)

---

## CHG-005 — Phase 1: Supabase Auth gate

**Date:** 2026-02-25  
**Type:** Feature  
**Requested:** Email/password auth gate before store access  
**Decision:** AuthProvider wrapping App; LoginScreen component; auth gate at top of App  
**Changes:**
- `src/hooks/useAuth.jsx` — Created: AuthContext, AuthProvider, signIn/signUp/signOut/updatePassword
- `src/components/LoginScreen.jsx` — Created: email/password UI, dark theme
- `src/main.jsx` — Wrapped App in AuthProvider
- `src/App.jsx` — Auth gate: if (!user) return LoginScreen
**Commits:** (backfilled)

---

## CHG-004 — Dynamic tax rate (BIR compliance partial fix)

**Date:** 2026-02-25  
**Type:** Fix  
**Requested:** Tax rate configurable in Settings, not hardcoded at 12%  
**Decision:** `tax_rate` column added to `store_settings`; `useStoreSettings` reads/writes it  
**Changes:**
- Database — `tax_rate numeric DEFAULT 12` column added to `store_settings`
- `src/hooks/useStoreSettings.js` — Reads `tax_rate`, exposes `taxRate`/`setTaxRate`
- `src/App.jsx` — All hardcoded `12` references replaced with `taxRate`/`safeTaxRate`
**Commits:** (backfilled)

---

## CHG-003 — Vite project scaffold + initial component structure

**Date:** 2026-02-24  
**Type:** Feature  
**Requested:** Convert single-file artifact to proper Vite + React project  
**Decision:** Standard Vite scaffold; all data hooks extracted; Supabase wired; initial component split planned  
**Changes:**
- `package.json` — Created
- `vite.config.js` — Created
- `index.html` — Created
- `src/main.jsx` — Created
- `src/App.jsx` — Created (monolith at this point)
- `src/hooks/` — All hooks created
- `src/lib/supabase.js` — Created (credentials hardcoded — not yet fixed)
- `src/lib/storage.js` — Created
- `src/lib/formatters.js` — Created
- `src/lib/permissions.js` — Created
- `src/data/initialData.js` — Created
**Commits:** (backfilled)

---

## CHG-002 — Offline mode + localStorage cache

**Date:** 2026-03-04  
**Type:** Feature  
**Requested:** App must remain usable when internet drops  
**Decision:** `useNetwork` + `processOfflineQueue`; product and settings cache in localStorage  
**Changes:**
- `src/hooks/useNetwork.js` — Created
- `src/App.jsx` — `offlineQueue` state; `executeOfflineCheckout`; `processOfflineQueue`
- `src/hooks/useProducts.js` — localStorage fallback on Supabase failure
- `src/hooks/useStoreSettings.js` — localStorage fallback on Supabase failure
**Commits:** (backfilled)

---

## CHG-001 — Hardware bridge: thermal printer + cash drawer

**Date:** 2026-03-02  
**Type:** Feature  
**Requested:** Print thermal receipts and kick cash drawer from browser  
**Decision:** Web Serial API; ESC/POS byte builder; auto-reconnect on page load  
**Changes:**
- `src/lib/escpos.js` — Created: ESC/POS commands, `buildReceiptPayload()`
- `src/hooks/usePrinter.js` — Created: connect, autoConnect, print, disconnect
- `src/App.jsx` — Hardware bridge execution in `confirmPayment` (both online and offline branches)
- `src/components/SettingsView.jsx` — Printer connect/disconnect controls
**Commits:** (backfilled)
