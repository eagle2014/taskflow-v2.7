# Logto Sign Out Fix

**Date:** 2025-01-28
**Issue:** Sign Out button was not clearing Logto SSO session, preventing re-login

## Problem

When users clicked the "Sign Out" button in [Header.tsx](../src/components/Header.tsx), the application only cleared local storage tokens via `authApi.logout()` but did NOT call Logto's `signOut()` method. This caused:

1. ✅ TaskFlow tokens cleared from localStorage
2. ❌ Logto SSO session remained active
3. ❌ User could not login again (Logto would auto-redirect without prompting credentials)

## Root Cause

The [App.tsx:51-56](../src/App.tsx#L51-L56) `handleSignOut` function was missing the Logto `signOut()` call:

```typescript
// BEFORE (Incomplete)
const handleSignOut = () => {
  authApi.logout();          // Only clears TaskFlow tokens
  setCurrentUser(null);
  setCurrentView('dashboard');
  window.location.href = '/'; // Redirects but Logto session still active
};
```

## Solution

Updated [App.tsx:52-69](../src/App.tsx#L52-L69) to properly clear both TaskFlow tokens AND Logto SSO session:

```typescript
// AFTER (Complete)
const handleSignOut = async () => {
  console.log('🔓 [App.tsx] Signing out...');

  // 1. Clear TaskFlow local storage tokens
  authApi.logout();
  setCurrentUser(null);
  setCurrentView('dashboard');

  // 2. Sign out from Logto to clear SSO session
  try {
    console.log('🔓 [App.tsx] Calling Logto signOut...');
    await logtoSignOut(window.location.origin);
  } catch (error) {
    console.error('❌ [App.tsx] Error signing out from Logto:', error);
    // Redirect anyway even if Logto signout fails
    window.location.href = '/';
  }
};
```

### Key Changes

1. **Import `useLogto` hook** ([App.tsx:3](../src/App.tsx#L3))
   ```typescript
   import { LogtoProvider, useLogto } from '@logto/react';
   ```

2. **Access `signOut` from `useLogto`** ([App.tsx:32](../src/App.tsx#L32))
   ```typescript
   const { signOut: logtoSignOut } = useLogto();
   ```

3. **Call Logto `signOut()` after clearing tokens** ([App.tsx:63](../src/App.tsx#L63))
   ```typescript
   await logtoSignOut(window.location.origin);
   ```

## How It Works

1. User clicks "Sign Out" button in Header
2. `handleSignOut()` is called
3. TaskFlow tokens are cleared from localStorage
4. Logto's `signOut()` is called with redirect URL (origin)
5. Logto clears SSO cookies and redirects to login page
6. User can now login again with credentials

## Testing

To verify the fix:

1. ✅ Login via Logto
2. ✅ Navigate to workspace
3. ✅ Click user menu → "Sign Out"
4. ✅ Should be redirected to login page
5. ✅ Click "Đăng nhập với Logto" again
6. ✅ Should prompt for credentials (NOT auto-login)

## Related Files

- [src/App.tsx](../src/App.tsx) - Added Logto signOut call
- [src/components/Header.tsx](../src/components/Header.tsx) - Sign out button
- [src/services/api.ts](../src/services/api.ts) - Token management
- [src/components/LogtoAuth.tsx](../src/components/LogtoAuth.tsx) - Logto authentication flow

## Notes

- Error handling: If Logto signOut fails, app still redirects to ensure user can logout
- Logging: Added console logs for debugging signout flow
- Async: `handleSignOut` is now async to await Logto signOut
