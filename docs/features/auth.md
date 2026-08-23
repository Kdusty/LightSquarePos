# Feature: Authentication

## What it does
Two independent layers of auth:

1. **Store auth** (Supabase Auth) — email/password gate that controls who can open the web app
2. **Staff PIN auth** (internal) — after store login, a LockScreen requires a 4-digit PIN to select which staff member is active for the current session

## Files

| File | Role |
|---|---|
| `src/hooks/useAuth.jsx` | AuthContext, AuthProvider, all Supabase auth calls |
| `src/components/LoginScreen.jsx` | Email/password UI with Sign In, Sign Up, and Recovery modes |
| `src/components/LockScreen.jsx` | Staff avatar + PIN selection UI |
| `src/main.jsx` | Wraps `<App>` in `<AuthProvider>` |
| `src/App.jsx` | Auth gate (line 49): `if (!user || recoveryMode) return <LoginScreen />` |
| `src/App.jsx` | `lockScreen` state; `setLockScreen(true)` to return to PIN screen |
| `src/App.jsx` | `can(action)` function (line 254): role-based feature gating using `currentUser.role` |

## Auth State Machine

```
Page load
  → authLoading = true → spinner
  → session found: user → MainApp → LockScreen (staff not selected)
  → no session: null → LoginScreen

LoginScreen
  → signIn() success → user set → MainApp renders → LockScreen shows
  → signUp() success → success message, user told to verify email
  → recoveryMode (URL hash) → "Secure Your Account" form

LockScreen (inside MainApp)
  → staff selects avatar + enters correct PIN → setCurrentUser(staff); setLockScreen(false)
  → Sidebar "Lock / Switch User" → handleLock() → setLockScreen(true); setCurrentUser(null)
```

## Session Persistence

Supabase stores the session JWT in `localStorage` automatically. On page reload, `getSession()` returns the cached session without a network call. Token refresh is handled automatically by the Supabase client.

## Role-Based Access (can() function)

The active permission check is the `can()` function defined inline in `App.jsx` (not `permissions.js`):

```js
const can = (action) => {
  const role = currentUser?.role;          // currentUser is the PIN-authenticated staff
  if (!role) return false;
  if (role === "owner") return true;        // Owner: everything
  if (role === "manager") {
    return ["pos", "kitchen", "inventory", "transactions",
            "analytics", "eod", "refund", "void"].includes(action);
  }
  return ["pos", "kitchen"].includes(action); // cashier
};
```

**Note:** `permissions.js` exists but is NOT imported by `App.jsx`. It is a reference file only — the inline `can()` function is the actual enforcer.

## BREAK RISK

| If you do this | This breaks |
|---|---|
| Comment out `if (!user || recoveryMode) return <LoginScreen />` in App.jsx | App is publicly accessible with no auth |
| Change `currentUser` to use `authUser` (Supabase user) instead of staff | Role-based feature gating breaks — Supabase user has no `role` field |
| Rename the `role` field in the `staff` table | `can()` returns false for all actions; entire app appears read-only |
| Disable RLS on any table | Supabase auth still works but tenants can read each other's data |
| Add a new view without a `can()` guard | All staff roles can access it regardless of permission |

## Dependencies

- `useStaff` — staff list used by LockScreen to show avatars and validate PINs
- Supabase Auth — manages JWT session; the `auth.users` table triggers tenant provisioning
- All data hooks — each calls `supabase.auth.getUser()` internally before writes to stamp `owner_id`
