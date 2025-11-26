# 🔍 Debug Login Screen - Step by Step Guide

## Issue
Login screen không hiển thị khi truy cập http://localhost:3001

## Debug Tools Created

### 1. **Debug Console** (Recommended)
- **URL**: http://localhost:3001/debug.html
- **Features**:
  - Interactive test suite
  - LocalStorage inspection
  - API connectivity test
  - Component loading test
  - Test login button
  - Clear storage button
  - Load real app button

### 2. **Main Debug**
- **URL**: http://localhost:3001/test-main.html
- **Features**:
  - Logs all initialization steps
  - Shows localStorage contents
  - Tests App.tsx loading
  - Catches render errors

### 3. **Simple Debug**
- **URL**: http://localhost:3001/debug-frontend.html
- **Features**:
  - Basic connectivity tests
  - Module import tests

## Debug Steps

### Step 1: Open Debug Console
```
http://localhost:3001/debug.html
```

**What to check:**
1. Are all tests green (✅)?
2. Is "Current User" showing a user or "Not logged in"?
3. Check test results for any red (❌) errors

### Step 2: Check Browser Console
Press `F12` to open Chrome DevTools, go to **Console** tab.

**Look for:**
- ❌ Red error messages
- ⚠️ Yellow warnings
- 🔴 Failed network requests
- Module resolution errors

### Step 3: Check Network Tab
In DevTools, go to **Network** tab.

**Check:**
1. Is `main.tsx` loading? (200 status)
2. Is `App.tsx` loading? (200 status)
3. Is `SimpleAuthReal.tsx` loading? (200 status)
4. Is `sonner` package loading? (200 status)
5. Are there any 404 or 500 errors?

### Step 4: Check Application Tab
In DevTools, go to **Application** → **Local Storage** → `http://localhost:3001`

**Check values:**
- `taskflow_user` - Should be null or valid JSON
- `taskflow_access_token` - Should be null or valid JWT
- `taskflow_refresh_token` - Should be null or valid token
- `taskflow_site_code` - Should be null or "ACME"

**If you see old/invalid data**, click "Clear Storage" button in debug console.

### Step 5: Test Specific Components

#### Test authApi
In Console tab, run:
```javascript
import('/src/services/api.ts').then(({ authApi }) => {
  console.log('User:', authApi.getStoredUser());
  console.log('Authenticated:', authApi.isAuthenticated());
});
```

#### Test SimpleAuthReal
In Console tab, run:
```javascript
import('/src/components/SimpleAuthReal.tsx').then((module) => {
  console.log('SimpleAuthReal loaded:', module);
});
```

#### Test App
In Console tab, run:
```javascript
import('/src/App.tsx').then((module) => {
  console.log('App loaded:', module);
});
```

## Common Issues & Solutions

### Issue 1: Blank White Screen
**Symptoms:** Nothing renders, no errors visible
**Causes:**
- React render error not caught
- Component import failure
- CSS blocking render

**Solution:**
1. Open debug console: http://localhost:3001/debug.html
2. Check test results
3. Click "Clear Storage" if user data is corrupted
4. Click "Load Real App" to try rendering

### Issue 2: "Loading..." Stuck Forever
**Symptoms:** See loading spinner forever
**Causes:**
- `loading` state in App.tsx never set to false
- useEffect not running

**Solution:**
1. Check console for errors in useEffect
2. Check if authApi.getStoredUser() is hanging
3. Try clearing localStorage

### Issue 3: Jumps to Dashboard Instead of Login
**Symptoms:** Shows dashboard/main app instead of login
**Causes:**
- Old user data in localStorage
- `currentUser` is not null

**Solution:**
1. Open debug console
2. Check "Current User" status
3. Click "Clear Storage"
4. Reload page

### Issue 4: Module Not Found Errors
**Symptoms:** Console shows "Failed to resolve module..."
**Causes:**
- Import path incorrect
- File doesn't exist
- Circular dependency

**Solution:**
1. Check Network tab for 404 errors
2. Verify file exists in src/
3. Check import paths are correct

### Issue 5: Network Error - Backend Unreachable
**Symptoms:** Cannot connect to http://localhost:5001
**Causes:**
- Backend not running
- Port 5001 blocked
- CORS issues

**Solution:**
```bash
docker-compose ps  # Check backend status
docker logs taskflow-backend  # Check logs
docker restart taskflow-backend  # Restart if needed
```

## Manual Testing Checklist

### ✅ Pre-flight Checks
- [ ] Backend running: `docker-compose ps`
- [ ] Backend healthy: `curl http://localhost:5001/health`
- [ ] Frontend dev server running: Check port 3001
- [ ] No console errors: Open F12 → Console

### ✅ Component Tests
- [ ] App.tsx loads without errors
- [ ] SimpleAuthReal.tsx loads without errors
- [ ] authApi.getStoredUser() returns expected value
- [ ] I18nProvider doesn't throw errors

### ✅ Render Tests
- [ ] http://localhost:3001 loads HTML
- [ ] Root div exists in DOM
- [ ] React scripts injected
- [ ] No white screen of death

### ✅ Storage Tests
- [ ] localStorage accessible
- [ ] taskflow_user is null or valid
- [ ] Can clear and set values
- [ ] Session persistence works

## Advanced Debugging

### Enable React DevTools Profiler
1. Install React DevTools extension
2. Open Components tab
3. Check component tree
4. Look for error boundaries

### Add Breakpoints
In App.tsx, add breakpoint at line 28:
```typescript
const user = authApi.getStoredUser();  // <-- Add breakpoint here
```

### Network Throttling
Test with slow 3G to see loading states:
1. DevTools → Network tab
2. Select "Slow 3G" from dropdown
3. Reload page

## Expected Flow

### Normal Flow (No User)
```
1. index.html loads
2. main.tsx runs
3. App.tsx loads
4. useEffect runs
5. authApi.getStoredUser() returns null
6. currentUser = null
7. loading = false
8. Renders: <I18nProvider><SimpleAuthReal /></I18nProvider>
9. Login form visible ✅
```

### Flow (Has User)
```
1-5. Same as above
6. authApi.getStoredUser() returns User object
7. currentUser = {user data}
8. loading = false
9. Renders: Dashboard/Main App
10. Login form NOT visible (expected)
```

## Quick Fixes

### Reset Everything
```bash
# Clear browser
localStorage.clear()
location.reload()

# Restart services
docker-compose restart
```

### Force Login Screen
```javascript
// In console
localStorage.clear();
location.reload();
```

### Test Login Manually
```javascript
import('/src/services/api.ts').then(async ({ authApi }) => {
  const result = await authApi.login(
    'admin@acme.com',
    'admin123',
    'ACME'
  );
  console.log('Login result:', result);
  location.reload();
});
```

## Support Files

- `debug.html` - Main debug interface
- `test-main.html` - Main.tsx debug
- `debug-frontend.html` - Basic connectivity test
- `src/debug-app.tsx` - Debug React component
- `src/main-debug.tsx` - Debug entry point

## Next Steps

1. Start with **http://localhost:3001/debug.html**
2. Run all tests
3. Check for red errors
4. Clear storage if needed
5. Try "Load Real App"
6. If still broken, check console logs
7. Report findings with screenshots

---

**Created**: 2025-10-30
**Status**: Tools ready for debugging
**URL**: http://localhost:3001/debug.html
