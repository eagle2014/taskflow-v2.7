# Testing Guide: API Integration

**Date**: 2025-11-28
**Status**: Ready for Testing
**Related**: [API-INTEGRATION-COMPLETE.md](./API-INTEGRATION-COMPLETE.md)

## Overview

This guide provides step-by-step instructions to test the API integration that replaced mock data with real backend calls.

## Prerequisites

### 1. Backend Running
Backend API must be running on port 5001:
```bash
cd Backend/TaskFlow.API
dotnet run
```

**Expected output**:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5001
```

### 2. Frontend Running
Frontend dev server on port 5600:
```bash
npm run dev
```

**Expected output**:
```
VITE v7.2.4  ready in XXX ms
➜  Local:   http://localhost:5600/
```

### 3. Browser DevTools Open
- Open browser DevTools (F12)
- Navigate to Console tab
- Enable all log levels

## Test Procedure

### Step 1: Clear Browser Cache

**Why**: Ensure no stale mock data or old state

**How**:
1. Press `Ctrl + Shift + Delete` (Chrome/Edge)
2. Select "Cached images and files"
3. Select "All time"
4. Click "Clear data"
5. Or use DevTools: Application → Storage → Clear site data

### Step 2: Login to Application

1. Navigate to: http://localhost:5600
2. Use test credentials:
   - **Site Code**: `DEMO` or `ACME`
   - **Email**: `admin@demo.com` or `admin@acme.com`
   - **Password**: `Admin@2025!`
3. Click "Sign In"

**Expected**: Redirect to dashboard

### Step 3: Navigate to Workspace

1. Click on a project in the sidebar
2. Click "Workspace" tab or button
3. Wait for tasks to load

**Expected Console Logs**:
```javascript
✅ Loaded tasks from API: 26
✅ Converted to workspace tasks: 26
Sample task ID (GUID): 12345678-1234-1234-1234-123456789abc
```

**Verify**:
- [ ] Console shows "Loaded tasks from API" with count > 0
- [ ] Console shows "Converted to workspace tasks" with same count
- [ ] Sample task ID is valid GUID format (36 characters with dashes)

**If Failed**:
- Check Network tab for `/api/tasks` request
- Verify 200 OK response
- Check response body has `taskID` field (not `id`)

### Step 4: Open Task Detail Dialog

1. Click on any task in the workspace view
2. Task detail dialog should open

**Expected Console Logs**:
```javascript
// No error logs
// Task ID should be GUID format
```

**Verify**:
- [ ] Dialog opens without errors
- [ ] Task title displays correctly
- [ ] Task metadata (status, priority, dates) shows
- [ ] No "Invalid task ID format" error

**If Failed**:
- Check Console for "Invalid task ID format" error
- Verify task.id in dialog is GUID format
- Check if task data loaded correctly

### Step 5: Test Description Save

1. In task detail dialog, click description field
2. Type some text (e.g., "Test description update")
3. Wait 1 second (debounce delay)
4. Watch Network tab for PUT request

**Expected**:
- **Network tab**: `PUT /api/tasks/{guid}` request
- **Status**: `200 OK`
- **Response**: `{ success: true, data: {...}, message: "..." }`

**Console logs** (should NOT see):
- ❌ "Invalid task ID format"
- ❌ "Failed to save description"
- ❌ 400 Bad Request

**Verify**:
- [ ] PUT request sent after 1 second
- [ ] Request URL contains valid GUID
- [ ] Response is 200 OK (not 400)
- [ ] Toast notification shows "Description updated" (if implemented)

**If Failed**:
- **400 Bad Request**: Task ID format is wrong
  - Check request payload in Network tab
  - Verify `taskID` is GUID, not "task-1" or similar
  - Check GUID validation in [TaskDetailDialog.tsx:506-509](../src/components/TaskDetailDialog.tsx#L506-L509)

- **500 Internal Server Error**: Backend issue
  - Check backend console logs
  - Verify stored procedure exists
  - Check database connection

- **Network Error**: API not running
  - Restart backend: `cd Backend/TaskFlow.API && dotnet run`
  - Verify port 5001 is listening

### Step 6: Verify Data Persistence

1. Close task detail dialog
2. Refresh browser page (F5)
3. Re-login if needed
4. Open same task again

**Expected**:
- Description shows the text you typed earlier
- Data persisted in database

**Verify**:
- [ ] Description matches what was typed
- [ ] Changes survived page refresh

### Step 7: Test Multiple Tasks

Repeat Steps 4-6 with different tasks:
- Task with existing description
- Task with no description
- Task with special characters in description

**Verify**:
- [ ] All tasks load correctly
- [ ] All tasks show GUID IDs in console
- [ ] All description updates return 200 OK

## Success Criteria

All checkboxes above marked ✅ means API integration is working correctly.

## Common Issues

### Issue 1: Tasks Not Loading

**Symptoms**:
- Empty workspace
- No console logs for "Loaded tasks from API"

**Diagnosis**:
1. Check Network tab for `/api/tasks` request
2. Verify response status and data

**Solution**:
- If 401 Unauthorized: Check JWT token in localStorage
- If 500 Error: Check backend logs
- If no request: Check ProjectWorkspace.tsx fetch logic

### Issue 2: Invalid Task ID Format

**Symptoms**:
- Console error: "Invalid task ID format"
- Cannot save description

**Diagnosis**:
1. Check task.id value in console
2. Verify it's GUID format

**Solution**:
- Verify [ProjectWorkspace.tsx:1753](../src/components/ProjectWorkspace.tsx#L1753) uses `task.taskID`
- Check API response has `taskID` field
- Clear cache and reload

### Issue 3: Description Save Returns 400

**Symptoms**:
- PUT request returns 400 Bad Request
- Toast: "Failed to save description"

**Diagnosis**:
1. Check PUT request payload in Network tab
2. Verify `taskID` field is GUID

**Solution**:
- Ensure GUID validation passed (check console)
- Verify backend expects correct field names
- Check stored procedure parameters

### Issue 4: Description Not Saving

**Symptoms**:
- PUT request returns 200 OK
- But data doesn't persist

**Diagnosis**:
1. Check PUT response body
2. Query database directly

**Solution**:
- Verify stored procedure updates correctly
- Check database transaction commits
- Test with SQL query:
  ```sql
  SELECT TaskID, Title, Description
  FROM Tasks
  WHERE TaskID = 'your-task-guid'
  ```

## Database Verification (Optional)

If you want to verify data directly in database:

```bash
# Connect to remote SQL Server
sqlcmd -S 'kiena.vietgoat.com,400' -U sa -P 'DungNT@3003it' -C -d DB_PMS

# Query tasks
SELECT TOP 5 TaskID, Title, Description, Status, Priority
FROM Tasks
WHERE IsDeleted = 0
ORDER BY CreatedDate DESC
GO

# Exit
EXIT
```

**Expected**:
- All TaskID values are GUIDs (36 characters)
- Description field contains saved text

## Next Steps

After successful testing:
- [ ] Mark todo items as completed
- [ ] Document any issues found
- [ ] Update [API-INTEGRATION-COMPLETE.md](./API-INTEGRATION-COMPLETE.md) with test results
- [ ] Consider implementing TaskDetailDialog redesign (see [taskdetail-redesign-plan](./taskdetail-redesign-plan/README.md))

## Quick Reference

**Frontend**: http://localhost:5600
**Backend API**: http://localhost:5001/api
**Remote DB**: kiena.vietgoat.com,400 (DB_PMS)

**Test Credentials**:
- Site: `DEMO` / `ACME`
- Email: `admin@demo.com` / `admin@acme.com`
- Password: `Admin@2025!`

**Key Files**:
- API Integration: [ProjectWorkspace.tsx:1729-1778](../src/components/ProjectWorkspace.tsx#L1729-L1778)
- GUID Validation: [TaskDetailDialog.tsx:506-509](../src/components/TaskDetailDialog.tsx#L506-L509)
- API Client: [api.ts](../src/services/api.ts)

---

**Created**: 2025-11-28
**Last Updated**: 2025-11-28
