# Changelog

Running log of every task, most recent first.

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

**Commits:** (pending)

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
