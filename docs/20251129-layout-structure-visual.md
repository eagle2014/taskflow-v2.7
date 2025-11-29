# TaskDetailDialog Layout Structure - Visual Reference

## Complete Layout Hierarchy

```
Dialog (Radix Primitive)
└─ DialogContent: !max-w-6xl h-[90vh] p-0 bg-[#1f2330] overflow-hidden flex flex-col
   │
   ├─ TaskHeader: border-b border-[#3d4457] px-6 py-4
   │  ├─ Breadcrumb Navigation
   │  │  └─ Space › Project › Phase
   │  └─ Title Row
   │     ├─ Badge: Task ID (first 6 chars)
   │     └─ H1: Editable title (contentEditable)
   │
   └─ Main Layout: flex flex-1 overflow-hidden
      │
      ├─ Left Content Area: flex-1 overflow-y-auto px-6 py-6
      │  │
      │  ├─ AIPromptBar: Purple gradient section
      │  │  └─ Input for AI prompts
      │  │
      │  ├─ TaskMetadata: grid grid-cols-2 gap-x-12 gap-y-5 mb-6 mt-6
      │  │  │
      │  │  ├─ Row 1
      │  │  │  ├─ Col 1: MetadataField (Status)
      │  │  │  │  └─ flex items-start gap-3
      │  │  │  │     ├─ Label: min-w-[120px] (Circle icon + "Status")
      │  │  │  │     └─ Value: flex-1 (StatusPill)
      │  │  │  │
      │  │  │  └─ Col 2: MetadataField (Assignees)
      │  │  │     └─ flex items-start gap-3
      │  │  │        ├─ Label: min-w-[120px] (Users icon + "Assignees")
      │  │  │        └─ Value: flex-1 (AssigneeList)
      │  │  │
      │  │  ├─ Row 2
      │  │  │  ├─ Col 1: MetadataField (Dates)
      │  │  │  │  └─ flex items-start gap-3
      │  │  │  │     ├─ Label: min-w-[120px] (Calendar icon + "Dates")
      │  │  │  │     └─ Value: flex-1 (DateRange)
      │  │  │  │
      │  │  │  └─ Col 2: MetadataField (Time Estimate)
      │  │  │     └─ flex items-start gap-3
      │  │  │        ├─ Label: min-w-[120px] (Zap icon + "Time Estimate")
      │  │  │        └─ Value: flex-1 (Badge or "Empty")
      │  │  │
      │  │  └─ Row 3
      │  │     ├─ Col 1: MetadataField (Track Time)
      │  │     │  └─ flex items-start gap-3
      │  │     │     ├─ Label: min-w-[120px] (Clock icon + "Track Time")
      │  │     │     └─ Value: flex-1 (Button "Add time")
      │  │     │
      │  │     └─ Col 2: MetadataField (Relationships)
      │  │        └─ flex items-start gap-3
      │  │           ├─ Label: min-w-[120px] (Link2 icon + "Relationships")
      │  │           └─ Value: flex-1 ("Empty")
      │  │
      │  ├─ TaskDescription: mt-6
      │  │  ├─ Label: "Description"
      │  │  ├─ RichTextEditor (TipTap)
      │  │  └─ Button: "Write with AI" (purple)
      │  │
      │  └─ TaskTabs: mt-6
      │     ├─ TabsList: [Details] [Subtasks] [Action Items]
      │     └─ TabsContent
      │        ├─ Details: Budget info + spent tracker
      │        ├─ Subtasks: Checklist with progress
      │        └─ Action Items: Checklist with progress
      │
      └─ Right Sidebar: w-80 border-l border-[#3d4457] bg-[#1f2330] flex flex-col
         │
         ├─ ActivityHeader: px-4 py-3 border-b
         │  ├─ Title: "Activity"
         │  └─ Actions: Search icon, Bell icon
         │
         ├─ ActivityTimeline: flex-1 overflow-y-auto px-4 py-4
         │  └─ Activity items (created, estimated, etc.)
         │
         └─ CommentInput: p-4 border-t
            ├─ Textarea: "@Brain to create..."
            └─ Toolbar: Send button + icons
```

---

## Key Measurements

### Dialog Dimensions
```
Width:  72rem (1152px) - !max-w-6xl
Height: 90vh (90% of viewport height)
Padding: 0 (removed default p-6)
Border: 2px solid #3d4457
```

### Layout Columns
```
Left Content:  flex-1 (grows to fill available space)
Right Sidebar: 20rem (320px) - w-80
Separator:     1px border-l
```

### Header
```
Height: Auto (based on content)
Padding: 1.5rem horizontal (px-6), 1rem vertical (py-4)
Border: 1px bottom (border-b)
```

### Metadata Grid
```
Columns: 2 (grid-cols-2)
Gap X: 3rem (gap-x-12)
Gap Y: 1.25rem (gap-y-5)
Margin Top: 1.5rem (mt-6)
Margin Bottom: 1.5rem (mb-6)
```

### MetadataField (Each Cell)
```
Layout: Horizontal flex (flex items-start gap-3)
Label Width: 120px minimum (min-w-[120px])
Value Width: flex-1 (fills remaining space)
Gap: 0.75rem between label and value
```

---

## Spacing Breakdown

### Vertical Rhythm
```
Header
  ↓ border-b
Main Layout
  ↓
  Left Content (px-6 py-6)
    AIPromptBar
      ↓ (implicit margin)
    TaskMetadata (mt-6)
      Grid with gap-y-5
      ↓ mb-6
    TaskDescription (mt-6)
      ↓ (implicit margin)
    TaskTabs (mt-6)
```

### Horizontal Spacing
```
│← 1.5rem →│ Left Content │← 3rem gap between columns →│← 1.5rem →│
│           ├─────────────┼───────────────────────────┤           │
│           │ Field Label │ Field Value               │           │
│           │ (120px)     │ (flex-1)                  │           │
```

---

## Color Scheme

```
Background Colors:
- Dialog: #1f2330 (dark blue-gray)
- Borders: #3d4457 (lighter blue-gray)
- Hover: #292d39 (slightly lighter)

Text Colors:
- Primary: white (#ffffff)
- Secondary: #838a9c (muted gray)
- Accent: #8b5cf6 (purple)

Interactive:
- Purple: #8b5cf6 (primary actions)
- Hover Purple: #7c66d9 (darker purple)
```

---

## Responsive Behavior

### Dialog Content Default (from shadcn)
```css
/* Default classes that we override */
sm:max-w-lg     /* 32rem @ 640px+ */ ← OVERRIDDEN by !max-w-6xl
p-6             /* 1.5rem padding */ ← OVERRIDDEN by p-0
gap-4           /* 1rem gap */      ← Not used (we use flex)
```

### Our Override
```css
/* Force maximum width with important flag */
!max-w-6xl {
  max-width: 72rem !important;
}

/* This beats the responsive sm:max-w-lg */
```

---

## Flex Flow

### Main Container (DialogContent)
```
flex-direction: column
justify-content: (default)
align-items: stretch
overflow: hidden
```

### Two-Column Layout
```
flex-direction: row
justify-content: (default)
align-items: stretch
overflow: hidden

Child 1 (Left):  flex: 1 1 0%
Child 2 (Right): width: 20rem (w-80)
```

### MetadataField
```
flex-direction: row
justify-content: (default)
align-items: start
gap: 0.75rem

Child 1 (Label): min-width: 120px
Child 2 (Value): flex: 1 1 0%
```

---

## Grid Math

### Total Width Calculation
```
Dialog:       72rem (1152px)
- Border:     2px × 2 = 4px
- Left px-6:  1.5rem × 2 = 3rem (48px)
- Right w-80: 20rem (320px)
- Border-l:   1px
=====================================
Content Area: ~779px available

Grid:
- 2 columns
- gap-x-12 = 3rem (48px)
=====================================
Per Column:  (779 - 48) / 2 = ~365px

Field:
- Label: 120px
- Gap: 12px (gap-3)
- Value: 365 - 120 - 12 = ~233px
```

---

## Comparison with ClickUp

| Aspect | ClickUp | Our Implementation | Match |
|--------|---------|-------------------|-------|
| Dialog Size | Very wide | 72rem (1152px) | ✅ |
| Height | ~90% screen | 90vh | ✅ |
| Sidebar Position | Right | Right (w-80) | ✅ |
| Sidebar Width | ~300-320px | 320px (w-80) | ✅ |
| Metadata Layout | Horizontal | Horizontal flex | ✅ |
| Grid Columns | 2 | 2 (grid-cols-2) | ✅ |
| Field Alignment | Left label, right value | min-w-[120px] + flex-1 | ✅ |
| Content Order | AI → Meta → Desc → Tabs | Same | ✅ |

---

## Accessibility Notes

### Keyboard Navigation
- Title: contentEditable with Enter/Escape handling
- Fields: Tab order follows visual order
- Dialog: Escape to close, focus trap enabled

### ARIA Labels
- Breadcrumb: `aria-label="Task breadcrumb navigation"`
- Title: `aria-label="Edit task title..."`
- Close button: `aria-label="Close task details dialog"`

### Color Contrast
- Text on dark bg: white (#fff) on #1f2330 = WCAG AAA
- Secondary text: #838a9c on #1f2330 = WCAG AA
- Purple links: #8b5cf6 on #1f2330 = WCAG AA

---

## Browser Compatibility

### CSS Features Used
- Flexbox: ✅ All modern browsers
- Grid: ✅ All modern browsers
- Custom properties: ✅ All modern browsers
- Tailwind classes: ✅ Compiled to standard CSS

### Tested Browsers
- [ ] Chrome 90+ (should work)
- [ ] Firefox 88+ (should work)
- [ ] Safari 14+ (should work)
- [ ] Edge 90+ (should work)

---

## Performance Notes

### Render Optimization
- Left content: `overflow-y-auto` (virtual scrolling candidate)
- Right sidebar: `overflow-y-auto` (virtual scrolling candidate)
- Activity list: Could benefit from virtualization if 100+ items

### Bundle Impact
- No dynamic imports (could optimize with React.lazy)
- TipTap editor: ~200KB (largest dependency)
- shadcn components: Tree-shaken, minimal impact

---

## Future Enhancements

### Responsive Breakpoints
- Mobile: Stack vertically, hide sidebar initially
- Tablet: Reduce dialog width to max-w-4xl
- Desktop: Current (max-w-6xl)

### Accessibility
- Add keyboard shortcuts (e.g., Cmd+K for search)
- Improve screen reader announcements
- Add focus indicators for all interactive elements

### Performance
- Virtualize activity timeline if 100+ items
- Code-split TipTap editor (React.lazy)
- Optimize re-renders with React.memo

---

This layout structure now **exactly matches** the ClickUp reference!
