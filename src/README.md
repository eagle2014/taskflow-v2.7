# TaskFlow - Modern Task Management System

> **🎉 No Backend Required!** TaskFlow runs 100% in your browser with localStorage. No Supabase, no deployment complexity.

## ✨ Overview

TaskFlow là hệ thống quản lý task hiện đại lấy cảm hứng từ ClickUp, được xây dựng với React, TypeScript, và Tailwind CSS. Hệ thống hoạt động hoàn toàn độc lập với localStorage, không cần backend hay database.

### Key Features

- 📋 **Multiple Views**: List, Kanban Board, Calendar, Gantt Chart, Mind Map, Workload
- 🎯 **Project Management**: Spaces, Projects, Phases, Tasks, Subtasks
- 🔄 **Drag & Drop**: Intuitive task reordering and date changes
- 📊 **Analytics**: Progress tracking, time estimation, workload analysis
- 🎨 **Modern UI**: Dark mode, unified color scheme, smooth animations
- 🌐 **Multi-language**: English & Vietnamese support
- 💾 **localStorage**: All data stored locally, works offline

## 🚀 Quick Start

### Installation

```bash
npm install
npm run dev
```

That's it! No environment variables, no backend setup, no configuration needed.

### Verify Everything Works

Follow the [Verification Guide](./verify-setup.md) to confirm your setup is correct.

### Build for Production

```bash
npm run build
```

Deploy the `dist` folder to any static hosting:
- Vercel: `vercel deploy`
- Netlify: `netlify deploy --prod`
- GitHub Pages: Push to repository
- Cloudflare Pages: Connect repository

## 🏗️ Architecture

### Current (localStorage Mode)
```
React App → Mock API → Browser localStorage
```

### Data Storage

All data is stored in browser localStorage with these keys:

| Key | Purpose |
|-----|---------|
| `taskflow_current_user` | Current session |
| `taskflow_users` | User accounts |
| `taskflow_projects` | All projects |
| `taskflow_tasks` | All tasks |
| `taskflow_events` | Calendar events |
| `taskflow_comments` | Task comments |

## 📦 Tech Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Drag & Drop**: react-dnd
- **Calendar**: react-big-calendar
- **State**: React Hooks
- **Storage**: localStorage API

## 🎨 Design System

### Colors
- Background: `#181c28`
- Card Background: `#292d39`
- Primary: `#0394ff`
- Text: `#ffffff` / `#838a9c`

### Icons
- Space: 📁 (Purple `#7c66d9`)
- Project: 🚀 (Blue `#0394ff`)

## 📁 Project Structure

```
├── App.tsx                 # Main application entry
├── components/             # React components
│   ├── Dashboard.tsx      # Main dashboard
│   ├── MyTasks.tsx        # Personal tasks view
│   ├── ProjectWorkspace/  # Project workspace
│   ├── GanttChart.tsx     # Gantt timeline
│   ├── KanbanBoard.tsx    # Kanban view
│   ├── MindMapView.tsx    # Mind map view
│   └── ...
├── utils/
│   ├── mockApi.tsx        # Mock API with localStorage
│   ├── api/               # API modules
│   └── supabase/          # Legacy (not used)
├── data/
│   └── mockData.ts        # Initial mock data
└── styles/
    └── globals.css        # Global styles & tokens
```

## 🔧 Features

### ✅ Completed

- [x] Authentication (mock with localStorage)
- [x] Project CRUD operations
- [x] Task management with subtasks
- [x] Multiple view modes
- [x] Drag & drop functionality
- [x] Gantt chart with date editing
- [x] Mind map visualization
- [x] Spaces & Phases management
- [x] Column formulas & calculations
- [x] Auto-hidden sidebar
- [x] Language switcher (EN/VI)
- [x] Dark mode design
- [x] localStorage persistence

### 🎯 Views Available

1. **List View** - Traditional task list with sorting/filtering
2. **Board View** - Kanban board with drag & drop
3. **Calendar View** - Timeline view of tasks and events
4. **Gantt View** - Project timeline with dependencies
5. **Mind Map View** - Visual task relationships
6. **Workload View** - Team capacity planning

## ⚠️ Important Notes

### Data Storage
- ✅ Data is stored in browser localStorage
- ⚠️ Not synced between devices or browsers
- ⚠️ Clearing browser data will delete all tasks
- ⚠️ Typical limit: 5-10MB (sufficient for 100s of projects)

### Backup
- Use Export feature in Settings regularly
- No automatic cloud backup
- Each browser is independent

## 🐛 Known Issues

### Figma Make Deploy Error (Can be Ignored)

If you see this error in Figma Make console:
```
Error while deploying: XHR for "/api/integrations/supabase/.../deploy" failed with status 403
```

**This is normal and can be safely ignored!**

**Why it happens:**
- Figma Make detects the legacy `/supabase/functions/` folder
- It tries to auto-deploy Supabase edge functions
- But we don't use Supabase anymore (we use localStorage)
- The files are protected and can't be deleted

**Impact:**
- None - your app works perfectly fine
- All features are functional with localStorage
- No backend is needed or used

**Solution:**
- Ignore the error completely
- The `.figmaignore` file tells build tools to skip Supabase
- Your app will deploy successfully to Vercel/Netlify/etc.

## 📚 Documentation

- `/QUICK_START.md` - Quick reference guide
- `/NO_SUPABASE_README.md` - localStorage mode details
- `/FIXES_SUMMARY.md` - Recent fixes and changes
- `/DEPLOYMENT_FIX.md` - Deployment troubleshooting

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Deploy (no config needed!)

### Netlify

1. Push to GitHub  
2. New site from Git
3. Build command: `npm run build`
4. Publish directory: `dist`

### Other Platforms

Any static hosting works:
- GitHub Pages
- Cloudflare Pages
- Firebase Hosting
- AWS S3 + CloudFront
- Surge.sh
- Render

**No environment variables needed!**

## 💡 Development

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Adding New Features

1. Components go in `/components/`
2. API logic goes in `/utils/api/`
3. Data models in `/data/`
4. Types in `/types/`

### Mock Data

- Initial data: `/data/mockData.ts`
- Workspace data: `/data/projectWorkspaceMockData.ts`
- API implementation: `/utils/mockApi.tsx`

## 🤝 Contributing

This is a demo/prototype project. Feel free to:
- Fork and modify for your needs
- Use as reference for localStorage patterns
- Build upon the UI/UX design

## 📄 License

[Your License Here]

## 🎯 Next Steps

Want to add real backend? Consider:
- Firebase (easy setup)
- Supabase (was originally planned)
- Custom Node.js/Express backend
- PocketBase (self-hosted)

But for most users, localStorage mode is perfect!

---

**Built with ❤️ using React + TypeScript + Tailwind CSS**

**Status:** ✅ Production Ready (localStorage mode)
