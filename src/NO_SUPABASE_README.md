# TaskFlow - No Supabase Mode

## Overview
Hệ thống TaskFlow hiện tại **KHÔNG sử dụng Supabase**. Tất cả dữ liệu được lưu trữ trong **localStorage** và sử dụng **mock API**.

## Cấu trúc lưu trữ

### LocalStorage Keys:
- `taskflow_current_user` - User hiện tại đang đăng nhập
- `taskflow_projects` - Danh sách projects
- `taskflow_tasks` - Danh sách tasks
- `taskflow_events` - Danh sách calendar events
- `taskflow_users` - Danh sách users (mock data)

## API Layer

### Mock API Files:
- `/utils/mockApi.tsx` - Main mock API với authentication và CRUD operations
- `/utils/api/categories.tsx` - Static project categories
- `/utils/api/projects.tsx` - Projects CRUD với localStorage
- `/utils/api/tasks.tsx` - Tasks CRUD với localStorage
- `/utils/api/events.tsx` - Events CRUD với localStorage
- `/utils/api/connectivity.tsx` - Connection test (localStorage mode)

### Supabase Compatibility Files (Mock only):
- `/utils/supabase/client.tsx` - Mock Supabase client (không kết nối thực)
- `/utils/supabase/info.tsx` - Protected file (không sử dụng)
- `/supabase/functions/server/*` - Protected files (không deploy)

## Authentication

Sử dụng **SimpleAuth** component (`/components/SimpleAuth.tsx`):
- Mock authentication với localStorage
- Không cần Supabase credentials
- Users được lưu trong localStorage

## Data Persistence

### Tạo mới dữ liệu:
```typescript
// Projects
const newProject = {
  id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  ...projectData,
  user_id: session.user.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
```

### Lưu vào localStorage:
```typescript
localStorage.setItem('taskflow_projects', JSON.stringify(projects));
```

### Đọc từ localStorage:
```typescript
const stored = localStorage.getItem('taskflow_projects');
const projects = stored ? JSON.parse(stored) : [];
```

## Migration từ Supabase

Nếu trước đây có dùng Supabase, tất cả các calls đã được chuyển sang localStorage:

### Trước (Supabase):
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId);
```

### Sau (localStorage):
```typescript
const allProjects = JSON.parse(localStorage.getItem('taskflow_projects') || '[]');
const userProjects = allProjects.filter(p => p.user_id === userId);
```

## Deployment

### Không cần:
- ❌ Supabase project
- ❌ Supabase credentials
- ❌ Database setup
- ❌ Edge functions deployment

### Chỉ cần:
- ✅ Static hosting (Vercel, Netlify, etc.)
- ✅ Browser với localStorage support
- ✅ Mock data được load tự động

## Testing

Tất cả các API functions đã được test với localStorage:
- `fetchProjects()` - Fetch từ localStorage
- `createProject()` - Tạo và save vào localStorage  
- `updateProject()` - Update trong localStorage
- `deleteProject()` - Xóa khỏi localStorage
- Tương tự cho tasks, events, etc.

## Lưu ý quan trọng

1. **Dữ liệu chỉ lưu trong browser**: Clear browser cache = mất data
2. **Không sync giữa devices**: Mỗi browser có dữ liệu riêng
3. **Không có backend thực**: Tất cả là mock data
4. **localStorage limits**: ~5-10MB tùy browser

## Files có thể ignore

Các files sau tồn tại nhưng KHÔNG được sử dụng:
- `/supabase/functions/server/index.tsx` (protected)
- `/supabase/functions/server/kv_store.tsx` (protected)
- `/utils/supabase/info.tsx` (protected)
- `/components/Auth.tsx` (không sử dụng, dùng SimpleAuth thay thế)

## Development

Để develop hệ thống:
1. Clone repo
2. `npm install`
3. `npm run dev`
4. Tất cả sẽ hoạt động với localStorage, không cần setup gì thêm

## Production

Deploy lên bất kỳ static hosting nào:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

Không cần environment variables hay backend configuration.
