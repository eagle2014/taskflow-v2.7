# TaskDetailDialog React Errors - Root Cause Analysis

**Date:** 2025-11-29
**Component:** TaskDetailDialog
**Severity:** HIGH - Component rendering failures

## Executive Summary

Multiple React errors in TaskDetailDialog caused by:
1. **Early return before hooks** (Rules of Hooks violation)
2. **Missing DialogContent forwardRef**
3. **Tiptap StarterKit Link extension conflict**
4. **Incorrect dependency in useAutoSave hook**

## Root Cause Analysis

### Error 1: "Internal React error: Expected static flag was missing"

**Location:** `src/components/TaskDetailDialog/TaskDetailDialog.tsx:29`

**Root Cause:** **CRITICAL - Rules of Hooks Violation**

```typescript
export function TaskDetailDialog({ open, onOpenChange, task, onTaskUpdate }: TaskDetailDialogProps) {
  // ❌ FATAL: Early return BEFORE hooks
  if (!task) return null;  // LINE 29

  // All hooks declared AFTER conditional return
  const [description, setDescription] = useState(task.description || '');  // LINE 31
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  // ... more hooks
}
```

**Why this breaks:**
- React hooks MUST be called in same order every render
- Early return causes hooks to be conditionally executed
- React's internal fiber tree expects consistent hook count
- Leads to "Expected static flag was missing" error

**Impact:** Component unmounting/remounting causes React internal state corruption

---

### Error 2: "Function component cannot be given refs"

**Location:** `src/components/ui/dialog.tsx:49-76`

**Root Cause:** DialogContent not using forwardRef but receives ref from Radix UI

```typescript
// ❌ CURRENT (no forwardRef)
function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showClose?: boolean }) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        // Radix UI tries to forward ref here but DialogContent doesn't accept it
        data-slot="dialog-content"
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
```

**Why this breaks:**
- Radix UI Dialog components expect refs for focus management
- DialogContent wrapper doesn't forward ref to DialogPrimitive.Content
- React throws error when trying to assign ref to function component

**Impact:** Focus management broken, accessibility issues, console errors

---

### Error 3: Tiptap Duplicate Extension Warning

**Location:** `src/components/RichTextEditor.tsx:34-38`

**Root Cause:** StarterKit already includes Link extension

```typescript
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      // ❌ WRONG: StarterKit doesn't have 'link' option
      link: false,  // LINE 37 - This does nothing
    }),
    // ... then Link is added separately
    Link.configure({ ... })  // LINE 42 - Creates duplicate
  ],
```

**Why this breaks:**
- StarterKit bundles: Document, Paragraph, Text, Bold, Italic, Strike, Code, etc.
- StarterKit does NOT include Link by default
- Attempting to disable non-existent `link: false` option
- Link extension added separately is fine, but config is wrong

**Note:** This is NOT causing duplicate - config is just ineffective. Real issue elsewhere if duplicates exist.

---

### Error 4: useAutoSave Hook Dependency Issue

**Location:** `src/components/TaskDetailDialog/hooks/useAutoSave.ts:48-54`

**Root Cause:** `onSave` dependency in cleanup effect without memoization

```typescript
// Effect 2: Save on unmount
useEffect(() => {
  return () => {
    if (value !== previousValueRef.current && !isSavingRef.current) {
      onSave(value);  // ❌ Using onSave directly
    }
  };
}, [value, onSave]);  // ❌ onSave changes every render if not memoized
```

**Why this could break:**
- If parent component doesn't memoize `onSave` callback
- Effect re-runs on every render
- Cleanup function reference changes constantly
- Could cause memory leaks or stale closures

**Current usage in TaskDetailDialog:**
```typescript
// LINE 120-128 - onSave is NOT memoized
useAutoSave(description, {
  delay: 1000,
  onSave: (value) => {  // ❌ New function every render
    if (onTaskUpdate && value !== task.description) {
      onTaskUpdate({ ...task, description: value });
      toast.success('Description saved');
    }
  },
});
```

---

## Specific Fix Recommendations

### Fix 1: Move null check after hooks (CRITICAL)

**File:** `src/components/TaskDetailDialog/TaskDetailDialog.tsx`

**Lines 22-30:** Change from:
```typescript
export function TaskDetailDialog({ open, onOpenChange, task, onTaskUpdate }: TaskDetailDialogProps) {
  // ❌ WRONG: Early return before hooks
  if (!task) return null;

  const [description, setDescription] = useState(task.description || '');
  // ... rest of hooks
```

**To:**
```typescript
export function TaskDetailDialog({ open, onOpenChange, task, onTaskUpdate }: TaskDetailDialogProps) {
  // ✅ CORRECT: All hooks first
  const [description, setDescription] = useState(task?.description || '');
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [actionItems, setActionItems] = useState<ActionItem[]>(task?.actionItems || []);
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'created',
      user: {
        name: task?.assignee?.name || 'You',
        avatar: task?.assignee?.avatar || '',
        initials: task?.assignee?.initials || 'Y',
        color: task?.assignee?.color || '#0ea5e9',
      },
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      content: 'created this task',
    },
    {
      id: '2',
      type: 'estimated',
      user: {
        name: task?.assignee?.name || 'You',
        avatar: task?.assignee?.avatar || '',
        initials: task?.assignee?.initials || 'Y',
        color: task?.assignee?.color || '#0ea5e9',
      },
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      content: 'estimated 8 weeks',
    },
  ]);

  // ✅ CORRECT: Conditional return AFTER all hooks
  if (!task) {
    return null;
  }
```

**Alternative approach (return early Dialog with null content):**
```typescript
export function TaskDetailDialog({ open, onOpenChange, task, onTaskUpdate }: TaskDetailDialogProps) {
  // All hooks first...

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!task ? null : (
        <DialogContent ...>
          {/* All dialog content */}
        </DialogContent>
      )}
    </Dialog>
  );
}
```

---

### Fix 2: Add forwardRef to DialogContent

**File:** `src/components/ui/dialog.tsx`

**Lines 49-76:** Change from:
```typescript
function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showClose?: boolean }) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(/* ... */)}
        {...props}
      >
        {children}
        {/* ... */}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
```

**To:**
```typescript
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { showClose?: boolean }
>(({ className, children, showClose = true, ...props }, ref) => {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}  // ✅ Forward the ref
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[30px] left-[180px] z-50 grid gap-4 rounded-lg border p-6 shadow-lg duration-200",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;
```

---

### Fix 3: Remove invalid StarterKit config

**File:** `src/components/RichTextEditor.tsx`

**Lines 34-38:** Change from:
```typescript
extensions: [
  StarterKit.configure({
    // ❌ WRONG: StarterKit doesn't have link option
    link: false,
  }),
  Placeholder.configure({ placeholder }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: 'text-[#0394ff] underline cursor-pointer' }
  })
]
```

**To:**
```typescript
extensions: [
  StarterKit,  // ✅ Use default - no link to disable
  Placeholder.configure({ placeholder }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: 'text-[#0394ff] underline cursor-pointer' }
  })
]
```

**Note:** If you DO want to customize StarterKit:
```typescript
StarterKit.configure({
  heading: { levels: [1, 2, 3] },
  bulletList: { keepMarks: true },
  orderedList: { keepMarks: true },
  // These are valid StarterKit options (not 'link')
})
```

---

### Fix 4: Memoize onSave callback in TaskDetailDialog

**File:** `src/components/TaskDetailDialog/TaskDetailDialog.tsx`

**Lines 119-128:** Change from:
```typescript
// ❌ WRONG: onSave recreated every render
useAutoSave(description, {
  delay: 1000,
  onSave: (value) => {
    if (onTaskUpdate && value !== task.description) {
      onTaskUpdate({ ...task, description: value });
      toast.success('Description saved');
    }
  },
});
```

**To:**
```typescript
import { useState, useCallback } from 'react';

// ... inside component

// ✅ CORRECT: Memoized callback
const handleDescriptionSave = useCallback((value: string) => {
  if (onTaskUpdate && value !== task.description) {
    onTaskUpdate({ ...task, description: value });
    toast.success('Description saved');
  }
}, [onTaskUpdate, task]);

useAutoSave(description, {
  delay: 1000,
  onSave: handleDescriptionSave,
});
```

---

## Summary of Changes

| File | Lines | Change | Severity |
|------|-------|--------|----------|
| `TaskDetailDialog.tsx` | 22-30 | Move null check after hooks | CRITICAL |
| `TaskDetailDialog.tsx` | 119-128 | Memoize onSave callback | MEDIUM |
| `dialog.tsx` | 49-76 | Add forwardRef to DialogContent | HIGH |
| `RichTextEditor.tsx` | 34-38 | Remove invalid StarterKit config | LOW |

## Testing Checklist

After fixes:
- [ ] No console errors when opening TaskDetailDialog
- [ ] Dialog closes properly with X button
- [ ] Title editing works (contentEditable)
- [ ] Description auto-saves after 1 second
- [ ] Rich text editor toolbar functions work
- [ ] No memory leaks when opening/closing dialog multiple times
- [ ] Focus management works correctly (keyboard navigation)

## Unresolved Questions

1. Are there routing errors mentioned in screenshot? Need actual screenshot to verify
2. Any performance issues with re-renders?
3. Does Tiptap extension duplication warning appear in console? (Config suggests it shouldn't)
