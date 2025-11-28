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

**Last Updated:** 2025-11-26
**Version:** 1.1.0
