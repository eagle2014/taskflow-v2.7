# TaskFlow Components - Phân Nhóm Theo Chức Năng

## 📋 Bảng Components Theo Nghiệp Vụ (Main Pages + Children)

**Chú thích:**
- `*` = **Main Page** (Component chính của chức năng)
- `  ↳` = **Child Component** (Component con phục vụ main page)
- `    ↳` = **Sub-child Component** (Component cháu, phục vụ component con)

---

## 🔐 1. AUTHENTICATION (Đăng nhập/Đăng ký)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| **`* LogtoAuth.tsx`** | **Main Page** | **Màn hình đăng nhập OAuth/OIDC chính**. Button "Sign in with Logto", xử lý OAuth flow | `/` |
| `  ↳ LogtoCallback.tsx` | Child Page | Callback xử lý OAuth redirect, sync user với backend, lưu JWT token | `/auth/callback` |
| `  ↳ SimpleAuthReal.tsx` | Child Page (Legacy) | Đăng nhập cũ dạng email/password/siteCode (trước khi có Logto) | - |

---

## 🏠 2. DASHBOARD (Tổng quan)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| **`* Dashboard.tsx`** | **Main Page** | **Trang tổng quan chính sau login**. Hiển thị stats cards (projects, tasks), recent projects grid, quick actions, activity timeline | `/workspace` (default view) |

---

## 📁 3. PROJECTS MANAGEMENT (Quản lý dự án)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| **`* Projects.tsx`** | **Main Page** | **Danh sách tất cả projects**. Project cards dạng grid, search/filter, button "New Project" | `/workspace?view=projects` |
| `  ↳ NewProjectForm.tsx` | Child Dialog | Dialog tạo project mới. Form: name, description, color, icon, dates, categories, members | Button "New Project" |
| `  ↳ ProjectDetail.tsx` | Child Page/Dialog | Chi tiết 1 project: info, members, stats, activity | Click project card |

---

## 🎨 4. PROJECT WORKSPACE (Không gian làm việc dự án)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| **`* ProjectWorkspaceV1.tsx`** | **Main Page (Fullscreen)** | **Không gian làm việc chính của 1 project**. Tích hợp sidebar, toolbar, multiple views (List/Kanban/MindMap/Gantt) | `/workspace?view=project-workspace` |
| `  ↳ workspace/WorkspaceSidebar.tsx` | Child Component | Sidebar trái: Spaces tree (folders) + Categories list (tags). Click để filter tasks | Bên trái workspace |
| `  ↳ workspace/WorkspaceToolbar.tsx` | Child Component | Toolbar trên: View switcher (List/Kanban/MindMap/Gantt), Filters, Sort, Search, "New Task" button | Trên cùng workspace |
| `  ↳ workspace/WorkspaceListView.tsx` | Child Component | **List view** - Table hiển thị tasks. Columns: name, assignee, status, priority, due date. Virtual scrolling | Main content area (List view) |
| `    ↳ workspace/DraggableTaskRow.tsx` | Sub-child Component | Single task row với drag & drop, hover effect, context menu | Trong WorkspaceListView |
| `  ↳ KanbanBoard.tsx` | Child Component | **Kanban view** - Columnar layout (Todo/In Progress/Review/Done). Drag & drop giữa columns | Main content area (Kanban view) |
| `    ↳ KanbanStats.tsx` | Sub-child Component | Stats widget: total tasks, tasks per column, cycle time, throughput | Trong KanbanBoard |
| `  ↳ MindMapView.tsx` | Child Component | **Mind Map view** - Tree/graph visualization. Root=project, branches=spaces, leaves=tasks | Main content area (MindMap view) |
| `  ↳ GanttChart.tsx` | Child Component | **Gantt view** - Timeline với task duration bars, dependencies, critical path | Main content area (Gantt view) |
| `  ↳ Timeline.tsx` | Child Component | **Timeline view** - Events theo thời gian: task created, completed, milestones | Main content area (Timeline view) |
| `  ↳ Workload.tsx` | Child Component | **Workload view** - Distribution chart, tasks per user, detect overallocation | Main content area (Workload view) |

---

## ✅ 5. MY TASKS (Task của tôi)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| **`* MyTasks.tsx`** | **Main Page** | **Tất cả tasks assigned cho current user** (across all projects). Filter theo status, sort theo priority/deadline | `/workspace?view=my-tasks` |
| `  ↳ TaskList.tsx` | Child Component | Generic task list component (reusable). Hiển thị danh sách tasks đơn giản | Trong MyTasks |
| `  ↳ TaskDetailDialog.tsx` | Child Dialog | Dialog chi tiết 1 task: info, comments, activity log. Buttons: Edit, Delete | Click task row |
| `    ↳ EditTaskForm.tsx` | Sub-child Form | Form sửa task: name, description, assignee, status, priority, dates, space, categories | Click Edit trong TaskDetailDialog |
| `  ↳ NewTaskDialog.tsx` | Child Dialog | Dialog tạo task mới nhanh từ My Tasks | Button "New Task" |
| `  ↳ TaskDetailView.tsx` | Child Page | Full page view cho task detail (thay vì dialog), dùng khi cần nhiều space | Alternative to dialog |

---

## 📅 6. CALENDAR (Lịch làm việc)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| **`* Calendar.tsx`** | **Main Page** | **Lịch làm việc** - Month/week/day view. Hiển thị tasks (deadline), events, meetings. Drag & drop task deadline | `/workspace?view=calendar` |
| `  ↳ NewEventForm.tsx` | Child Dialog | Dialog tạo calendar event: title, description, start/end datetime, attendees, reminder, recurrence | Click vào ngày trong calendar |

---

## 📊 7. REPORTS (Báo cáo)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| **`* Reports.tsx`** | **Main Page** | **Báo cáo & analytics**. Charts: task completion rate, project progress, team performance. Export PDF/Excel | `/workspace?view=reports` |

---

## 👥 8. TEAM MANAGEMENT (Quản lý team)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| **`* Team.tsx`** | **Main Page** | **Quản lý team members**. Danh sách users, roles, permissions. Add/edit/deactivate users | `/workspace?view=team` |
| `  ↳ AddMemberForm.tsx` | Child Dialog | Dialog thêm member: email, role, projects to assign, send invitation | Button "Add Member" |
| `  ↳ UserManagement.tsx` | Child Component | Admin tool: user table, edit role, deactivate, delete, reset password | Trong Team page (admin only) |

---

## ⚙️ 9. SETTINGS (Cài đặt)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| **`* Settings.tsx`** | **Main Page** | **Cài đặt user**. Tabs: Profile (name, email, avatar), Preferences (theme, language), Security (password), Integrations (API keys) | `/workspace?view=settings` |
| `  ↳ LanguageSwitcher.tsx` | Child Component | Language dropdown: EN, VI. Change language → reload i18n | Trong Settings (Preferences tab) |

---

## 🔗 10. TASK LINKING & RELATIONS (Liên kết tasks)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| `* LinkTaskDialog.tsx` | Main Dialog | Dialog link task với task khác. Types: blocks, blocked by, relates to, duplicates, parent/child | TaskDetailDialog → Link button |
| `* LinkDocumentsDialog.tsx` | Main Dialog | Dialog attach files/docs vào task. Upload files, link URLs (Drive, Dropbox), file preview | TaskDetailDialog → Attach button |

---

## 💰 11. BILLING & INVOICES (Hoá đơn)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| `* AddInvoiceDialog.tsx` | Main Dialog | Dialog tạo invoice: items, price, tax, total, due date. Generate PDF | Project/Task → Invoice button |

---

## 🏗️ 12. LAYOUT & CORE STRUCTURE (Cấu trúc chính)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| **`* App.tsx`** | **Root Component** | **Component gốc toàn app**. Wrap với LogtoProvider, I18nProvider, BrowserRouter. Define routes. Force dark mode | - |
| `  ↳ Sidebar.tsx` | Child Layout | Menu điều hướng trái: Dashboard, Projects, My Tasks, Calendar, Reports, Team, Settings | Bên trái màn hình |
| `  ↳ Header.tsx` | Child Layout | Header trên: Logo, breadcrumb, user avatar, sign out button | Trên cùng màn hình |
| `  ↳ ErrorBoundary.tsx` | Child Wrapper | Error boundary catch lỗi runtime, prevent app crash | Wrap toàn app |

---

## 🛠️ 13. UTILITIES & DEV TOOLS (Công cụ phát triển)

| File | Loại | Ý nghĩa & Chức năng | Route/Trigger |
|------|------|---------------------|---------------|
| `* TaskSeeder.tsx` | Utility | Dev tool seed fake tasks vào DB. Generate random data để test | Dev only |
| `* DebugGuide.tsx` | Utility | Dev tool hiển thị debug info: route, user, localStorage, env vars | Dev only |
| `* DeploymentHelper.tsx` | Utility | Helper cho deployment: check DB, run migrations, verify config, health check | Admin only |
| `* ToastTester.tsx` | Utility | Dev tool test toast notifications: success, error, warning, info | Dev only |

---

## 🎨 14. UI COMPONENTS LIBRARY (Thư viện giao diện)

### 📦 shadcn/ui Components (35+ components)

**Đây là các presentational components từ shadcn/ui, không có business logic. Được sử dụng bởi tất cả các main pages ở trên.**

| Category | Components | Mục đích |
|----------|-----------|----------|
| **Form Controls** | `button.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`, `label.tsx`, `slider.tsx` | Form inputs & controls |
| **Layout** | `card.tsx`, `separator.tsx`, `aspect-ratio.tsx`, `scroll-area.tsx`, `sheet.tsx` | Layout containers |
| **Overlays** | `dialog.tsx`, `popover.tsx`, `tooltip.tsx`, `hover-card.tsx`, `alert-dialog.tsx` | Modals & popovers |
| **Navigation** | `tabs.tsx`, `dropdown-menu.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `breadcrumb.tsx`, `command.tsx`, `context-menu.tsx` | Navigation components |
| **Feedback** | `sonner.tsx` (toast), `alert.tsx`, `progress.tsx`, `skeleton.tsx` | User feedback |
| **Data Display** | `badge.tsx`, `avatar.tsx`, `table.tsx`, `calendar.tsx` | Display data |
| **Interactive** | `accordion.tsx`, `collapsible.tsx`, `toggle.tsx`, `toggle-group.tsx` | Interactive elements |

---

## 📊 TỔNG KẾT THEO CHỨC NĂNG

| Chức năng | Main Page (*) | Child Components | Sub-children | Tổng |
|-----------|---------------|------------------|--------------|------|
| **1. Authentication** | 1 | 2 | 0 | 3 |
| **2. Dashboard** | 1 | 0 | 0 | 1 |
| **3. Projects** | 1 | 2 | 0 | 3 |
| **4. Project Workspace** | 1 | 10 | 2 | 13 |
| **5. My Tasks** | 1 | 5 | 1 | 7 |
| **6. Calendar** | 1 | 1 | 0 | 2 |
| **7. Reports** | 1 | 0 | 0 | 1 |
| **8. Team** | 1 | 2 | 0 | 3 |
| **9. Settings** | 1 | 1 | 0 | 2 |
| **10. Task Linking** | 2 | 0 | 0 | 2 |
| **11. Invoices** | 1 | 0 | 0 | 1 |
| **12. Layout Core** | 1 | 3 | 0 | 4 |
| **13. Utilities** | 4 | 0 | 0 | 4 |
| **14. UI Library** | - | 35+ | - | 35+ |
| **TOTAL** | **17 main pages** | **61 child components** | **3 sub-children** | **81+** |

---

## 🎯 COMPONENT HIERARCHY VISUALIZATION

```
📱 App.tsx (ROOT)
│
├─── 🔐 AUTHENTICATION
│    └─── * LogtoAuth.tsx
│         ├─── LogtoCallback.tsx
│         └─── SimpleAuthReal.tsx
│
├─── 🏗️ LAYOUT
│    ├─── Sidebar.tsx
│    ├─── Header.tsx
│    └─── ErrorBoundary.tsx
│
└─── 📂 WORKSPACE VIEWS
     │
     ├─── 🏠 * Dashboard.tsx
     │
     ├─── 📁 * Projects.tsx
     │    ├─── NewProjectForm.tsx
     │    └─── ProjectDetail.tsx
     │
     ├─── 🎨 * ProjectWorkspaceV1.tsx (MAIN WORKSPACE)
     │    ├─── workspace/WorkspaceSidebar.tsx
     │    ├─── workspace/WorkspaceToolbar.tsx
     │    ├─── workspace/WorkspaceListView.tsx
     │    │    └─── workspace/DraggableTaskRow.tsx
     │    ├─── KanbanBoard.tsx
     │    │    └─── KanbanStats.tsx
     │    ├─── MindMapView.tsx
     │    ├─── GanttChart.tsx
     │    ├─── Timeline.tsx
     │    └─── Workload.tsx
     │
     ├─── ✅ * MyTasks.tsx
     │    ├─── TaskList.tsx
     │    ├─── TaskDetailDialog.tsx
     │    │    └─── EditTaskForm.tsx
     │    ├─── NewTaskDialog.tsx
     │    └─── TaskDetailView.tsx
     │
     ├─── 📅 * Calendar.tsx
     │    └─── NewEventForm.tsx
     │
     ├─── 📊 * Reports.tsx
     │
     ├─── 👥 * Team.tsx
     │    ├─── AddMemberForm.tsx
     │    └─── UserManagement.tsx
     │
     └─── ⚙️ * Settings.tsx
          └─── LanguageSwitcher.tsx
```

---

## 🔄 NAVIGATION FLOW GIỮA CÁC MAIN PAGES

```
Login Flow:
LogtoAuth (*) → LogtoCallback → Dashboard (*)

Main Navigation:
Dashboard (*)
    → Projects (*)
        → ProjectWorkspaceV1 (*) [FULLSCREEN]
            → List/Kanban/MindMap/Gantt Views
    → MyTasks (*)
    → Calendar (*)
    → Reports (*)
    → Team (*)
    → Settings (*)
```

---

## 💡 QUY TẮC PHÂN CẤP COMPONENT

1. **Main Page (*)**:
   - Là page chính của 1 chức năng nghiệp vụ
   - Có route riêng hoặc view state riêng
   - Quản lý state chính của chức năng
   - Example: `ProjectWorkspaceV1.tsx`, `Dashboard.tsx`, `MyTasks.tsx`

2. **Child Component (↳)**:
   - Component phục vụ trực tiếp cho main page
   - Nhận props từ main page, emit events lên main page
   - Không có route riêng, được render bởi main page
   - Example: `WorkspaceSidebar.tsx`, `NewTaskDialog.tsx`

3. **Sub-child Component (  ↳)**:
   - Component phục vụ cho child component
   - Nested 2 levels từ main page
   - Example: `DraggableTaskRow.tsx` (child của `WorkspaceListView`, grandchild của `ProjectWorkspaceV1`)

4. **UI Library Components**:
   - Presentational components, không có business logic
   - Reusable ở mọi nơi
   - Không thuộc về chức năng cụ thể nào
   - Example: `button.tsx`, `dialog.tsx`, `input.tsx`

---

**Generated:** 2025-11-27
**Project:** TaskFlow Multi-tenant Task Management System v2.7
**Total Components:** 81+ files (17 main pages, 61 children, 3 sub-children, 35+ UI library)
