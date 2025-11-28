# TaskFlow Components Explanation

## 📋 Bảng Giải Thích Chi Tiết Từng File TSX

---

## 🔐 AUTHENTICATION COMPONENTS

| File | Loại | Ý nghĩa & Chức năng | Input Props | Output/Actions |
|------|------|---------------------|-------------|----------------|
| **LogtoAuth.tsx** | Page | Màn hình đăng nhập OAuth 2.0/OIDC qua Logto. Hiển thị button "Sign in with Logto", xử lý authentication flow, redirect về callback sau khi đăng nhập thành công | - | Navigate to `/auth/callback` |
| **LogtoCallback.tsx** | Page | Xử lý OAuth callback sau khi user đăng nhập Logto. Nhận authorization code, sync user data với backend (`/api/auth/logto/sync`), lưu JWT token vào localStorage, redirect về workspace | - | Navigate to `/workspace` |
| **SimpleAuthReal.tsx** | Page (Legacy) | Màn hình đăng nhập cũ dạng email/password/siteCode. Gọi `/api/auth/login`, nhận JWT token, lưu vào localStorage. Dùng cho hệ thống cũ trước khi có Logto | - | Navigate to `/workspace` |
| **SimpleAuth.tsx** | Component | Component wrapper cho SimpleAuthReal, có thể là demo/mock version | - | - |

---

## 🏠 LAYOUT & NAVIGATION COMPONENTS

| File | Loại | Ý nghĩa & Chức năng | Input Props | Output/Actions |
|------|------|---------------------|-------------|----------------|
| **App.tsx** | Root Component | Component gốc của ứng dụng. Wrap toàn bộ app với LogtoProvider, I18nProvider, BrowserRouter. Định nghĩa routing structure (`/`, `/auth/callback`, `/workspace`). Force dark mode cho toàn app | - | Render routes |
| **Sidebar.tsx** | Layout Component | Menu điều hướng chính bên trái màn hình. Hiển thị các menu items: Dashboard, Projects, My Tasks, Calendar, Reports, Team, Settings. Highlight menu item đang active | `currentView: string`<br/>`onNavigate: (view) => void` | Emit navigate event |
| **Header.tsx** | Layout Component | Thanh header trên cùng màn hình. Hiển thị: Logo TaskFlow, breadcrumb/page title, user avatar & name, sign out button, notifications (nếu có) | `onSignOut: () => void`<br/>`user: User` | Emit signout event |
| **ErrorBoundary.tsx** | Wrapper Component | React Error Boundary để catch lỗi JavaScript runtime trong component tree. Hiển thị fallback UI khi có lỗi, prevent toàn bộ app crash | `children: ReactNode` | Render children or error UI |

---

## 📊 MAIN WORKSPACE PAGES

| File | Loại | Ý nghĩa & Chức năng | Input Props | Output/Actions |
|------|------|---------------------|-------------|----------------|
| **Dashboard.tsx** | Page | Trang tổng quan chính. Hiển thị: stats cards (total projects, active tasks, completed tasks), recent projects grid, quick actions, activity timeline. Entry point sau khi login | `onNavigate: (view) => void`<br/>`currentUser: User` | Navigate to other views |
| **Projects.tsx** | Page | Trang danh sách tất cả projects của user. Hiển thị project cards dạng grid, có search/filter, button "New Project". Click vào project card → navigate to ProjectWorkspace | `onNavigate: (view) => void`<br/>`onSelectProject: (id) => void`<br/>`currentUser: User` | Select project, create project |
| **ProjectWorkspace.tsx** | Page (Fullscreen) | Không gian làm việc chính của 1 project (alias cho ProjectWorkspaceV1). Fullscreen mode không có sidebar chính. Bao gồm: WorkspaceSidebar (spaces/categories), WorkspaceToolbar (view switcher, filters), main content area (List/Kanban/MindMap views) | `currentUser: User`<br/>`onBack: () => void` | Manage tasks in project |
| **ProjectWorkspaceV1.tsx** | Page | Version 1 của Project Workspace. Component chính để làm việc với tasks trong 1 project. Tích hợp WorkspaceSidebar, WorkspaceToolbar, WorkspaceListView, KanbanBoard, MindMapView. Quản lý state cho toàn bộ workspace | `currentUser: User`<br/>`onBack: () => void` | CRUD tasks, switch views |
| **MyTasks.tsx** | Page | Trang hiển thị tất cả tasks được assign cho current user (across all projects). Filter theo status (todo/in-progress/done), sort theo priority/deadline. Click task → mở TaskDetailDialog | `currentUser: User` | View & manage personal tasks |
| **Calendar.tsx** | Page | Trang lịch làm việc dạng month/week/day view. Hiển thị tasks theo deadline, calendar events, meetings. Click vào ngày → mở NewEventForm. Drag & drop để change task deadline | `currentUser: User` | View & create events |
| **Reports.tsx** | Page | Trang báo cáo & analytics. Hiển thị charts: task completion rate, project progress, team performance, time tracking. Export reports ra PDF/Excel | - | View analytics |
| **Team.tsx** | Page | Trang quản lý team members. Hiển thị danh sách users trong site, roles, permissions. Button "Add Member" → mở AddMemberForm. Edit user roles, deactivate users | - | Manage team members |
| **Settings.tsx** | Page | Trang cài đặt user. Các tabs: Profile (edit name, email, avatar), Preferences (theme, language, notifications), Security (change password), Integrations (API keys) | `currentUser: User` | Update user settings |

---

## 🎨 PROJECT WORKSPACE SUB-COMPONENTS

| File | Loại | Ý nghĩa & Chức năng | Input Props | Output/Actions |
|------|------|---------------------|-------------|----------------|
| **workspace/index.tsx** | Wrapper | Wrapper component export tất cả workspace components. Re-export WorkspaceSidebar, WorkspaceToolbar, WorkspaceListView để dễ import | - | - |
| **workspace/WorkspaceSidebar.tsx** | Component | Sidebar bên trái trong Project Workspace. 2 sections chính: (1) Spaces tree (hierarchical folders), (2) Categories list (tags/labels). Click space/category → filter tasks. Collapse/expand tree | `projectId: string`<br/>`selectedSpace?: string`<br/>`selectedCategory?: string`<br/>`onSelectSpace: (id) => void`<br/>`onSelectCategory: (id) => void` | Filter tasks by space/category |
| **workspace/WorkspaceToolbar.tsx** | Component | Toolbar trên cùng trong Project Workspace. Chứa: (1) View switcher (List/Kanban/MindMap/Gantt), (2) Filters (status, assignee, priority), (3) Sort options, (4) Search box, (5) "New Task" button | `currentView: string`<br/>`onViewChange: (view) => void`<br/>`onFilterChange: (filters) => void`<br/>`onNewTask: () => void` | Switch view, apply filters |
| **workspace/WorkspaceListView.tsx** | Component | List view chính hiển thị tasks dạng table. Columns: checkbox, task name, assignee, status, priority, due date, actions. Support: row selection, bulk actions, inline edit, drag & drop reorder. Virtual scrolling cho performance | `tasks: Task[]`<br/>`onTaskClick: (task) => void`<br/>`onTaskUpdate: (task) => void`<br/>`onTaskDelete: (id) => void` | Render task list, CRUD tasks |
| **workspace/DraggableTaskRow.tsx** | Component | Single task row trong WorkspaceListView. Support drag & drop để reorder hoặc move sang khác space/category. Có hover effect, context menu (right click), inline edit cho task name | `task: Task`<br/>`index: number`<br/>`onClick: () => void`<br/>`onUpdate: (task) => void` | Render task row, drag & drop |

---

## ✅ TASK MANAGEMENT COMPONENTS

| File | Loại | Ý nghĩa & Chức năng | Input Props | Output/Actions |
|------|------|---------------------|-------------|----------------|
| **NewTaskDialog.tsx** | Dialog | Dialog tạo task mới. Form fields: task name (required), description (rich text), assignee (select user), status (todo/in-progress/done), priority (low/medium/high), due date (date picker), space (select), categories (multi-select). Buttons: Cancel, Create | `open: boolean`<br/>`projectId: string`<br/>`onClose: () => void`<br/>`onTaskCreated: (task) => void` | POST `/api/tasks`, emit created event |
| **EditTaskForm.tsx** | Form Component | Form sửa task hiện có. Giống NewTaskDialog nhưng pre-fill data. Thêm fields: created date, updated date, created by. Track changes để highlight modified fields. Auto-save on blur (optional) | `task: Task`<br/>`onSave: (task) => void`<br/>`onCancel: () => void` | PUT `/api/tasks/{id}` |
| **TaskDetailDialog.tsx** | Dialog | Dialog chi tiết task (side panel hoặc modal). 3 sections: (1) Task info (name, desc, assignee, status, priority, dates), (2) Comments section (add/view comments), (3) Activity log (history changes). Buttons: Edit, Delete, Close | `open: boolean`<br/>`taskId: string`<br/>`onClose: () => void`<br/>`onEdit: () => void`<br/>`onDelete: () => void` | GET `/api/tasks/{id}`, show details |
| **TaskDetailView.tsx** | Page | Full page view cho task detail (thay vì dialog). Có thể dùng khi cần nhiều space hơn (attach files, link tasks, subtasks). Layout rộng hơn TaskDetailDialog | `taskId: string` | Display full task details |
| **TaskList.tsx** | Component | Generic component hiển thị danh sách tasks. Có thể reuse ở nhiều nơi (Dashboard, MyTasks, Search results). Simpler than WorkspaceListView, không có drag & drop | `tasks: Task[]`<br/>`onTaskClick: (task) => void` | Render task list |

---

## 📁 PROJECT MANAGEMENT COMPONENTS

| File | Loại | Ý nghĩa & Chức năng | Input Props | Output/Actions |
|------|------|---------------------|-------------|----------------|
| **NewProjectForm.tsx** | Dialog | Dialog tạo project mới. Form fields: project name (required), description, color (color picker), icon (icon picker), start date, end date, categories (multi-select), members (multi-select users). Template options (empty, marketing, development) | `open: boolean`<br/>`onClose: () => void`<br/>`onProjectCreated: (project) => void` | POST `/api/projects`, emit created event |
| **ProjectDetail.tsx** | Page/Dialog | Chi tiết project. Hiển thị: project info, members list, stats (total tasks, completed %), recent activity, quick actions (edit, archive, delete). Có thể là page hoặc dialog tuỳ context | `projectId: string`<br/>`onEdit: () => void` | GET `/api/projects/{id}` |

---

## �� ADVANCED VIEWS

| File | Loại | Ý nghĩa & Chức năng | Input Props | Output/Actions |
|------|------|---------------------|-------------|----------------|
| **KanbanBoard.tsx** | Component | Kanban board view (columnar layout). Columns: Todo, In Progress, In Review, Done. Drag & drop tasks giữa các columns để change status. Có WIP limits, collapsed columns, swim lanes (optional). Live update khi có changes | `tasks: Task[]`<br/>`onTaskUpdate: (task) => void`<br/>`onTaskClick: (task) => void` | Render kanban, drag & drop |
| **KanbanStats.tsx** | Component | Stats widget trong KanbanBoard. Hiển thị: total tasks, tasks per column, cycle time, throughput, cumulative flow diagram (mini chart). Refresh real-time | `tasks: Task[]` | Display kanban metrics |
| **MindMapView.tsx** | Component | Mind map view hiển thị tasks dạng tree/graph. Root = project, branches = spaces/categories, leaves = tasks. Interactive: zoom, pan, drag nodes, click node → open task detail. Dùng library như D3.js hoặc ReactFlow | `tasks: Task[]`<br/>`spaces: Space[]`<br/>`onTaskClick: (task) => void` | Render mind map |
| **GanttChart.tsx** | Component | Gantt chart view hiển thị tasks theo timeline. Horizontal bars = task duration (start → end date). Dependencies (arrows connecting tasks), critical path highlighting. Drag bars để adjust dates. Export to image | `tasks: Task[]`<br/>`onTaskUpdate: (task) => void` | Render gantt chart |
| **Timeline.tsx** | Component | Timeline view (vertical hoặc horizontal). Events theo thời gian: task created, task completed, milestones, deadlines. Filter by date range. Có thể khác với Calendar (focus on task events vs calendar events) | `tasks: Task[]`<br/>`events: CalendarEvent[]` | Render timeline |
| **Workload.tsx** | Component | Workload distribution view. Hiển thị số tasks assigned cho mỗi user. Bar chart hoặc heatmap. Detect overallocation (user có quá nhiều tasks). Rebalance workload (drag tasks sang user khác) | `tasks: Task[]`<br/>`users: User[]` | Visualize workload |

---

## 📅 CALENDAR & EVENTS COMPONENTS

| File | Loại | Ý nghĩa & Chức năng | Input Props | Output/Actions |
|------|------|---------------------|-------------|----------------|
| **NewEventForm.tsx** | Dialog | Dialog tạo calendar event mới. Form fields: event title, description, start date/time, end date/time, all-day toggle, attendees (select users), reminder (15min, 1hr, 1day), recurrence (daily, weekly, monthly). Integrate với Calendar | `open: boolean`<br/>`defaultDate?: Date`<br/>`onClose: () => void`<br/>`onEventCreated: (event) => void` | POST `/api/events` |

---

## 👥 TEAM & USER COMPONENTS

| File | Loại | Ý nghĩa & Chức năng | Input Props | Output/Actions |
|------|------|---------------------|-------------|----------------|
| **AddMemberForm.tsx** | Dialog | Dialog thêm member vào team/project. Form fields: email (required), role (Admin, Member, Viewer), projects to assign (multi-select). Send invitation email. Có thể invite nhiều users cùng lúc (bulk invite) | `open: boolean`<br/>`projectId?: string`<br/>`onClose: () => void`<br/>`onMemberAdded: (user) => void` | POST `/api/users/invite` |
| **UserManagement.tsx** | Page/Component | Quản lý users trong site (admin only). Table: user list với columns (name, email, role, status, last login, actions). Actions: edit role, deactivate, delete, reset password. Pagination, search, filter by role | - | CRUD users |

---

## 🔗 LINKING & RELATIONS COMPONENTS

| File | Loại | Ý nghĩa & Chức năng | Input Props | Output/Actions |
|------|------|---------------------|-------------|----------------|
| **LinkTaskDialog.tsx** | Dialog | Dialog link task hiện tại với task khác. Relationship types: blocks, is blocked by, relates to, duplicates, parent/child. Search tasks để link. Hiển thị linked tasks list, unlink button. Graph visualization (optional) | `open: boolean`<br/>`currentTaskId: string`<br/>`onClose: () => void`<br/>`onTaskLinked: () => void` | POST `/api/tasks/{id}/links` |
| **LinkDocumentsDialog.tsx** | Dialog | Dialog attach documents/files vào task. Upload files (drag & drop), link external URLs (Google Drive, Dropbox), search existing documents. File preview, download. Manage permissions (who can view) | `open: boolean`<br/>`taskId: string`<br/>`onClose: () => void`<br/>`onDocumentLinked: () => void` | POST `/api/tasks/{id}/documents` |

---

## 💰 BILLING & INVOICES COMPONENTS

| File | Loại | Ý nghĩa & Chức năng | Input Props | Output/Actions |
|------|------|---------------------|-------------|----------------|
| **AddInvoiceDialog.tsx** | Dialog | Dialog tạo invoice cho project/task. Form fields: invoice number (auto-generated), client (select), items (tasks/services + price), subtotal, tax, total, due date, payment terms. Generate PDF invoice | `open: boolean`<br/>`projectId?: string`<br/>`onClose: () => void`<br/>`onInvoiceCreated: (invoice) => void` | POST `/api/invoices` (if endpoint exists) |

---

## 🛠️ UTILITY & HELPER COMPONENTS

| File | Loại | Ý nghĩa & Chức năng | Input Props | Output/Actions |
|------|------|---------------------|-------------|----------------|
| **TaskSeeder.tsx** | Utility Component | Dev tool để seed fake tasks vào database. Generate random tasks với random names, assignees, statuses, priorities, dates. Dùng để test performance, UI với nhiều data. Production: disable/hide component này | `projectId: string` | POST bulk tasks to API |
| **DebugGuide.tsx** | Utility Component | Dev tool hiển thị debug info: current route, user info, localStorage contents, API base URL, environment variables. Toggle debug mode. Production: disable | - | Display debug info |
| **DeploymentHelper.tsx** | Utility Component | Helper cho deployment tasks. Check DB connection, run migrations, verify environment config, health check endpoints. Admin only | - | Run deployment checks |
| **ToastTester.tsx** | Utility Component | Dev tool để test toast notifications. Buttons để trigger: success toast, error toast, warning toast, info toast, loading toast. Test positioning, duration, styling | - | Trigger test toasts |
| **LanguageSwitcher.tsx** | Component | Language switcher dropdown. Support languages: EN, VI, (thêm nếu cần). Change language → reload i18n strings. Lưu preference vào localStorage | `currentLang: string`<br/>`onLangChange: (lang) => void` | Switch language |

---

## 🎨 UI COMPONENTS LIBRARY (src/components/ui/)

**Note:** 30+ components từ shadcn/ui, tất cả đều là presentational components (không có business logic)

| File | Loại | Ý nghĩa & Chức năng | Khi nào dùng |
|------|------|---------------------|--------------|
| **button.tsx** | UI Component | Button với variants: default, destructive, outline, ghost, link. Sizes: sm, md, lg. Support loading state, disabled, icon | Everywhere cần button |
| **input.tsx** | UI Component | Text input field. Support: placeholder, disabled, error state, prefix/suffix icons | Forms, search boxes |
| **textarea.tsx** | UI Component | Multi-line text input. Auto-resize (optional) | Task description, comments |
| **select.tsx** | UI Component | Dropdown select với search. Single/multi-select. Support groups, disabled options | Assignee picker, status dropdown |
| **dialog.tsx** | UI Component | Modal dialog overlay. Support: close on ESC, close on backdrop click, footer actions | NewTaskDialog, EditTaskForm |
| **card.tsx** | UI Component | Card container với header, content, footer | Project cards, stat cards |
| **badge.tsx** | UI Component | Badge/pill để hiển thị tags, status. Variants: default, secondary, destructive, outline | Task priority, status labels |
| **avatar.tsx** | UI Component | User avatar với fallback initials | User display, assignee |
| **calendar.tsx** | UI Component | Date picker calendar (không phải Calendar page) | Due date picker |
| **popover.tsx** | UI Component | Popover tooltip dropdown | Context menus, filters |
| **tooltip.tsx** | UI Component | Hover tooltip | Icon explanations |
| **dropdown-menu.tsx** | UI Component | Dropdown menu với items, separators, sub-menus | Actions menu, user menu |
| **tabs.tsx** | UI Component | Tabs navigation | Settings tabs, view tabs |
| **checkbox.tsx** | UI Component | Checkbox input | Task selection, filters |
| **switch.tsx** | UI Component | Toggle switch | Enable/disable features |
| **label.tsx** | UI Component | Form label | Form fields |
| **sonner.tsx** | UI Component | Toast notifications (using Sonner library) | Success/error messages |
| **accordion.tsx** | UI Component | Collapsible accordion | FAQ, expandable sections |
| **alert.tsx** | UI Component | Alert banner (info, warning, error, success) | Notifications, warnings |
| **alert-dialog.tsx** | UI Component | Confirmation dialog (Yes/No) | Delete confirmations |
| **aspect-ratio.tsx** | UI Component | Aspect ratio container | Images, videos |
| **breadcrumb.tsx** | UI Component | Breadcrumb navigation | Page navigation |
| **collapsible.tsx** | UI Component | Collapsible section | WorkspaceSidebar sections |
| **command.tsx** | UI Component | Command palette (Cmd+K style) | Quick actions, search |
| **context-menu.tsx** | UI Component | Right-click context menu | Task row actions |
| **hover-card.tsx** | UI Component | Hover card (richer than tooltip) | User preview on hover |
| **menubar.tsx** | UI Component | Menu bar (like app menu) | Top menu bar |
| **navigation-menu.tsx** | UI Component | Navigation menu với dropdowns | Main navigation |
| **progress.tsx** | UI Component | Progress bar | Task completion, loading |
| **radio-group.tsx** | UI Component | Radio button group | Single choice options |
| **scroll-area.tsx** | UI Component | Custom scrollbar container | Scrollable areas |
| **separator.tsx** | UI Component | Horizontal/vertical divider line | Section separators |
| **sheet.tsx** | UI Component | Side panel/drawer | TaskDetailDialog as side panel |
| **skeleton.tsx** | UI Component | Loading skeleton placeholder | Loading states |
| **slider.tsx** | UI Component | Range slider | Filters, settings |
| **table.tsx** | UI Component | Table component | WorkspaceListView table |
| **toggle.tsx** | UI Component | Toggle button | Toolbar actions |
| **toggle-group.tsx** | UI Component | Toggle button group | View switcher |

---

## 📊 SUMMARY STATISTICS

| Category | Count | Notes |
|----------|-------|-------|
| **Pages** | 10 | Main workspace views (Dashboard → Settings) |
| **Authentication** | 4 | Logto + Legacy auth |
| **Layout** | 4 | App, Sidebar, Header, ErrorBoundary |
| **Workspace** | 5 | Project workspace sub-components |
| **Task Management** | 5 | Dialogs, forms, views |
| **Advanced Views** | 6 | Kanban, MindMap, Gantt, Timeline, Workload |
| **Utilities** | 6 | Dev tools, helpers |
| **UI Library** | 35+ | shadcn/ui components |
| **Total Components** | 75+ | All TSX files |

---

## 🔄 COMPONENT RELATIONSHIPS

```
App (Root)
├─── Auth Layer
│    ├─── LogtoAuth (/)
│    ├─── LogtoCallback (/auth/callback)
│    └─── SimpleAuthReal (legacy)
│
└─── Workspace Layer (/workspace)
     ├─── Layout
     │    ├─── Sidebar (navigation)
     │    └─── Header (user info)
     │
     ├─── Main Pages
     │    ├─── Dashboard (home)
     │    ├─── Projects (project list)
     │    ├─── ProjectWorkspace (project detail)
     │    │    ├─── WorkspaceSidebar (spaces/categories)
     │    │    ├─── WorkspaceToolbar (views/filters)
     │    │    └─── Content Views
     │    │         ├─── WorkspaceListView
     │    │         │    └─── DraggableTaskRow
     │    │         ├─── KanbanBoard
     │    │         │    └─── KanbanStats
     │    │         ├─── MindMapView
     │    │         ├─── GanttChart
     │    │         └─── Timeline
     │    ├─── MyTasks (personal tasks)
     │    ├─── Calendar (events)
     │    ├─── Reports (analytics)
     │    ├─── Team (members)
     │    └─── Settings (preferences)
     │
     └─── Shared Dialogs
          ├─── NewTaskDialog
          ├─── TaskDetailDialog
          ├─── EditTaskForm
          ├─── NewProjectForm
          ├─── NewEventForm
          ├─── AddMemberForm
          ├─── LinkTaskDialog
          └─── LinkDocumentsDialog
```

---

## 🎯 USAGE PATTERNS

### Pattern 1: List → Detail → Edit
```
Projects.tsx → click card → ProjectWorkspace.tsx → WorkspaceListView → click task → TaskDetailDialog → click edit → EditTaskForm
```

### Pattern 2: Quick Create
```
Any page → Header/Toolbar → "New Task" button → NewTaskDialog → submit → refresh list
```

### Pattern 3: Drag & Drop
```
WorkspaceListView → DraggableTaskRow → drag → drop → update task position/status
KanbanBoard → drag card between columns → update task status
```

### Pattern 4: Filter & Search
```
WorkspaceToolbar → select filters → WorkspaceListView updates → filtered tasks displayed
```

---

**Generated:** 2025-11-27
**Project:** TaskFlow Multi-tenant Task Management System v2.7
**Total Components:** 75+ TSX files
