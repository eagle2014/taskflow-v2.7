# TaskFlow Troubleshooting Guide

## Current Issues & Solutions

### 🚨 Foreign Key Relationship Errors

**Error:**
```
Could not find a relationship between 'projects' and 'project_categories'
Perhaps you meant 'projects_8837ac96' instead of 'projects'
```

**Root Cause:** The code uses clean table names but database has old suffixed tables or missing relationships.

**Solution:**
1. **Run `/FINAL_DATABASE_FIX.sql`** in Supabase SQL Editor
2. **Deploy Edge Functions:** `supabase functions deploy server`
3. **Refresh the app**

**Verification:**
- No foreign key errors in console
- Projects can be created successfully
- Tasks can be added to projects

---

### 🚨 React Ref Warning (Dialog)

**Error:**
```
Function components cannot be given refs. Attempts to access this ref will fail.
Check the render method of `SlotClone`.
```

**Root Cause:** Dialog overlay component needs proper ref forwarding.

**Solution:** ✅ **FIXED** - Updated DialogOverlay to use React.forwardRef

---

### 🚨 API Connection Issues

**Error:**
```
Failed to fetch
NetworkError
404 Not Found
```

**Root Cause:** Edge Functions not deployed or wrong endpoint.

**Solution:**
1. **Deploy server function:**
   ```bash
   supabase functions deploy server
   ```

2. **Test endpoint:**
   ```
   https://YOUR_PROJECT_ID.supabase.co/functions/v1/server/health
   ```

3. **Check function logs** in Supabase Dashboard

---

## Step-by-Step Fix Process

### 1. Database Fix (REQUIRED)
```sql
-- Run this entire script in Supabase SQL Editor
-- Copy from /FINAL_DATABASE_FIX.sql
```

Expected output:
```
✅ SUCCESS: Foreign key relationship between projects and project_categories exists
✅ SUCCESS: Project categories are populated
🎉 DATABASE MIGRATION COMPLETED
```

### 2. Edge Functions Deployment (REQUIRED)
```bash
# Option A: CLI
supabase functions deploy server

# Option B: Manual in Dashboard
# Edge Functions → Create "server" → Copy /supabase/functions/server/index.tsx
```

### 3. Verification Tests

**Test 1: Health Check**
```
GET https://YOUR_PROJECT_ID.supabase.co/functions/v1/server/health
Expected: {"status":"healthy","timestamp":"..."}
```

**Test 2: Project Creation**
1. Sign in to TaskFlow
2. Go to Projects
3. Click "New Project"
4. Fill form and submit
5. Should create without errors

**Test 3: Task Management**
1. Create a project (if not done)
2. Click on the project
3. Add a new task
4. Should work without foreign key errors

---

## Common Issues & Quick Fixes

### Issue: "Table doesn't exist"
**Fix:** Run the database migration script completely

### Issue: "Unauthorized" errors
**Fix:** Sign out and sign back in, or clear browser storage

### Issue: "Function not found"
**Fix:** Deploy Edge Functions to correct name "server"

### Issue: Categories not loading
**Fix:** Ensure project_categories table has data (check migration script)

### Issue: RLS policy errors
**Fix:** Database migration includes all necessary policies

---

## Database Structure After Fix

```
project_categories
├── id (TEXT, PRIMARY KEY)
├── name (TEXT)
├── description (TEXT)
└── color (TEXT)

projects
├── id (UUID, PRIMARY KEY)
├── name (TEXT)
├── category_id → project_categories.id
├── user_id → auth.users.id
└── ... other fields

tasks
├── id (UUID, PRIMARY KEY)
├── title (TEXT)
├── project_id → projects.id
├── user_id → auth.users.id
└── ... other fields

events
├── id (UUID, PRIMARY KEY)
├── title (TEXT)
├── task_id → tasks.id (optional)
├── user_id → auth.users.id
└── ... other fields

comments
├── id (UUID, PRIMARY KEY)
├── content (TEXT)
├── task_id → tasks.id
├── user_id → auth.users.id
└── ... other fields
```

---

## API Endpoints After Fix

```
Health:           GET  /server/health
Categories:       GET  /server/project-categories
Projects:         GET  /server/projects
                  POST /server/projects
Tasks:            GET  /server/tasks
                  POST /server/tasks
                  GET  /server/projects/:id/tasks
Events:           GET  /server/calendar/events
                  POST /server/events
                  GET  /server/tasks/:id/events
Comments:         GET  /server/tasks/:id/comments
                  POST /server/comments
Auth:             POST /server/auth/signup
```

---

## If Problems Persist

### 1. Check Browser Console
Look for specific error messages and check:
- Network tab for failed requests
- Console tab for JavaScript errors
- Application tab for authentication issues

### 2. Check Supabase Dashboard
- **Database → Tables:** Verify tables exist with proper structure
- **Edge Functions:** Ensure "server" function is deployed
- **Authentication:** Check if user sessions are working
- **Logs:** Review real-time logs for errors

### 3. Clear Application State
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
// Then refresh the page
```

### 4. Database Verification Script
Run `/verify-database-fix.sql` to check database structure:
```sql
-- This will show status of all tables and relationships
```

---

## Success Indicators

✅ **Database:** All tables exist with proper foreign keys  
✅ **API:** Health endpoint returns 200 OK  
✅ **Auth:** Can sign in/out without errors  
✅ **Projects:** Can create and view projects  
✅ **Tasks:** Can add tasks to projects  
✅ **Events:** Calendar functionality works  
✅ **UI:** No React warnings or errors  

When all indicators are green, TaskFlow is fully operational! 🎉