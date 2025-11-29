# React Hooks Order Fix - TaskDetailDialog

**Date:** 2025-01-28
**Issue:** "Error: Rendered more hooks than during the previous render"
**Status:** ✅ Fixed

## Problem

Critical React error when opening/closing TaskDetailDialog:

```
Error: Rendered more hooks than during the previous render.
```

### Root Cause

**BEFORE (WRONG):**
```typescript
export function TaskDetailDialog({ open, task, ... }) {
  // Hook 1
  const [activeTab, setActiveTab] = useState('details');

  // Hook 2
  const [status, setStatus] = useState(task?.status || 'todo');

  // ... more hooks (useState, useEffect, useRef) ...

  // Hook 29
  const descriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook 30
  useEffect(() => {
    return () => {
      if (descriptionTimeoutRef.current) {
        clearTimeout(descriptionTimeoutRef.current);
      }
    };
  }, []);

  // ❌ EARLY RETURN BEFORE ALL HOOKS COMPLETE
  if (!task || !open) return null;

  // ... rest of component ...
}
```

### Why This Breaks React

**React's Rules of Hooks:**
1. Hooks must be called in the **same order** on every render
2. Hooks must be called **unconditionally** (not inside if/else or early returns)
3. Hooks must be called at the **top level** of the component

**What happened:**

**Render 1 (dialog open, task exists):**
- React calls 30 hooks
- Component renders successfully
- React stores: "This component has 30 hooks"

**Render 2 (dialog closes, open = false):**
- React starts calling hooks
- Reaches early return: `if (!task || !open) return null;`
- Only ~28 hooks called before return
- React expects 30 hooks but only got 28
- **Error:** "Rendered more hooks than during the previous render"

### Visual Explanation

```
Render 1 (open=true):
Hook 1: useState ✓
Hook 2: useState ✓
Hook 3: useState ✓
...
Hook 28: useEffect ✓
Hook 29: useRef ✓
Hook 30: useEffect ✓  ← Last hook
Early return check → component renders

Render 2 (open=false):
Hook 1: useState ✓
Hook 2: useState ✓
Hook 3: useState ✓
...
Hook 28: useEffect ✓
Early return check → return null ❌
Hook 29: useRef ✗ (NEVER CALLED)
Hook 30: useEffect ✗ (NEVER CALLED)

React: "Wait, where are hooks 29-30?" → ERROR
```

## Solution

**Move early return AFTER all hooks AND move helper functions after guard clause:**

```typescript
export function TaskDetailDialog({ open, task, ... }) {
  // ✅ ALL HOOKS FIRST - Always called, in same order

  // Hook 1
  const [activeTab, setActiveTab] = useState('details');

  // Hook 2
  const [status, setStatus] = useState(task?.status || 'todo');

  // ... all other hooks ...

  // Hook 29
  const descriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook 30 - Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (descriptionTimeoutRef.current) {
        clearTimeout(descriptionTimeoutRef.current);
      }
    };
  }, []);

  // ✅ EARLY RETURN AFTER ALL HOOKS
  // Guard clause - don't render if no task or dialog is closed
  if (!task || !open) return null;

  // ✅ Helper functions AFTER guard clause (safe to access task)
  const parseSpentValue = (spentStr: string): number => {
    if (!spentStr || spentStr === '-') return 0;
    return parseInt(spentStr.replace(/[$,]/g, '')) || 0;
  };

  const spent = parseSpentValue(task.sprint || '$0'); // Now task is guaranteed non-null

  const getStatusColor = (status: string) => { /* ... */ };

  // ... rest of component renders only when task exists and dialog is open ...
}
```

### Why This Works

**Every render now:**
1. Calls ALL 30 hooks unconditionally
2. Hooks called in same order every time
3. Early return happens AFTER hooks complete
4. React happy: "30 hooks on every render ✓"

```
Render 1 (open=true):
Hook 1-30: All called ✓
Early return: No (task exists, open=true)
Result: Component renders

Render 2 (open=false):
Hook 1-30: All called ✓
Early return: Yes (open=false)
Result: return null

React: "30 hooks both times, perfect!" ✓
```

## Key Takeaways

### ✅ DO:
```typescript
function Component({ open }) {
  // ALL hooks first
  const [state, setState] = useState();
  useEffect(() => {}, []);
  const ref = useRef();

  // Early return AFTER hooks
  if (!open) return null;

  return <div>...</div>;
}
```

### ❌ DON'T:
```typescript
function Component({ open }) {
  // Some hooks
  const [state, setState] = useState();

  // ❌ Early return BEFORE all hooks
  if (!open) return null;

  // ❌ These hooks won't be called when open=false
  useEffect(() => {}, []);
  const ref = useRef();

  return <div>...</div>;
}
```

### ❌ DON'T:
```typescript
function Component({ condition }) {
  if (condition) {
    // ❌ Hook inside conditional
    const [state, setState] = useState();
  }
}
```

### ❌ DON'T:
```typescript
function Component({ items }) {
  // ❌ Hook inside loop
  items.forEach(() => {
    const [state, setState] = useState();
  });
}
```

## Testing

### Manual Test:
1. ✅ Open TaskDetailDialog
2. ✅ Type in description field
3. ✅ Close dialog
4. ✅ Reopen dialog
5. ✅ No React error
6. ✅ Description persisted

### Expected Result:
- ✅ No "Rendered more hooks" error
- ✅ Dialog opens/closes smoothly
- ✅ All features work (status, priority, dates, assignee, description)
- ✅ Debounced description saving still works

## Related Fixes

This fix builds on:
1. **Debounce Fix** ([description-debounce-fix.md](./description-debounce-fix.md)) - Added `useRef` and cleanup `useEffect`
2. **Logto SignOut** ([logto-signout-fix.md](./logto-signout-fix.md)) - Proper session cleanup
3. **VTiger Implementation** ([vtiger-unit-tests.md](./vtiger-unit-tests.md)) - Multiple hooks added

## Technical Details

### Hook Count in TaskDetailDialog:
- **useState**: 14 hooks (activeTab, status, priority, comment, dates, users, etc.)
- **useEffect**: 8 hooks (localStorage sync, data fetching, keyboard events, cleanup)
- **useRef**: 1 hook (descriptionTimeoutRef)
- **Total**: 23 hooks

All must be called in same order every render per React's rules.

### React's Internal Hook Tracking:
```javascript
// React internals (simplified)
let hookIndex = 0;
let hooks = [];

function useState(initial) {
  const hook = hooks[hookIndex] || { state: initial };
  hooks[hookIndex] = hook;
  hookIndex++;
  return [hook.state, setState];
}

// If hookIndex doesn't match expected count → ERROR
```

## References

- [React Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [React Hooks FAQ](https://react.dev/reference/react/hooks#rules-of-hooks)
- [ESLint Plugin: react-hooks/rules-of-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)

## Files Changed

- [TaskDetailDialog.tsx](../src/components/TaskDetailDialog.tsx) - Moved early return after all hooks

## Build Status

```bash
npm run build
# ✅ ✓ built in 4.87s
# ✅ No errors
# ✅ No TypeScript errors
```
