# Migration Plan: Mock Data → Real API

> **Created**: 2025-11-26
> **Repository**: https://github.com/eagle2014/taskflow-v2.7
> **Status**: ✅ COMPLETED (2025-11-26)

## Overview

Migrate frontend components from mock data (`mockApi.tsx`, `mockData.ts`) to real backend APIs (`api.ts`).

### Files Removed
- ~~`src/utils/mockApi.tsx`~~ (506 lines) - **DELETED**

### Files Kept (for workspace features)
- `src/data/mockData.ts` (1050 lines) - Used by workspace module
- `src/data/projectWorkspaceMockData.ts` (668 lines) - Workspace spaces/phases
- `src/components/TaskSeeder.tsx` - Database seeding utility

### Target API File
- `src/services/api.ts` - Contains all real API implementations

---

## Phase 1: Core APIs Migration (Auth, Projects, Tasks) ✅

| # | Task | Component | Status |
|---|------|-----------|--------|
| 1.1 | Update type definitions (camelCase → PascalCase, string → Guid) | `src/types/` | ✅ Done |
| 1.2 | Migrate Dashboard.tsx → api.ts | `src/components/Dashboard.tsx` | ✅ Done |
| 1.3 | Migrate Projects.tsx → api.ts | `src/components/Projects.tsx` | ✅ Done |
| 1.4 | Migrate MyTasks.tsx → api.ts | `src/components/MyTasks.tsx` | ✅ Done |
| 1.5 | Migrate KanbanBoard.tsx → api.ts | `src/components/KanbanBoard.tsx` | ✅ Done |

---

## Phase 2: Forms & Detail Views ✅

| # | Task | Component | Status |
|---|------|-----------|--------|
| 2.1 | Migrate NewTaskForm.tsx → api.ts | `src/components/NewTaskForm.tsx` | ✅ Done |
| 2.2 | Migrate EditTaskForm.tsx → api.ts | `src/components/EditTaskForm.tsx` | ✅ Done |
| 2.3 | Migrate TaskDetailView.tsx → api.ts | `src/components/TaskDetailView.tsx` | ✅ Done |
| 2.4 | Migrate NewProjectForm.tsx → api.ts | `src/components/NewProjectForm.tsx` | ✅ Done |
| 2.5 | Migrate ProjectDetail.tsx → api.ts | `src/components/ProjectDetail.tsx` | ✅ Done |

---

## Phase 3: Supporting Features ✅

| # | Task | Component/File | Status |
|---|------|----------------|--------|
| 3.1 | Migrate Calendar.tsx → eventsApi | `src/components/Calendar.tsx` | ✅ Done |
| 3.2 | Migrate Settings.tsx → usersApi | `src/components/Settings.tsx` | ✅ Done |
| 3.3 | Verify `usersApi` in api.ts | `src/services/api.ts` | ✅ Exists |
| 3.4 | Verify `categoriesApi` in api.ts | `src/services/api.ts` | ✅ Exists |
| 3.5 | Verify `commentsApi` in api.ts | `src/services/api.ts` | ✅ Exists |

---

## Phase 4: Workspace & Spaces ✅

| # | Task | Component/File | Status |
|---|------|----------------|--------|
| 4.1 | Verify `spacesApi` in api.ts | `src/services/api.ts` | ✅ Exists |
| 4.2 | Verify `phasesApi` in api.ts | `src/services/api.ts` | ✅ Exists |
| 4.3 | Migrate ProjectWorkspace.tsx → api.ts | `src/components/ProjectWorkspace.tsx` | ✅ Done |
| 4.4 | Migrate ProjectWorkspaceV1.tsx → api.ts | `src/components/ProjectWorkspaceV1.tsx` | ✅ Done |
| 4.5 | Migrate WorkspaceSidebar.tsx → api.ts | `src/components/workspace/WorkspaceSidebar.tsx` | ✅ Done |

**Note**: Workspace module still uses `projectWorkspaceMockData.ts` for local spaces/phases management. Full backend migration pending.

---

## Phase 5: Cleanup & Testing ✅

| # | Task | File | Status |
|---|------|------|--------|
| 5.1 | Delete `src/utils/mockApi.tsx` | - | ✅ Deleted |
| 5.2 | Keep `src/data/mockData.ts` (workspace) | - | ⏸️ Kept |
| 5.3 | Keep `src/components/TaskSeeder.tsx` | - | ⏸️ Kept |
| 5.4 | End-to-end testing all flows | - | 🔄 Pending |

---

## Additional Components Migrated

| Component | Changes |
|-----------|---------|
| `Header.tsx` | User type from api.ts |
| `KanbanStats.tsx` | Task type, dueDate field |
| `SimpleAuth.tsx` | authApi, User from api.ts |

---

## Backend API Endpoints Reference

### All APIs in `api.ts`
| API | Endpoints |
|-----|-----------|
| `authApi` | login, logout, getStoredUser |
| `projectsApi` | getAll, getById, create, update, delete |
| `tasksApi` | getAll, getById, getByProject, create, update, delete |
| `eventsApi` | getAll, getById, create, update, delete |
| `usersApi` | getAll, getById, update |
| `categoriesApi` | getAll, getById, create, update, delete |
| `commentsApi` | getByTask, getById, create, update, delete |
| `spacesApi` | getAll, getById, getByProject, create, update, delete, reorder |
| `phasesApi` | getAll, getById, getByProject, create, update, delete, reorder |

---

## Notes

- All API responses follow format: `{ success: bool, data: T, error?: string, message?: string }`
- Backend uses camelCase for JSON properties (configured in .NET)
- All entities have `SiteID` for multi-tenant isolation
- JWT token stored in `localStorage` with `taskflow_` prefix
- Field naming: `userID`, `projectID`, `taskID`, `categoryID`, `eventID` (camelCase)
