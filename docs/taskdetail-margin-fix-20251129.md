# TaskDetailDialog Margin Fix

**Date**: 2025-11-29
**Status**: ✅ FIXED

## Change
Dialog margins increased 150px → 200px per edge (300px → 400px total)

## File Modified
`src/components/TaskDetailDialog/TaskDetailDialog.tsx:132`

## Before/After
**Before**: `!max-w-[calc(100vw-300px)] h-[calc(100vh-300px)]`
**After**: `!max-w-[calc(100vw-400px)] h-[calc(100vh-400px)]`

## Layout Impact
On 1920x1080 screen:
- Dialog width: 1536px (80vw)
- Horizontal space: 1520px (1920 - 400)
- Vertical space: 680px (1080 - 400)
- Padding: 200px all edges

## Build Status
✅ Passed (4.75s, 0 errors)

## User Request
"cho nó tăng lên 50cm căn lề đi" - Increase margins 50px more
