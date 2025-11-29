# Testing Guide - React Hooks Fix

**Date:** 2025-01-28
**Fix:** React hooks order violation in TaskDetailDialog

## ✅ Fix Completed

All 27 hooks now declared BEFORE guard clause (line 270):
- 18 useState hooks
- 8 useEffect hooks
- 1 useRef hook

## 🧪 Testing Steps

### 1. Clear Browser Cache (CRITICAL!)

**Chrome/Edge:**
```
1. Press F12 (open DevTools)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

**Or:**
```
1. Press Ctrl + Shift + Delete
2. Select "Cached images and files"
3. Click "Clear data"
4. Close and reopen browser
```

### 2. Stop and Restart Dev Server

```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Start fresh
npm run dev
```

### 3. Test TaskDetailDialog

**Open Dialog:**
1. Navigate to Workspace view
2. Click any task card
3. ✅ Dialog should open without errors
4. Check browser console (F12) → Should be clean

**Type in Description:**
1. Click "Add description" button
2. Type rapidly: "This is a test description"
3. Wait 1 second
4. ✅ Check console: "Description saved successfully"
5. ✅ No "Request failed" errors

**Close and Reopen Dialog:**
1. Click X to close dialog
2. Click same task again to reopen
3. ✅ No React hooks error
4. ✅ Description persists

**Change Status/Priority:**
1. Click status dropdown → Select "IN PROGRESS"
2. ✅ Toast: "Status changed to in-progress"
3. Click priority dropdown → Select "HIGH"
4. ✅ Toast: "Priority changed to high"

**Select Assignee:**
1. Click assignee dropdown
2. Select a user
3. ✅ Toast: "Assigned to [UserName]"

**Select Dates:**
1. Click "Start" date button → Select a date
2. ✅ Toast: "Start date updated"
3. Click "End" date button → Select a date
4. ✅ Toast: "Due date updated"

### 4. Verify No Errors

**Check Console (F12 → Console tab):**
- ✅ NO "Rendered more hooks" error
- ✅ NO "Request failed" errors
- ✅ Only warnings about findDOMNode (from react-draggable library, not our code)

**Check Network (F12 → Network tab):**
- ✅ Only 1 API call after typing description (debounced)
- ✅ All API calls return 200 OK

### 5. Build Test

```bash
npm run build
```

Expected output:
```
✓ 3534 modules transformed
✓ built in ~5s
```

## 🐛 If Still Seeing Errors

### Error: "Rendered more hooks than during the previous render"

**Cause:** Browser cache has old JavaScript bundle

**Solution:**
1. Hard refresh: Ctrl + Shift + R
2. Clear cache: Ctrl + Shift + Delete
3. Close ALL browser tabs
4. Restart browser
5. Navigate to http://localhost:5600

### Error: "Request failed" when typing

**Cause:** Debounce not working (old code loaded)

**Solution:**
1. Check file: `TaskDetailDialog.tsx` line 465-491
2. Verify `descriptionTimeoutRef` exists
3. Verify `setTimeout(..., 1000)` exists
4. Clear cache and reload

### Error: Port 5600 already in use

**Solution:**
```bash
# Windows
taskkill /F /IM node.exe

# Then restart
npm run dev
```

## 📊 Expected Results

### Console Output (Clean):
```
[vite] connected.
[vite] page reload src/components/TaskDetailDialog.tsx
✓ Description saved successfully
```

### No Errors:
- ❌ Rendered more hooks than during the previous render
- ❌ Error: Request failed
- ❌ TypeError: can't access property 'sprint', task is null

### Only Warnings (Acceptable):
- ⚠️ findDOMNode is deprecated (from react-draggable)
- ⚠️ Some chunks are larger than 500 kB (build optimization)

## 🎯 Success Criteria

- [ ] Dialog opens without errors
- [ ] Type description → 1 API call after 1 second
- [ ] Close/reopen dialog → No hooks error
- [ ] All status/priority/assignee/date changes work
- [ ] Console shows ZERO React errors
- [ ] Build completes successfully

## 📝 Code Summary

**Hooks Order (lines 99-267):**
```typescript
// 18 useState hooks
const [activeTab, setActiveTab] = useState('details');
const [status, setStatus] = useState(task?.status || 'todo');
// ... 16 more useState

// 8 useEffect hooks
useEffect(() => { /* dialog size */ }, [dialogSize]);
useEffect(() => { /* load comments */ }, [task?.id]);
useEffect(() => { /* save comments */ }, [comments, task?.id]);
useEffect(() => { /* fetch phases */ }, [task?.projectID]);
useEffect(() => { /* update phaseID */ }, [task?.phaseID]);
useEffect(() => { /* fetch users */ }, [open]);
useEffect(() => { /* ESC key */ }, [open, onOpenChange]);
useEffect(() => { /* cleanup timeout */ }, []);
useEffect(() => { /* sync task state */ }, [task?.id]); // NEW!

// 1 useRef hook
const descriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

// Guard clause AFTER all hooks
if (!task || !open) return null; // Line 270
```

## 🔧 Files Modified

- `TaskDetailDialog.tsx:245` - Moved useRef before guard clause
- `TaskDetailDialog.tsx:248-254` - Moved useEffect cleanup before guard clause
- `TaskDetailDialog.tsx:257-267` - Added useEffect to sync task state
- `TaskDetailDialog.tsx:270` - Guard clause after all hooks

## 📚 Related Docs

- [FINAL-FIX-REPORT-20251128.md](./FINAL-FIX-REPORT-20251128.md) - Complete fix report
- [react-hooks-order-fix.md](./react-hooks-order-fix.md) - Detailed explanation
- [description-debounce-fix.md](./description-debounce-fix.md) - Debounce pattern

## ✅ Checklist

Before marking as "TESTED":

- [ ] Cleared browser cache
- [ ] Restarted dev server
- [ ] Opened TaskDetailDialog
- [ ] Typed in description (debounce works)
- [ ] Closed/reopened dialog (no error)
- [ ] Changed status/priority (works)
- [ ] Console has ZERO React errors
- [ ] Build succeeds
