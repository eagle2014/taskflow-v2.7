# Design Guidelines

## Build Configuration

### Vite Plugin Strategy

**Standard:** Use `@vitejs/plugin-react-swc` exclusively for React JSX transformation.

**Rationale:**
- Faster builds with SWC compiler vs Babel
- Consistent JSX transformation across development and production
- Prevents `_jsxDEV is not a function` errors from plugin conflicts

**Configuration:**
```typescript
// vite.config.ts
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  // ...
});
```

**Package Management:**
- Keep `@vitejs/plugin-react-swc` in `devDependencies` only
- Do NOT include both `@vitejs/plugin-react` and `@vitejs/plugin-react-swc`
- Version: `^3.10.2` or later

### Critical Rules

1. **Single React Plugin:** Never install both Vite React plugins simultaneously
2. **Cache Management:** Clear `node_modules/.vite` cache after plugin changes
3. **Dev Server:** Always restart Vite dev server after configuration changes

## React Configuration

### JSX Runtime

Using React 18.3.1+ with automatic JSX runtime:
- No need for `import React` in component files
- JSX transformed automatically by SWC
- Development mode uses `_jsxDEV` for better debugging

### Component Standards

**File Naming:**
- Components: PascalCase (e.g., `TaskCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Styles: kebab-case (e.g., `task-card.css`)

**Import Order:**
1. React/React DOM
2. External libraries
3. Internal components
4. Utilities/hooks
5. Types
6. Styles

## Troubleshooting

### JSX Transform Errors

**Symptom:** `Uncaught TypeError: _jsxDEV is not a function`

**Solution:**
1. Check `vite.config.ts` uses correct plugin import
2. Verify `package.json` has only one React plugin
3. Clear cache: `rm -rf node_modules/.vite`
4. Reinstall: `npm install`
5. Restart dev server: `npm run dev`

### Common Issues

- **Plugin mismatch:** Mixing `@vitejs/plugin-react` and `@vitejs/plugin-react-swc`
- **Stale cache:** Old transformation code cached in `node_modules/.vite`
- **Version conflicts:** Multiple React plugin versions installed

## Development Workflow

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Ports
- Development: `http://localhost:3000` (configured in vite.config.ts)
- Auto-open browser on dev server start

## Layout Patterns

### Full-Width Flex Layouts

**Problem:** Nested flex containers often cause width constraints and unwanted overflow.

**Solution Pattern:**
1. Root container: Use `w-screen` for absolute viewport width
2. Flex children: Always add `min-w-0` to prevent flex overflow
3. Content areas: Explicitly declare `w-full` at each nesting level
4. Scrollable areas: Combine `w-full` with `min-w-0` for proper overflow

**Example:**
```tsx
<div className="h-screen w-screen flex flex-col">
  <div className="flex-1 w-full flex overflow-hidden min-w-0">
    <Sidebar className="w-60" />
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
      <Toolbar className="w-full" />
      <div className="flex-1 overflow-hidden w-full min-w-0">
        <Content className="h-full w-full min-w-0" />
      </div>
    </div>
  </div>
</div>
```

**Key Rules:**
- Flex parent with `flex-1` child → Child needs `min-w-0`
- Nested flex layouts → Each level needs explicit `w-full`
- Horizontal scroll → Use `min-w-fit` on content wrapper
- Fixed sidebars → Use absolute widths (e.g., `w-60`)

**Reference:** See `docs/layout-fix-report-20251126.md` for detailed implementation.

---

## Future Considerations

- Monitor SWC plugin updates for React 19 compatibility
- Consider TypeScript strict mode configuration
- Evaluate bundler alternatives (Turbopack, etc.) when stable
- Add visual regression tests for layout patterns

---

## ClickUp-Style Dark Theme Design System

### Color Tokens

**Background Layers:**
- Primary BG: `#1a1d21` (main background)
- Secondary BG: `#1f2330` (dialog/card background)
- Tertiary BG: `#25282c` (elevated card background)
- Input BG: `#292d39` (input fields, dropdowns)
- Border: `#3d4457` (borders, dividers)
- Hover BG: `#181c28` (hover states)

**Text:**
- Primary: `#ffffff` (white - headings, important text)
- Secondary: `#838a9c` (gray - labels, descriptions)
- Muted: `#6b7280` (extra muted text)

**Accents:**
- Primary (Purple): `#8b5cf6` (ClickUp brand, active states)
- Primary Hover: `#7c66d9` (purple hover)
- Blue: `#0394ff` (secondary actions, links)
- Blue Hover: `#0570cd` (blue hover)

**Status Colors:**
- Green: `#10b981` (complete, success)
- Yellow: `#f59e0b` (in-progress, warning)
- Red: `#ef4444` (high priority, error)
- Orange: `#f97316` (medium priority)

### Typography

**Font Sizes:**
- Title: `text-2xl` (24px) - Task titles
- Heading: `text-lg` (18px) - Section headings
- Body: `text-sm` (14px) - Default body text
- Label: `text-xs` (12px) - Field labels, metadata
- Tiny: `text-[10px]` (10px) - Timestamps, badges

**Font Weights:**
- Semibold: `font-semibold` (600) - Headings
- Medium: `font-medium` (500) - Labels
- Normal: `font-normal` (400) - Body text

### Component Patterns

**Dialog Layout:**
```tsx
<Dialog className="bg-[#1f2330] border-2 border-[#3d4457]">
  <Header className="border-b border-[#3d4457]" />
  <Body className="flex">
    <LeftContent className="flex-1 overflow-y-auto" />
    <RightSidebar className="w-80 border-l border-[#3d4457]" />
  </Body>
</Dialog>
```

**Breadcrumb:**
```tsx
<nav className="text-sm text-[#838a9c]">
  <span className="text-[#8b5cf6]">Space</span>
  <ChevronRight className="w-4 h-4" />
  <span>Project</span>
  <ChevronRight className="w-4 h-4" />
  <span>Phase</span>
</nav>
```

**Status Pills:**
```tsx
// Complete
<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
  COMPLETE
</Badge>

// In Progress
<Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
  IN PROGRESS
</Badge>
```

**Tabs with Purple Underline:**
```tsx
<TabsList className="bg-transparent border-b border-[#3d4457]">
  <TabsTrigger className="
    bg-transparent
    border-b-2
    border-transparent
    data-[state=active]:border-[#8b5cf6]
    text-[#838a9c]
    data-[state=active]:text-white
  ">
    Details
  </TabsTrigger>
</TabsList>
```

**AI Prompt Bar:**
```tsx
<div className="flex items-center gap-2 text-sm">
  <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
  <span className="text-[#8b5cf6]">Ask Brain</span>
  <span className="text-[#838a9c]">to write a description...</span>
</div>
```

**Input Fields:**
```tsx
<Input className="
  bg-[#292d39]
  border-[#3d4457]
  text-white
  placeholder:text-[#838a9c]
  focus:border-[#8b5cf6]
  focus:ring-[#8b5cf6]
" />
```

**Metadata Grid:**
```tsx
<div className="grid grid-cols-2 gap-x-8 gap-y-4">
  <MetadataField
    icon={<Icon className="w-3 h-3 text-[#838a9c]" />}
    label="Field Name"
    labelClassName="text-xs text-[#838a9c]"
    value={<Value className="text-white" />}
  />
</div>
```

### Spacing Scale

- `px-6 py-4` - Dialog padding
- `gap-2` - Inline elements
- `gap-4` - Related sections
- `gap-6` - Major sections
- `mb-3` - Small vertical spacing
- `mb-4` - Medium vertical spacing
- `mb-6` - Large vertical spacing

### Interactive States

**Hover:**
- Background: `hover:bg-[#292d39]`
- Text: `hover:text-white`
- Border: `hover:border-[#8b5cf6]`

**Focus:**
- Ring: `focus:ring-2 focus:ring-[#8b5cf6]`
- Border: `focus:border-[#8b5cf6]`

**Active:**
- Purple underline for tabs
- Purple text for active items
- Slightly darker background

### Accessibility

- Maintain 4.5:1 contrast ratio for text
- Purple accents (#8b5cf6) pass WCAG AA on dark backgrounds
- Focus states visible with purple ring
- ARIA labels for all interactive elements

---

**Last Updated:** 2025-11-29
**Version:** 1.2.0 (ClickUp Dark Theme)
