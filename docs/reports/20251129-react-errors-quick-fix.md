# React Errors Quick Fix Reference

## Error → Fix Mapping

### 🔴 "Internal React error: Expected static flag was missing"

**Cause:** Early return before hooks (Rules of Hooks violation)

**Fix:**
```typescript
// ❌ WRONG
function Component({ data }) {
  if (!data) return null;  // Early return
  const [state, setState] = useState(0);  // Hook after conditional
}

// ✅ CORRECT
function Component({ data }) {
  const [state, setState] = useState(0);  // All hooks first
  if (!data) return null;  // Conditional return after hooks
}
```

**Location:** `TaskDetailDialog.tsx:29` → Fixed

---

### 🔴 "Function component cannot be given refs"

**Cause:** Component receives ref but doesn't use forwardRef

**Fix:**
```typescript
// ❌ WRONG
function Component(props) {
  return <div>{props.children}</div>;
}

// ✅ CORRECT
const Component = React.forwardRef((props, ref) => {
  return <div ref={ref}>{props.children}</div>;
});
Component.displayName = 'Component';
```

**Location:** `dialog.tsx:49` → Fixed

---

### 🔴 Tiptap Extension Configuration Error

**Cause:** Trying to disable non-existent extension in StarterKit

**Fix:**
```typescript
// ❌ WRONG
StarterKit.configure({
  link: false,  // StarterKit doesn't have 'link'
})

// ✅ CORRECT
StarterKit  // Use defaults, no invalid options
```

**Location:** `RichTextEditor.tsx:35` → Fixed

---

### 🔴 useEffect Dependency Warnings / Memory Leaks

**Cause:** Callback recreated every render, effect re-runs unnecessarily

**Fix:**
```typescript
// ❌ WRONG
useAutoSave(value, {
  onSave: (val) => {  // New function every render
    doSomething(val);
  }
});

// ✅ CORRECT
const handleSave = useCallback((val) => {
  doSomething(val);
}, [dependencies]);

useAutoSave(value, { onSave: handleSave });
```

**Location:** `TaskDetailDialog.tsx:120` → Fixed

---

## Verification

```bash
# Build should pass
npm run build
# ✓ built in 4.62s

# No console errors
npm run dev
# Open TaskDetailDialog - check browser console
```

---

## Prevention Checklist

- [ ] All hooks called unconditionally at top of component
- [ ] No early returns before hooks
- [ ] Components receiving refs use `forwardRef`
- [ ] Callbacks in effects are memoized with `useCallback`
- [ ] Extension/plugin configs use valid options only

---

## Common React Patterns

### Safe Conditional Rendering

```typescript
// Pattern 1: Optional chaining in hooks
const [value, setValue] = useState(data?.property || defaultValue);
if (!data) return null;

// Pattern 2: Conditional JSX
return (
  <Component>
    {data ? <Content data={data} /> : null}
  </Component>
);

// Pattern 3: Early Dialog return
return (
  <Dialog open={open}>
    {!data ? null : <DialogContent>...</DialogContent>}
  </Dialog>
);
```

### Proper Ref Forwarding

```typescript
// Component wrapper
const Wrapper = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <PrimitiveComponent ref={ref} {...props} />;
});
Wrapper.displayName = 'Wrapper';

// Usage
<Wrapper ref={myRef} />
```

### Callback Memoization

```typescript
// Dependencies: props/state used inside callback
const callback = useCallback((value) => {
  doSomething(value, prop1, state1);
}, [prop1, state1]);

// Pass to child or hook
<Child onEvent={callback} />
useEffect(() => { callback() }, [callback]);
```

---

## Files Fixed

1. ✅ `src/components/TaskDetailDialog/TaskDetailDialog.tsx`
2. ✅ `src/components/ui/dialog.tsx`
3. ✅ `src/components/RichTextEditor.tsx`

**Status:** All errors resolved, build passing
