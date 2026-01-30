
# Plan: Fix Notification Popup Appearing Off-Screen

## Problem Summary

The notification popover is being positioned off-screen (too far to the right) making it unreadable. The session replay shows the popover receiving a `transform: translate(1029px, 57.5px)` which pushes it off the visible area.

## Root Cause

The `PopoverContent` component in `src/components/ui/popover.tsx` has `fixed` appended to its default className. This conflicts with Radix UI's Popper positioning system:

```tsx
// Current problematic code (line 21)
className={cn(
  "z-[9999] w-72 ... fixed",  // ← 'fixed' breaks Radix positioning
  className
)}
```

Radix Popper calculates position using CSS transforms with the expectation that the element uses the default positioning context. Adding `fixed` changes the containing block to the viewport, causing the calculated transform (1029px) to push the element off-screen instead of positioning it relative to the trigger button.

## Solution

Remove the `fixed` positioning from the PopoverContent default className. Radix UI's Portal and Popper components handle positioning correctly without manual intervention.

---

## Implementation

### File: `src/components/ui/popover.tsx`

**Change**: Remove `fixed` from the className on line 21

**Before**:
```tsx
className={cn(
  "z-[9999] w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 fixed",
  className
)}
```

**After**:
```tsx
className={cn(
  "z-[9999] w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  className
)}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/ui/popover.tsx` | Remove `fixed` from PopoverContent default className |

---

## Expected Result

After this fix:
- The notification popover will appear correctly aligned to the bell icon
- The `collisionPadding={16}` and `sticky="partial"` settings will work as intended to keep the popover within the viewport
- All other popovers in the application will also benefit from correct positioning
