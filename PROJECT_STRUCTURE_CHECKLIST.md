# TaskFlow Project Structure Checklist

## 📋 Cấu trúc Dự án & Mapping Màn hình

### 🎯 FRONTEND STRUCTURE

#### **A. Authentication & Security**
| Folder/File | Màn hình/Chức năng | Route | Status |
|------------|-------------------|-------|--------|
| `src/components/LogtoAuth.tsx` | Màn hình đăng nhập OAuth/OIDC | `/` | ✅ Active |
| `src/components/SimpleAuthReal.tsx` | Màn hình đăng nhập Legacy (Email/Password) | - | 🔄 Legacy |
| `src/components/LogtoCallback.tsx` | Callback xử lý OAuth redirect | `/auth/callback` | ✅ Active |
| `src/config/logto.config.ts` | Cấu hình Logto OAuth | - | ✅ Config |

#### **B. Main Layout Components**
| Folder/File | Màn hình/Chức năng | Vị trí UI | Status |
|------------|-------------------|-----------|--------|
| `src/components/Sidebar.tsx` | Menu điều hướng chính | Bên trái màn hình | ✅ Active |
| `src/components/Header.tsx` | Thanh header (user info, signout) | Trên cùng màn hình | ✅ Active |
| `src/App.tsx` | Root component + Routing | - | ✅ Active |
| `src/components/ErrorBoundary.tsx` | Xử lý lỗi toàn hệ thống | - | ✅ Active |

#### **C. Main Workspace Views**
| Folder/File | Màn hình | Route | Sidebar Menu | Status |
|------------|---------|-------|--------------|--------|
| `src/components/Dashboard.tsx` | 🏠 **Dashboard** - Tổng quan dự án | `/workspace` (default) | Dashboard | ✅ Active |
| `src/components/Projects.tsx` | 📁 **Danh sách Projects** | `/workspace` (view=projects) | Projects | ✅ Active |
| `src/components/ProjectWorkspaceV1.tsx` | 🎨 **Project Workspace** - Không gian làm việc dự án | `/workspace` (view=project-workspace) | - | ✅ Active |
| `src/components/MyTasks.tsx` | ✅ **My Tasks** - Task của tôi | `/workspace` (view=my-tasks) | My Tasks | ✅ Active |
| `src/components/Calendar.tsx` | 📅 **Calendar** - Lịch làm việc | `/workspace` (view=calendar) | Calendar | ✅ Active |
| `src/components/Reports.tsx` | 📊 **Reports** - Báo cáo | `/workspace` (view=reports) | Reports | ✅ Active |
| `src/components/Team.tsx` | 👥 **Team** - Quản lý thành viên | `/workspace` (view=team) | Team | ✅ Active |
| `src/components/Settings.tsx` | ⚙️ **Settings** - Cài đặt | `/workspace` (view=settings) | Settings | ✅ Active |

#### **D. Project Workspace Module** (Chi tiết màn hình Project Workspace)
| Folder/File | Chức năng | Vị trí trong Workspace | Status |
|------------|----------|----------------------|--------|
| `src/components/workspace/index.tsx` | Wrapper component chính | - | ✅ Active |
| `src/components/workspace/WorkspaceSidebar.tsx` | Sidebar project (Spaces, Categories) | Bên trái | ✅ Active |
| `src/components/workspace/WorkspaceToolbar.tsx` | Toolbar (Views, Filters, Actions) | Trên cùng | ✅ Active |
| `src/components/workspace/WorkspaceListView.tsx` | List view tasks (Table view) | Nội dung chính | ✅ Active |
| `src/components/workspace/DraggableTaskRow.tsx` | Row task có drag & drop | Trong List view | ✅ Active |

#### **E. Task Management Components**
| Folder/File | Màn hình/Dialog | Trigger từ đâu | Status |
|------------|----------------|----------------|--------|
| `src/components/NewTaskDialog.tsx` | Dialog tạo task mới | Button "New Task" | ✅ Active |
| `src/components/EditTaskForm.tsx` | Form sửa task | Click vào task | ✅ Active |
| `src/components/TaskDetailDialog.tsx` | Dialog chi tiết task | Click task row | ✅ Active |
| `src/components/TaskDetailView.tsx` | View chi tiết task (full page) | - | 🔄 Partial |
| `src/components/KanbanBoard.tsx` | Board view (Kanban) | Workspace Toolbar | ✅ Active |
| `src/components/KanbanStats.tsx` | Thống kê Kanban | Trong KanbanBoard | ✅ Active |
| `src/components/TaskList.tsx` | Danh sách tasks (generic) | - | 🔄 Partial |

#### **F. Project Management Components**
| Folder/File | Màn hình/Dialog | Trigger từ đâu | Status |
|------------|----------------|----------------|--------|
| `src/components/NewProjectForm.tsx` | Dialog tạo project mới | Button "New Project" | ✅ Active |
| `src/components/ProjectDetail.tsx` | Chi tiết project | Click project card | 🔄 Partial |

#### **G. Advanced Views**
| Folder/File | Màn hình | Trigger từ đâu | Status |
|------------|---------|----------------|--------|
| `src/components/MindMapView.tsx` | Mind Map view | Workspace Toolbar | ✅ Active |
| `src/components/GanttChart.tsx` | Gantt Chart view | Workspace Toolbar | ⚠️ WIP |
| `src/components/Timeline.tsx` | Timeline view | Workspace Toolbar | ⚠️ WIP |
| `src/components/Workload.tsx` | Workload distribution | - | ⚠️ WIP |

#### **H. Supporting Components & Dialogs**
| Folder/File | Chức năng | Trigger từ đâu | Status |
|------------|----------|----------------|--------|
| `src/components/NewEventForm.tsx` | Tạo event calendar | Calendar view | ✅ Active |
| `src/components/AddMemberForm.tsx` | Thêm thành viên vào team | Team view | ✅ Active |
| `src/components/LinkTaskDialog.tsx` | Link tasks với nhau | Task detail | ⚠️ WIP |
| `src/components/LinkDocumentsDialog.tsx` | Link documents vào task | Task detail | ⚠️ WIP |
| `src/components/AddInvoiceDialog.tsx` | Thêm invoice | - | ⚠️ WIP |
| `src/components/UserManagement.tsx` | Quản lý users | Settings | ⚠️ WIP |

#### **I. UI Components Library** (`src/components/ui/`)
| Component | Mô tả | Nguồn | Status |
|-----------|-------|-------|--------|
| `badge.tsx` | Badge component | shadcn/ui | ✅ |
| `button.tsx` | Button component | shadcn/ui | ✅ |
| `card.tsx` | Card component | shadcn/ui | ✅ |
| `dialog.tsx` | Dialog/Modal component | shadcn/ui | ✅ |
| `dropdown-menu.tsx` | Dropdown menu | shadcn/ui | ✅ |
| `input.tsx` | Input field | shadcn/ui | ✅ |
| `select.tsx` | Select dropdown | shadcn/ui | ✅ |
| `textarea.tsx` | Textarea | shadcn/ui | ✅ |
| `calendar.tsx` | Calendar picker | shadcn/ui | ✅ |
| `popover.tsx` | Popover component | shadcn/ui | ✅ |
| `sonner.tsx` | Toast notifications | shadcn/ui | ✅ |
| `avatar.tsx` | Avatar component | shadcn/ui | ✅ |
| `checkbox.tsx` | Checkbox | shadcn/ui | ✅ |
| `label.tsx` | Label | shadcn/ui | ✅ |
| `tabs.tsx` | Tabs component | shadcn/ui | ✅ |
| `tooltip.tsx` | Tooltip | shadcn/ui | ✅ |
| `switch.tsx` | Toggle switch | shadcn/ui | ✅ |
| ... 14+ components khác | ... | shadcn/ui | ✅ |

#### **J. Services & API** (`src/services/`)
| File | Chức năng | Ghi chú | Status |
|------|----------|---------|--------|
| `api.ts` | API client chính + Auth logic | Auto token refresh | ✅ Active |
| `eventsAdapter.ts` | Adapter cho Calendar events | - | ✅ Active |

#### **K. Utilities & Helpers** (`src/`)
| Folder/File | Chức năng | Status |
|------------|----------|--------|
| `src/types/` | TypeScript type definitions | ✅ |
| `src/utils/i18n/` | Đa ngôn ngữ (i18n) | ✅ |
| `src/config/` | Configurations (Logto, etc) | ✅ |

---

### 🎯 BACKEND STRUCTURE

#### **A. Controllers** (`Backend/TaskFlow.API/Controllers/`)
| Controller | Endpoints | Màn hình Frontend tương ứng | Status |
|-----------|----------|----------------------------|--------|
| **AuthController.cs** | `/api/auth/login`, `/auth/refresh` | LogtoAuth, SimpleAuthReal | ✅ Active |
| **LogtoController.cs** | `/api/auth/logto/sync` | LogtoCallback | ✅ Active |
| **ProjectsController.cs** | `/api/projects/*` | Projects, Dashboard, ProjectWorkspace | ✅ Active |
| **TasksController.cs** | `/api/tasks/*` | MyTasks, WorkspaceListView, TaskDetailDialog | ✅ Active |
| **PhasesController.cs** | `/api/phases/*` | WorkspaceListView (phases filtering) | ✅ Active |
| **SpacesController.cs** | `/api/spaces/*` | WorkspaceSidebar (spaces tree) | ✅ Active |
| **CategoriesController.cs** | `/api/categories/*` | WorkspaceSidebar, Task forms | ✅ Active |
| **CommentsController.cs** | `/api/comments/*` | TaskDetailDialog (comments section) | ✅ Active |
| **EventsController.cs** | `/api/events/*` | Calendar | ✅ Active |
| **UsersController.cs** | `/api/users/*` | Team, UserManagement, Settings | ✅ Active |

#### **B. Models - Entities** (`Backend/TaskFlow.API/Models/Entities/`)
| Entity | Bảng DB | Sử dụng ở màn hình | Status |
|--------|---------|-------------------|--------|
| `Site.cs` | Sites | Multi-tenant context | ✅ |
| `User.cs` | Users | Team, Header, Auth | ✅ |
| `Project.cs` | Projects | Projects, Dashboard, Workspace | ✅ |
| `Task.cs` | Tasks | MyTasks, Workspace, Kanban | ✅ |
| `Phase.cs` | Phases | Workspace (phase filter) | ✅ |
| `Space.cs` | Spaces | WorkspaceSidebar | ✅ |
| `Category.cs` | Categories | WorkspaceSidebar, Task forms | ✅ |
| `Comment.cs` | Comments | TaskDetailDialog | ✅ |
| `CalendarEvent.cs` | CalendarEvents | Calendar | ✅ |
| `ProjectCategory.cs` | ProjectCategories | Junction table | ✅ |

#### **C. Models - DTOs** (`Backend/TaskFlow.API/Models/DTOs/`)
```
DTOs/
├── Auth/              → Login, Token, Refresh DTOs
├── Project/           → CreateProjectDto, UpdateProjectDto, ProjectDto
├── Task/              → CreateTaskDto, UpdateTaskDto, TaskDto
├── Phase/             → PhaseDtos
├── Space/             → SpaceDtos
├── Category/          → CategoryDto
├── Comment/           → CommentDtos
├── Event/             → EventDtos
└── User/              → UserDto, UpdateUserDto
```

#### **D. Repositories** (`Backend/TaskFlow.API/Repositories/`)
| Repository | Controller sử dụng | Pattern | Status |
|-----------|-------------------|---------|--------|
| `ProjectRepository.cs` | ProjectsController | Dapper ORM | ✅ |
| `TaskRepository.cs` | TasksController | Dapper ORM | ✅ |
| `PhaseRepository.cs` | PhasesController | Dapper ORM | ✅ |
| `SpaceRepository.cs` | SpacesController | Dapper ORM | ✅ |
| `CategoryRepository.cs` | CategoriesController | Dapper ORM | ✅ |
| `CommentRepository.cs` | CommentsController | Dapper ORM | ✅ |
| `EventRepository.cs` | EventsController | Dapper ORM | ✅ |
| `UserRepository.cs` | UsersController, AuthController | Dapper ORM | ✅ |

#### **E. Services** (`Backend/TaskFlow.API/Services/`)
| Service | Chức năng | Sử dụng ở | Status |
|---------|----------|-----------|--------|
| `AuthService.cs` | Xử lý authentication logic | AuthController | ✅ |
| `TokenManager.cs` | JWT token generation/validation | AuthController, Middleware | ✅ |

#### **F. Middleware** (`Backend/TaskFlow.API/Middleware/`)
| Middleware | Chức năng | Status |
|-----------|----------|--------|
| `ErrorHandlingMiddleware.cs` | Global error handling | ✅ |

---

### 🗄️ DATABASE STRUCTURE

#### **Database Scripts** (`Backend/Database/`)
| Script | Mô tả | Status |
|--------|-------|--------|
| `01_CreateDatabase.sql` | Tạo database | ✅ |
| `02_CreateTables.sql` | Tạo tables | ✅ |
| `03_CreateIndexes.sql` | Tạo indexes | ✅ |
| `04-16_StoredProcedures_*.sql` | Stored Procedures cho các entities | ✅ |
| `17-27_*.sql` | Migration scripts & updates | ✅ |
| `SeedData_RemoteDB.sql` | Seed data cho remote DB | ✅ |

---

### 🎨 ROUTING & NAVIGATION MAP

```
Root (/)
├─ /                           → LogtoAuth (Login screen)
├─ /auth/callback              → LogtoCallback (OAuth redirect)
└─ /workspace                  → Workspace (Main app)
    ├─ view=dashboard          → Dashboard
    ├─ view=projects           → Projects
    ├─ view=project-workspace  → ProjectWorkspace (fullscreen)
    ├─ view=my-tasks           → MyTasks
    ├─ view=calendar           → Calendar
    ├─ view=reports            → Reports
    ├─ view=team               → Team
    └─ view=settings           → Settings
```

---

### 📱 SCREEN FLOW & USER JOURNEY

```
1. Authentication Flow:
   LogtoAuth → Logto OAuth → LogtoCallback → Workspace (Dashboard)

2. Project Management Flow:
   Dashboard → Projects → ProjectWorkspace → Tasks Management
                                          ├─ List View
                                          ├─ Kanban View
                                          ├─ Mind Map View
                                          └─ Gantt Chart

3. Task Management Flow:
   MyTasks / Workspace → TaskDetailDialog → Edit/Comment/Link
                      ↓
                 NewTaskDialog → Create → Refresh View

4. Team Collaboration Flow:
   Calendar → NewEventForm → Create Event
   Team → AddMemberForm → Add Member
   TaskDetail → Comment → Add Comment
```

---

### 🔧 CONFIGURATION FILES

| File | Purpose | Status |
|------|---------|--------|
| `vite.config.ts` | Vite build config | ✅ |
| `vitest.config.ts` | Vitest test config | ✅ |
| `tailwind.config.js` | Tailwind CSS config | ✅ |
| `tsconfig.json` | TypeScript config | ✅ |
| `package.json` | NPM dependencies & scripts | ✅ |
| `Backend/TaskFlow.API/appsettings.json` | .NET app settings | ✅ |
| `Backend/TaskFlow.API/TaskFlow.API.csproj` | .NET project file | ✅ |

---

### 📊 COMPONENT DEPENDENCY GRAPH

```
App.tsx (Root)
└─ LogtoProvider
   └─ BrowserRouter
      ├─ LogtoAuth (/)
      ├─ LogtoCallback (/auth/callback)
      └─ Workspace (/workspace)
         ├─ Sidebar
         ├─ Header
         └─ Main Views
            ├─ Dashboard
            │  └─ ProjectCard (click) → navigate to Projects
            ├─ Projects
            │  ├─ NewProjectForm (dialog)
            │  └─ ProjectCard (click) → navigate to ProjectWorkspace
            ├─ ProjectWorkspace (fullscreen)
            │  ├─ WorkspaceSidebar
            │  │  ├─ Spaces Tree
            │  │  └─ Categories List
            │  ├─ WorkspaceToolbar
            │  │  ├─ View Switcher
            │  │  ├─ Filters
            │  │  └─ Actions
            │  └─ View Content
            │     ├─ WorkspaceListView
            │     │  ├─ DraggableTaskRow
            │     │  └─ TaskDetailDialog
            │     ├─ KanbanBoard
            │     │  └─ KanbanStats
            │     └─ MindMapView
            ├─ MyTasks
            │  └─ TaskDetailDialog
            ├─ Calendar
            │  └─ NewEventForm
            ├─ Reports
            ├─ Team
            │  └─ AddMemberForm
            └─ Settings
```

---

## ✅ STATUS LEGEND

- ✅ **Active**: Đang hoạt động, production-ready
- 🔄 **Partial**: Đã implement nhưng chưa hoàn chỉnh
- ⚠️ **WIP**: Work in Progress
- 🔄 **Legacy**: Code cũ, có thể deprecated

---

## 📝 NOTES

1. **Multi-tenant**: Tất cả các entity đều có `SiteID` để phân biệt tenant
2. **Authentication**: Dual-mode (Legacy JWT + Logto OAuth)
3. **State Management**: React hooks + local state (không dùng Redux/Zustand)
4. **API Pattern**: RESTful with standard response format
5. **Styling**: Tailwind CSS + shadcn/ui components
6. **Database**: SQL Server 2022 với Stored Procedures

---

## 🔗 RELATED DOCS

- [`README.md`](./README.md) - Hướng dẫn setup
- [`CLAUDE.md`](./CLAUDE.md) - Claude Code instructions
- [`docs/codebase-summary.md`](./docs/codebase-summary.md) - Chi tiết technical
- [`docs/logto-integration-guide.md`](./docs/logto-integration-guide.md) - Logto OAuth setup
- [`docs/design-guidelines.md`](./docs/design-guidelines.md) - UI/UX guidelines

---

**Generated:** 2025-11-27
**Project:** TaskFlow Multi-tenant Task Management System v2.7
**Tech Stack:** React 18 + TypeScript + .NET 8.0 + SQL Server 2022
