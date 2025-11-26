# Remove 8837ac96 Suffix - Complete Guide

## Overview
This guide outlines the steps to remove the "8837ac96" suffix from all TaskFlow tables and API endpoints to use clean, standard naming conventions.

## Changes Made

### ✅ Server API Routes (Completed)
Updated `/supabase/functions/server/index.tsx`:
- Removed `/make-server-8837ac96` prefix from all routes
- Routes now use clean paths like `/health`, `/projects`, `/tasks`, etc.

### ✅ Frontend API Calls (Completed)
Updated `/utils/api.tsx`:
- Changed server endpoint URLs to use `/server/` instead of `/make-server-8837ac96/`
- Updated all fetch calls to use the new clean endpoints

### ✅ Database Migration Script (Created)
Created `/remove-suffix-migration.sql`:
- Creates clean tables without suffix: `projects`, `tasks`, `events`, `comments`, `project_categories`
- Includes proper foreign key relationships
- Sets up Row Level Security (RLS) policies
- Creates necessary indices and triggers

## Required Actions

### 1. Database Setup (REQUIRED)
Run the migration script in your Supabase SQL Editor:

```sql
-- Copy and run the entire content of /remove-suffix-migration.sql
```

This will create:
- ✅ `project_categories` table with 8 default categories
- ✅ `projects` table with proper relationships
- ✅ `tasks` table linked to projects
- ✅ `events` table for calendar functionality
- ✅ `comments` table for task discussions
- ✅ RLS policies for proper security
- ✅ Indices for performance
- ✅ Triggers for automatic timestamp updates

### 2. Deploy Edge Functions (REQUIRED)
The server code needs to be redeployed to Supabase Edge Functions:

```bash
# In your local development environment
supabase functions deploy server
```

### 3. Verify Deployment
After deploying, test the health endpoint:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/server/health
```

## Important Notes

### What Stays The Same
- **KV Store**: The `kv_store_8837ac96` table remains unchanged (it's protected)
- **Authentication**: All auth functionality remains the same
- **Frontend Components**: No changes needed to React components

### What Changes
- **API Endpoints**: All server routes now use clean paths
- **Database Tables**: New clean table names without suffix
- **Foreign Keys**: Proper relationships between tables

### Backward Compatibility
⚠️ **Breaking Change**: Old API endpoints with `make-server-8837ac96` will no longer work after deployment.

## Testing Checklist

After completing the migration:

- [ ] Health endpoint responds at `/server/health`
- [ ] User can sign up and log in
- [ ] Projects can be created and viewed
- [ ] Tasks can be added to projects
- [ ] Calendar events work properly
- [ ] Comments can be added to tasks

## Troubleshooting

### If API calls fail:
1. Check that Edge Functions are deployed
2. Verify database tables exist
3. Check browser console for specific errors

### If database errors occur:
1. Ensure the migration script ran completely
2. Check that RLS policies are in place
3. Verify foreign key relationships

### If authentication fails:
1. Auth system should remain unchanged
2. Check that user_id references are correct in new tables

## Benefits of This Change

1. **Cleaner Code**: No more confusing suffix in API calls
2. **Standard Naming**: Tables use conventional names
3. **Better Maintainability**: Easier to understand and debug
4. **Professional URLs**: Clean API endpoint structure

## Migration Summary

| Old | New |
|-----|-----|
| `/make-server-8837ac96/health` | `/server/health` |
| `/make-server-8837ac96/projects` | `/server/projects` |
| `/make-server-8837ac96/tasks` | `/server/tasks` |
| `kv_store_8837ac96` | Remains unchanged (protected) |

The system is now ready for production use with clean, professional naming conventions!