# TaskDetailDialog Redesign Plan - ClickUp-Style

**Created**: 2025-11-28 17:30
**Complexity**: High
**Estimated Effort**: 12-16 hours
**Priority**: High

## Executive Summary

Redesign TaskDetailDialog to match ClickUp's clean, professional layout with better UX, visual hierarchy, and functionality. Current implementation is functional but lacks polish and proper layout structure.

## Design Analysis (ClickUp Reference)

### Key Design Principles Observed:

1. **Clean Layout**
   - White background, minimal borders
   - Clear sections with proper spacing
   - Left content / Right sidebar pattern

2. **Visual Hierarchy**
   - Task title prominent at top
   - Metadata in compact rows
   - Tabs for different content areas

3. **Field Organization**
   - Status: Pill button (green "COMPLETE")
   - Assignees: Avatar bubbles, "Empty" state
   - Dates: Date range display "2/5/20 → 2/5/20"
   - Time Estimate: "448h" badge
   - Track Time: "Add time" link
   - Relationships: "Empty" state

4. **Content Areas**
   - AI Assistant prompt bar (Brain feature)
   - Description section with "Add description" + "Write with AI"
   - Tabs: Details / Subtasks / Action Items
   - Activity sidebar (right)

5. **Interaction Patterns**
   - Inline editing
   - Hover states
   - Dropdown selectors
   - AI integration points

## Current Implementation Issues

### Analyzed from TaskDetailDialog.tsx:

1. **Layout Problems**
   - Using Draggable + Resizable (over-engineered)
   - No clear left/right split
   - Tabs buried, not prominent
   - Poor spacing/padding

2. **Visual Issues**
   - Dark gray background (should be white)
   - Heavy borders everywhere
   - Inconsistent spacing
   - No clear visual hierarchy

3. **Field Organization**
   - Fields scattered randomly
   - No logical grouping
   - Too much nesting
   - Metadata not compact enough

4. **Missing Features**
   - AI integration UI
   - Time tracking UI
   - Relationships section
   - Proper subtasks tab
   - Activity timeline (has basic version)

## Solution Design

### Architecture Decision: Clean Slate Refactor

**Option A: Incremental Refactor** (NOT RECOMMENDED)
- Keep existing structure
- Gradual improvements
- Risk: Technical debt accumulates

**Option B: Clean Redesign** (RECOMMENDED)
- New component structure
- Modern layout patterns
- Match ClickUp design exactly
- Better maintainability

**Chosen: Option B**

Reasoning:
- Current code too messy (1200+ lines)
- Layout fundamentally wrong
- Easier to build correctly from scratch
- Can reuse existing hooks/logic

### Component Structure

```
TaskDetailDialog/
├── TaskDetailDialog.tsx          (Main container - 200 lines)
├── TaskHeader.tsx                (Title + breadcrumb - 80 lines)
├── TaskMetadata.tsx              (Status/Dates/Assignee grid - 150 lines)
├── TaskDescription.tsx           (Description editor - 120 lines)
├── TaskTabs.tsx                  (Details/Subtasks/Actions - 100 lines)
├── TaskActivity.tsx              (Right sidebar - 180 lines)
├── hooks/
│   ├── useTaskDetail.ts          (Main state logic - 150 lines)
│   ├── useTaskUpdates.ts         (API calls - 100 lines)
│   └── useTaskValidation.ts      (Field validation - 80 lines)
└── types.ts                      (TypeScript interfaces - 60 lines)
```

**Total**: ~1,220 lines (same as current, but organized)

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ [X] Research how to crush the competition        [Close]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [Task ID] 9c214y  [Ask AI]                              │
│                                                          │
│ ┌──────────────────────────┐  ┌────────────────────┐   │
│ │                          │  │                    │   │
│ │  LEFT CONTENT            │  │  RIGHT SIDEBAR     │   │
│ │                          │  │                    │   │
│ │  - AI Prompt Bar         │  │  Activity          │   │
│ │  - Metadata Grid         │  │  - Search          │   │
│ │  - Description           │  │  - Notifications   │   │
│ │  - Tabs                  │  │  - Timeline        │   │
│ │    • Details             │  │  - Comment Input   │   │
│ │    • Subtasks            │  │                    │   │
│ │    • Action Items        │  │                    │   │
│ │                          │  │                    │   │
│ └──────────────────────────┘  └────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Component Structure ✅ COMPLETE (2025-11-29 14:32 UTC)

**Goal**: Create new component files with basic layout

**Tasks**:
1. ✅ Create `TaskDetailDialog/` folder structure
2. ✅ Build `TaskHeader.tsx`:
   - Task title (editable inline)
   - Breadcrumb (Space → Project → Phase)
   - Task ID badge
   - Ask AI button
   - Close button
3. ✅ Build `TaskMetadata.tsx`:
   - 2-column grid layout
   - Status selector (pill style)
   - Assignees (avatar bubbles)
   - Dates (range picker)
   - Time Estimate
   - Track Time
   - Relationships
4. ✅ Create layout wrapper with left/right split

**Acceptance Criteria**:
- ✅ Clean white background
- ✅ Proper spacing (16px/24px grid)
- ✅ Responsive 2-column grid for metadata
- ✅ Header with all elements positioned correctly

**Completion Summary**:
- **Time Spent**: 90 minutes (3h estimated, completed early)
- **Files Created**: 9 component files (461 total lines)
- **Build Status**: ✅ Success (0 TS errors)
- **Code Quality**: All TypeScript types properly defined
- **Status**: Ready for Phase 2

**Report**: See `reports/phase-01-summary.md`

### Phase 2: Description & AI Integration (2 hours)

**Goal**: Rich text editor with AI assist

**Tasks**:
1. Build `TaskDescription.tsx`:
   - RichTextEditor integration (TipTap)
   - "Add description" button state
   - "Write with AI" button
   - Auto-save debounce (1s)
   - Character count
2. Add AI prompt bar (top of left content):
   - Brain icon
   - "Ask Brain to write description, create summary, find similar tasks"
   - Input field
   - Submit button

**Acceptance Criteria**:
- Description saves to backend
- AI buttons render (functionality Phase 5)
- Clean, minimal styling
- Inline editing UX

### Phase 3: Tabs & Content Areas (3 hours)

**Goal**: Tabbed interface for Details/Subtasks/Actions

**Tasks**:
1. Build `TaskTabs.tsx`:
   - Tab navigation (Details/Subtasks/Action Items)
   - Tab content containers
   - Active state styling
2. Details Tab:
   - Custom fields section
   - Checklist items
   - Attachments area
3. Subtasks Tab:
   - "+ Add Task" button
   - Subtask list
   - Nested task rendering
   - Drag to reorder
4. Action Items Tab:
   - Checklist with checkboxes
   - Add action item
   - Mark complete

**Acceptance Criteria**:
- Tabs switch content correctly
- Subtasks load from API
- Add subtask creates new task
- Action items persist

### Phase 4: Activity Sidebar (2 hours)

**Goal**: Right sidebar with activity timeline

**Tasks**:
1. Build `TaskActivity.tsx`:
   - Search activity input
   - Notification bell (0 badge)
   - Filter dropdown
   - Activity timeline items:
     - User avatar
     - Action description
     - Timestamp
     - "Show more" expand
   - Comment input:
     - "@mention" support
     - Attachment icons
     - AI assist icon
     - Send button

**Acceptance Criteria**:
- Activity loads from backend
- Comments post successfully
- Timeline sorted by date DESC
- "Show more" expands truncated items

### Phase 5: Polish & Interactions (2 hours)

**Goal**: Hover states, transitions, micro-interactions

**Tasks**:
1. Status pill hover → shows dropdown
2. Assignee hover → tooltip with name
3. Date fields → calendar popover
4. Field empty states → "Empty" gray text
5. Loading states → skeleton loaders
6. Error states → inline validation
7. Success toasts → subtle notifications
8. Keyboard shortcuts:
   - ESC → close dialog
   - Cmd/Ctrl+S → save
   - Cmd/Ctrl+Enter → comment

**Acceptance Criteria**:
- Smooth transitions (150ms)
- Clear hover states
- Proper focus management
- Accessibility (ARIA labels)

### Phase 6: Backend Integration & Testing (2-3 hours)

**Goal**: Full API integration, E2E testing

**Tasks**:
1. Hook up all fields to backend:
   - Status → PATCH /api/tasks/{id}
   - Assignee → PATCH with assigneeID
   - Dates → PATCH with startDate/dueDate
   - Description → debounced PATCH
   - Comments → POST /api/comments
2. Error handling:
   - Network failures
   - Validation errors
   - Conflict resolution
3. Optimistic updates:
   - Update UI immediately
   - Revert on error
4. Testing:
   - Unit tests for hooks
   - Component tests
   - E2E workflow tests

**Acceptance Criteria**:
- All fields save correctly
- Errors show inline
- Optimistic updates work
- 200 OK responses
- Test coverage >80%

## Technical Specifications

### Styling Approach

**Use Tailwind + shadcn/ui**:
```typescript
// Clean white dialog
className="bg-white rounded-lg shadow-xl"

// Metadata grid
className="grid grid-cols-2 gap-4"

// Status pill (green complete)
className="bg-green-100 text-green-800 px-3 py-1 rounded-full"

// Sidebar
className="w-80 border-l border-gray-200 bg-gray-50"
```

### State Management

**Use hooks pattern**:
```typescript
const {
  task,
  isLoading,
  updateField,
  saveDescription,
  addComment
} = useTaskDetail(taskId);
```

**Debounce pattern**:
```typescript
const debouncedSave = useDebouncedCallback(
  (field, value) => tasksApi.update(taskId, { [field]: value }),
  1000
);
```

### API Integration

**Endpoints used**:
- GET /api/tasks/{id}
- PATCH /api/tasks/{id}
- POST /api/comments
- GET /api/tasks/{id}/comments
- GET /api/users (for assignees)
- POST /api/tasks (for subtasks)

### Performance Optimizations

1. **Lazy load activity**:
   ```typescript
   const { data: activity } = useInfiniteQuery(
     ['activity', taskId],
     fetchActivity,
     { staleTime: 30000 }
   );
   ```

2. **Virtualize long lists**:
   ```typescript
   import { useVirtualizer } from '@tanstack/react-virtual';
   ```

3. **Optimize re-renders**:
   ```typescript
   const MemoizedActivity = React.memo(TaskActivity);
   ```

## File Organization

### New Structure

```
src/components/TaskDetailDialog/
├── index.ts                    # Barrel export
├── TaskDetailDialog.tsx        # Main container
├── components/
│   ├── TaskHeader.tsx
│   ├── TaskMetadata.tsx
│   ├── TaskDescription.tsx
│   ├── TaskTabs.tsx
│   ├── TaskActivity.tsx
│   └── fields/
│       ├── StatusField.tsx
│       ├── AssigneeField.tsx
│       ├── DateRangeField.tsx
│       └── TimeEstimateField.tsx
├── hooks/
│   ├── useTaskDetail.ts
│   ├── useTaskUpdates.ts
│   └── useTaskValidation.ts
├── types.ts
└── styles.css                  # Component-specific styles
```

### Migration Strategy

**Step 1**: Create new files alongside old
**Step 2**: Implement new components
**Step 3**: Test thoroughly
**Step 4**: Replace old component import
**Step 5**: Delete old TaskDetailDialog.tsx

**Rollback**: Keep old file as `TaskDetailDialog.old.tsx` until confident

## Design Tokens

### Colors

```typescript
const COLORS = {
  status: {
    complete: { bg: '#E7F5ED', text: '#166534' },
    inProgress: { bg: '#DBEAFE', text: '#1E40AF' },
    todo: { bg: '#F3F4F6', text: '#4B5563' },
  },
  priority: {
    high: '#DC2626',
    medium: '#F59E0B',
    low: '#10B981',
  },
  background: {
    main: '#FFFFFF',
    sidebar: '#F9FAFB',
    hover: '#F3F4F6',
  }
};
```

### Spacing

```typescript
const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};
```

### Typography

```typescript
const TYPOGRAPHY = {
  title: 'text-2xl font-semibold',
  subtitle: 'text-sm font-medium text-gray-700',
  body: 'text-sm text-gray-600',
  meta: 'text-xs text-gray-500',
};
```

## Testing Strategy

### Unit Tests

```typescript
describe('TaskDetailDialog', () => {
  it('renders task title', () => {});
  it('updates status on click', () => {});
  it('saves description after 1s debounce', () => {});
  it('posts comment on submit', () => {});
});
```

### Integration Tests

```typescript
describe('Task Update Flow', () => {
  it('updates task and shows success toast', async () => {
    // Render dialog
    // Change status
    // Verify API call
    // Verify toast
  });
});
```

### E2E Tests

```typescript
test('Complete task workflow', async ({ page }) => {
  await page.goto('/workspace');
  await page.click('[data-testid="task-card"]');
  await page.click('[data-testid="status-selector"]');
  await page.click('text=Complete');
  await expect(page.locator('.toast')).toHaveText('Status updated');
});
```

## Risks & Mitigation

### High Risk: Breaking Existing Functionality

**Risk**: New implementation breaks working features
**Mitigation**:
- Keep old component as backup
- Feature flag new dialog
- Gradual rollout
- Comprehensive testing

### Medium Risk: API Integration Issues

**Risk**: Backend API doesn't support all fields
**Mitigation**:
- Verify API endpoints first
- Mock missing endpoints
- Document API gaps
- Plan backend changes

### Medium Risk: Performance Degradation

**Risk**: Rich features slow down dialog
**Mitigation**:
- Lazy load activity
- Debounce all updates
- Memoize components
- Profile performance

### Low Risk: Design Drift

**Risk**: Implementation doesn't match design
**Mitigation**:
- Pixel-perfect comparison
- Design review checkpoints
- Screenshot regression tests

## Success Metrics

### Functional Metrics

- [ ] All fields save correctly (100%)
- [ ] No console errors
- [ ] API response time <500ms
- [ ] Dialog opens in <200ms
- [ ] Test coverage >80%

### UX Metrics

- [ ] Matches ClickUp design 95%+
- [ ] Smooth animations (60fps)
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Mobile responsive (future)

### Code Quality Metrics

- [ ] Files <200 lines each
- [ ] No duplicate code
- [ ] TypeScript strict mode
- [ ] ESLint 0 warnings
- [ ] Components reusable

## Rollout Plan

### Week 1: Core Structure
- Day 1-2: Phase 1 (Components)
- Day 3: Phase 2 (Description)
- Day 4: Phase 3 (Tabs)
- Day 5: Phase 4 (Activity)

### Week 2: Polish & Launch
- Day 1: Phase 5 (Interactions)
- Day 2-3: Phase 6 (Integration)
- Day 4: Bug fixes
- Day 5: Production deploy

## Dependencies

### External Libraries

```json
{
  "@tiptap/react": "^2.1.0",              // Rich text editor
  "@tanstack/react-query": "^5.0.0",      // Data fetching
  "@tanstack/react-virtual": "^3.0.0",    // List virtualization
  "date-fns": "^2.30.0",                  // Date formatting
  "react-hot-toast": "^2.4.0"             // Toasts (or keep sonner)
}
```

### Internal Dependencies

- shadcn/ui components (already installed)
- tasksApi, usersApi, commentsApi
- Existing types from api.ts

## Open Questions

1. **AI Integration**: Should AI features be real or placeholders?
   - Recommendation: Placeholders for Phase 1-5, real integration Phase 7

2. **Time Tracking**: Full time tracking feature or simple estimate field?
   - Recommendation: Start with estimate only, add tracking later

3. **Relationships**: Support which types? (Blocks, Blocked by, Related to)
   - Recommendation: All three types, backend needs support first

4. **Subtask Depth**: How many levels of nesting allowed?
   - Recommendation: 2 levels (parent → child only)

5. **Activity Filter**: Which filters needed? (Comments, Changes, All)
   - Recommendation: All three filters

6. **Mobile**: Responsive or desktop-only?
   - Recommendation: Desktop-first, mobile Phase 8

## Next Steps

1. **Review this plan** with team/user
2. **Verify backend API** endpoints availability
3. **Create design mockups** in Figma (optional)
4. **Set up feature flag** for gradual rollout
5. **Begin Phase 1** implementation

---

**Estimated Total**: 12-16 hours (can parallelize some phases)
**Priority**: High (blocks other UX improvements)
**Complexity**: High (full redesign + new features)
**Risk Level**: Medium (mitigated with rollback plan)
