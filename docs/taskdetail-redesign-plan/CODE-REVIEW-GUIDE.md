# Code Review Guide - Phase 1 TaskDetailDialog

**Date**: 2025-11-29
**Purpose**: Guide user through reviewing Phase 1 implementation
**Status**: Ready for review

---

## Quick Navigation

### Files to Review (in order)

1. **[types.ts](../../src/components/TaskDetailDialog/types.ts)** - Type definitions
2. **[TaskHeader.tsx](../../src/components/TaskDetailDialog/components/TaskHeader.tsx)** - Header component
3. **[TaskMetadata.tsx](../../src/components/TaskDetailDialog/components/TaskMetadata.tsx)** - Metadata grid
4. **[TaskDetailDialog.tsx](../../src/components/TaskDetailDialog/TaskDetailDialog.tsx)** - Main container
5. **Field Components**:
   - [MetadataField.tsx](../../src/components/TaskDetailDialog/fields/MetadataField.tsx)
   - [StatusPill.tsx](../../src/components/TaskDetailDialog/fields/StatusPill.tsx)
   - [AssigneeList.tsx](../../src/components/TaskDetailDialog/fields/AssigneeList.tsx)
   - [DateRange.tsx](../../src/components/TaskDetailDialog/fields/DateRange.tsx)

---

## Review Checklist

### 1. Type Safety (types.ts)

```typescript
// ✅ Check: Discriminated union for type-safe updates
export type TaskFieldUpdate =
  | { field: 'status'; value: WorkspaceTask['status'] }
  | { field: 'assignee'; value: WorkspaceTask['assignee'] }
  | ...
```

**What to verify**:
- [ ] No `any` types present
- [ ] All interfaces properly exported
- [ ] WorkspaceTask matches API structure
- [ ] TaskFieldUpdate covers all editable fields

**Key improvement**: Changed from `(field: string, value: any)` to discriminated union for compile-time type safety.

---

### 2. Security (TaskHeader.tsx)

```typescript
// ✅ Check: XSS protection
const sanitizeInput = useCallback((text: string): string => {
  return text
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>]/g, '')     // Remove angle brackets
    .trim()
    .substring(0, 200);       // Limit length
}, []);

// ✅ Check: Paste protection
const handlePaste = useCallback((e: React.ClipboardEvent) => {
  e.preventDefault();
  const text = e.clipboardData.getData('text/plain');
  const sanitized = sanitizeInput(text);
  document.execCommand('insertText', false, sanitized);
}, [sanitizeInput]);
```

**What to verify**:
- [ ] HTML tags are stripped on input
- [ ] Paste only accepts plain text
- [ ] Length limited to 200 characters
- [ ] No XSS vulnerabilities

**Try testing**:
1. Paste HTML: `<script>alert('xss')</script>`
2. Expected: Only text "alertxss" appears
3. Press Escape: Reverts to original title

---

### 3. Accessibility (TaskHeader.tsx)

```typescript
// ✅ Check: ARIA labels
<header className="..." aria-label="...">
  <nav aria-label="Task breadcrumb navigation">
    <button aria-label={`Navigate to ${spaceName}`}>

<h1
  role="textbox"
  aria-label="Edit task title. Press Enter to save, Escape to cancel"
  aria-multiline="false"
>

<Button aria-label="Ask AI for assistance">
<Button aria-label="Close task details dialog">
```

**What to verify**:
- [ ] All buttons have aria-label
- [ ] Breadcrumb has nav + aria-label
- [ ] Title has role="textbox" with instructions
- [ ] Icons have aria-hidden="true"

**Try testing**:
1. Tab through elements - Focus order logical?
2. Screen reader - Labels descriptive?
3. Keyboard only - All actions accessible?

---

### 4. Keyboard UX (TaskHeader.tsx)

```typescript
const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    titleRef.current?.blur(); // Save on Enter
  } else if (e.key === 'Escape') {
    e.preventDefault();
    // Revert changes on Escape
    if (titleRef.current) {
      titleRef.current.textContent = originalTitleRef.current;
      titleRef.current.blur();
    }
  }
}, []);
```

**What to verify**:
- [ ] Enter key saves changes
- [ ] Escape key reverts changes
- [ ] Focus ring visible
- [ ] No accidental saves

**Try testing**:
1. Click title, edit text
2. Press Escape → Should revert
3. Edit again, press Enter → Should save
4. Tab to buttons → Focus ring visible?

---

### 5. Performance (All components)

```typescript
// ✅ Check: useCallback for handlers
const handleTitleBlur = useCallback(() => { ... }, [task.name, onTitleChange, sanitizeInput]);
const handleKeyDown = useCallback((e: React.KeyboardEvent) => { ... }, []);
const handlePaste = useCallback((e: React.ClipboardEvent) => { ... }, [sanitizeInput]);
```

**What to verify**:
- [ ] All event handlers use useCallback
- [ ] Dependencies array correct
- [ ] No unnecessary re-renders
- [ ] Refs used for DOM access

**Why important**: Prevents child components from re-rendering on every parent render.

---

### 6. Layout Structure (TaskDetailDialog.tsx)

```typescript
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-6xl h-[90vh] p-0 bg-white">
    <TaskHeader ... />

    <div className="flex flex-1 overflow-hidden">
      {/* Left Content */}
      <div className="flex-1 overflow-y-auto">
        <TaskMetadata ... />
        {/* Future: Description, Tabs */}
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l border-gray-200 bg-gray-50">
        {/* Future: Activity */}
      </div>
    </div>
  </DialogContent>
</Dialog>
```

**What to verify**:
- [ ] Dialog max-w-6xl (1152px)
- [ ] Height 90vh
- [ ] Left content scrollable
- [ ] Right sidebar fixed 320px
- [ ] White background
- [ ] No unnecessary padding

---

### 7. Component Size (All files)

**What to verify**:
- [ ] types.ts: 79 lines ✅
- [ ] TaskHeader.tsx: 132 lines ✅
- [ ] TaskMetadata.tsx: 82 lines ✅
- [ ] TaskDetailDialog.tsx: 85 lines ✅
- [ ] All fields: <50 lines ✅

**Standard**: All components <150 lines

---

### 8. Visual Design (Browser testing needed)

Open browser at http://localhost:5600 and check:

**TaskHeader**:
- [ ] Breadcrumb: Gray text, chevron icons
- [ ] Task ID badge: Monospace font, 6 chars
- [ ] Title: 2xl font, editable, hover bg-gray-50
- [ ] Ask AI button: Outline, sparkles icon
- [ ] Close button: Ghost, X icon

**TaskMetadata**:
- [ ] 2-column grid
- [ ] 48px column gap, 24px row gap
- [ ] Icons aligned top-left
- [ ] Labels: text-sm font-medium
- [ ] Values aligned properly

**Layout**:
- [ ] White background (not dark gray)
- [ ] Left content takes remaining space
- [ ] Right sidebar 320px, gray-50 bg
- [ ] Border between left/right

---

## Common Issues to Check

### Issue 1: Type Errors
**Check**: Run `npm run build`
**Expected**: ✅ built in ~5s with 0 errors
**If failed**: Check TaskMetadata onUpdate calls match TaskFieldUpdate type

### Issue 2: Missing ARIA Labels
**Check**: Use browser DevTools Accessibility tab
**Expected**: All interactive elements labeled
**If failed**: Add aria-label to unlabeled elements

### Issue 3: XSS Not Working
**Test**: Paste `<b>bold</b>` in title
**Expected**: Only "bold" appears (no HTML)
**If failed**: Check sanitizeInput function

### Issue 4: Keyboard Nav Broken
**Test**: Tab through all elements
**Expected**: Logical focus order, visible focus ring
**If failed**: Check tabIndex and focus:ring classes

### Issue 5: Layout Not Responsive
**Test**: Resize browser window
**Expected**: Left content shrinks, sidebar stays 320px
**If failed**: Check flex-1 on left content

---

## Testing Steps

### 1. Build Verification
```bash
cd "d:\TFS\aidev\Modern Task Management System_v2.7"
npm run build
```
**Expected output**: ✅ built in 4-5s

### 2. Visual Inspection
1. Open http://localhost:5600
2. Navigate to a project workspace
3. Click on a task to open dialog
4. Check layout matches ClickUp design
5. Verify white background (not dark gray)

### 3. Interaction Testing
1. **Title editing**:
   - Click title → Should become editable
   - Type text → Should update
   - Press Enter → Should save
   - Press Escape → Should revert

2. **XSS protection**:
   - Paste HTML: `<script>alert('test')</script>`
   - Should only see: "alerttest"

3. **Keyboard navigation**:
   - Tab through all elements
   - Enter/Escape on title
   - Focus rings visible

4. **Accessibility**:
   - Use screen reader
   - All labels descriptive
   - Logical reading order

---

## Approval Checklist

Before approving Phase 1, verify:

- [ ] All 9 files created correctly
- [ ] Build passes (0 TypeScript errors)
- [ ] No `any` types
- [ ] XSS protection works
- [ ] ARIA labels present
- [ ] Keyboard shortcuts work
- [ ] Layout matches ClickUp design
- [ ] White background (not dark)
- [ ] Components <150 lines each
- [ ] Visual design clean and professional

---

## Questions to Ask

1. **Type Safety**: Are discriminated unions working correctly?
2. **Security**: Is XSS protection effective?
3. **Accessibility**: Can screen readers use this?
4. **UX**: Is keyboard navigation intuitive?
5. **Visual**: Does it match ClickUp design?

---

## If Issues Found

Report issues with:
- File name + line number
- Expected behavior
- Actual behavior
- Screenshot (if visual)

Format:
```
File: TaskHeader.tsx:95
Expected: Title should save on Enter
Actual: Nothing happens
Screenshot: [attach]
```

---

## Next Steps After Approval

1. Approve Phase 1 ✅
2. Begin Phase 2: Description & AI
3. Implement rich text editor (TipTap)
4. Add AI prompt bar
5. Auto-save with debounce

---

**Review Duration**: ~30 minutes
**Testing Duration**: ~15 minutes
**Total**: ~45 minutes to thoroughly review

Ready to approve? Reply with:
- "Approve Phase 1" → Proceed to Phase 2
- "Issue found: [description]" → Fix before continuing
- "Need clarification: [question]" → Answer questions
