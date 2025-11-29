# TaskDetailDialog Components

## Overview

Components for the redesigned TaskDetailDialog matching ClickUp's task detail interface.

## Component Directory

### Layout Components
- **TaskHeader.tsx** - Dialog header with task title and close button
- **TaskMetadata.tsx** - Task metadata grid (status, assignee, dates, budget)
- **TaskDescription.tsx** - Rich text description editor
- **TaskTabs.tsx** - Tabbed content area (Details, Subtasks, Action Items)

### Tab Content Components
- **SubtasksList.tsx** - Subtasks management with add/edit/delete
- **ActionItemsList.tsx** - Action items checklist

### Activity Sidebar Components (Phase 4)
- **ActivityHeader.tsx** - Sidebar header with search/notifications/menu
- **ActivityTimeline.tsx** - Timeline of task activities
- **CommentInput.tsx** - Comment input with rich toolbar

### Utilities
- **AIPromptBar.tsx** - AI assistant prompt bar (experimental)

## Component Hierarchy

```
TaskDetailDialog
├── Main Content (flex-1)
│   ├── TaskHeader
│   ├── TaskMetadata
│   ├── TaskDescription
│   └── TaskTabs
│       ├── DetailsTab
│       ├── SubtasksList
│       └── ActionItemsList
│
└── Activity Sidebar (w-80)
    ├── ActivityHeader
    ├── ActivityTimeline
    └── CommentInput
```

## Usage Example

```tsx
import { ActivityHeader } from './components/ActivityHeader';
import { ActivityTimeline } from './components/ActivityTimeline';
import { CommentInput } from './components/CommentInput';

<div className="flex flex-col h-full bg-gray-50">
  <ActivityHeader />
  <div className="flex-1 overflow-y-auto">
    <ActivityTimeline activities={activities} />
  </div>
  <CommentInput onSubmit={handleSubmit} />
</div>
```

## Design Standards

All components follow:
- Tailwind CSS only (no custom CSS)
- shadcn/ui component library
- lucide-react icons
- <150 lines per component (where possible)
- ARIA labels for accessibility
- Type-safe TypeScript

## Color Palette

- **Text**: gray-900 (primary), gray-600 (secondary), gray-500 (tertiary)
- **Backgrounds**: white, gray-50, gray-100
- **Accents**: purple-500 (timeline dots, focus states)
- **Borders**: gray-200

## Typography Scale

- **Titles**: text-sm font-semibold
- **Body**: text-sm
- **Timestamps**: text-xs text-gray-500
- **Hints**: text-xs text-gray-400

## Spacing System

- **Padding**: px-4 py-3 (standard), px-3 py-2 (compact)
- **Gaps**: gap-3 (standard), gap-1 (tight)
- **Borders**: border-b border-gray-200

## Icon Sizes

- **Header icons**: h-4 w-4
- **Toolbar icons**: h-4 w-4
- **Timeline dots**: h-2 w-2
- **Chevrons**: h-3 w-3

## Keyboard Shortcuts

- **Cmd/Ctrl+Enter** - Submit comment
- **Tab** - Navigate between fields
- **Esc** - Close dialog

## Accessibility

All components include:
- ARIA labels on icon buttons
- Keyboard navigation support
- Focus visible states
- Semantic HTML structure

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18.3.1+
- lucide-react
- date-fns (for ActivityTimeline)
- @radix-ui/* (via shadcn/ui)
- Tailwind CSS 3.4+

## File Sizes

| Component | Lines | Status |
|-----------|-------|--------|
| ActivityHeader | 52 | ✅ |
| ActivityTimeline | 126 | ✅ |
| CommentInput | 179 | ⚠️ (exceeds 150) |
| TaskHeader | 120 | ✅ |
| TaskMetadata | 85 | ✅ |
| TaskDescription | 142 | ✅ |
| TaskTabs | 180 | ⚠️ (exceeds 150) |
| SubtasksList | 140 | ✅ |
| ActionItemsList | 128 | ✅ |

## Testing

Components should be tested for:
1. Rendering with mock data
2. User interactions (click, type, submit)
3. Keyboard navigation
4. Accessibility (screen readers)
5. Responsive behavior
6. Error states

## Future Enhancements

- [ ] @mention autocomplete with user search
- [ ] Emoji picker integration
- [ ] File upload with drag-and-drop
- [ ] Rich text formatting toolbar
- [ ] Activity filtering/search
- [ ] Real-time activity updates
- [ ] Notification badges
- [ ] Activity export functionality

---

**Last Updated**: 2025-11-29
**Phase**: 4/4 Complete
