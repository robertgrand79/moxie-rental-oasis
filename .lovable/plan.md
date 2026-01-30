
# Plan: Fix Calendar Scroll Behavior - Keep Property Column Fixed

## Problem Summary

The calendar management view has an issue where when scrolling horizontally to view future dates, the entire calendar (including the property names column) scrolls, causing it to go behind the left admin sidebar. 

Based on the screenshots provided:
- Screenshot 1: Shows property names cut off on the left edge when dates 27-7 are visible
- Screenshot 2: Shows dates 8-16 with no property names visible at all

The user's intended behavior is:
- **Property column stays fixed** in place on the left side of the calendar
- **Only the date cells/booking rows scroll horizontally**
- Infinite scroll to load future/past dates should still work

## Root Cause

The current implementation uses a single horizontal scroll container (`overflow-x-auto`) that wraps both the property column and the date grid. While the property column has `sticky left-0`, this only makes it sticky within its scroll container - it doesn't prevent the scroll container itself from having its left edge shift relative to the page layout.

Current structure:
```
Card (overflow-x-auto scroll container)
  └── Flex container
        ├── Property Column (sticky left-0, 256px)
        └── Date Grid (flex-1)
```

## Solution

Restructure the layout so the **property column is completely outside** the horizontal scroll container, and only the date cells scroll:

New structure:
```
Outer container (flex, no overflow)
  ├── Property Column (fixed width, not scrollable horizontally)
  │     └── Vertical content (rows)
  └── Date Scroll Container (overflow-x-auto)
        └── Date Grid
              └── Rows with cells
```

This requires:
1. **Separate the property column** from the horizontal scroll container
2. **Sync vertical scrolling** between the property column and date grid (if vertical overflow exists)
3. **Move the scroll ref** to only wrap the date cells area
4. **Adjust the wheel handler** to work on the date scroll container only

---

## Implementation Details

### File: `src/components/booking/UnifiedCalendarView.tsx`

#### Change 1: Restructure the calendar grid layout

**Lines 390-469** - Replace the current Card-based scroll structure with a side-by-side layout:

**Before:**
```tsx
<Card
  ref={scrollContainerRef}
  className="relative overflow-x-auto ..."
>
  <div className="flex" style={{ minWidth: ... }}>
    {/* Property Column - Sticky */}
    <div ref={stickyColumnRef} className="sticky left-0 ...">
      ...
    </div>
    {/* Calendar Area */}
    <div className="flex-1">
      ...
    </div>
  </div>
</Card>
```

**After:**
```tsx
<div className="flex">
  {/* Property Column - Fixed, outside scroll container */}
  <div 
    ref={stickyColumnRef}
    className="w-64 flex-shrink-0 bg-background border-r shadow-[4px_0_8px_-4px_rgba(0,0,0,0.15)]"
  >
    {/* Property Header */}
    <div className="h-16 border-b flex items-center px-3 bg-muted/30">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        <Home className="h-4 w-4" />
        Property name
      </span>
    </div>
    {/* Property Rows */}
    {filteredProperties.map(property => (
      <PropertyRowLabel key={property.id} property={property} />
    ))}
  </div>

  {/* Date Grid - Scrollable horizontally */}
  <div
    ref={scrollContainerRef}
    className="flex-1 overflow-x-auto relative"
  >
    {/* Loading indicator */}
    {isLoadingMore && (
      <div className="fixed ...">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading dates...
      </div>
    )}
    
    {/* Date columns with min-width for scroll */}
    <div style={{ minWidth: `${columns.length * 64}px` }}>
      {/* Date Headers */}
      <div className="border-b bg-muted/30">
        <div className="flex">
          {columns.map((col) => (
            <div key={col.dateStr} className="w-16 flex-shrink-0 ...">
              ...
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Rows */}
      <div>
        {filteredProperties.map(property => (
          <PropertyRow key={property.id} ... />
        ))}
      </div>
    </div>
  </div>
</div>
```

#### Change 2: Update the wheel scroll handler

Remove the wheel handler from `stickyColumnRef` since it's no longer inside the scroll container. If wheel-to-horizontal-scroll is still desired when hovering over the property column, we can keep it but target the correct container.

**Lines 294-303** - Modify the wheel listener to work correctly with the new structure:

```tsx
// Attach wheel listener to the property column for horizontal scrolling of dates
useEffect(() => {
  const stickyColumn = stickyColumnRef.current;
  const scrollContainer = scrollContainerRef.current;
  if (!stickyColumn || !scrollContainer) return;

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) return;
    const hasHorizontalOverflow = scrollContainer.scrollWidth > scrollContainer.clientWidth;
    if (!hasHorizontalOverflow) return;
    
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      scrollContainer.scrollLeft += e.deltaY;
    }
  };

  stickyColumn.addEventListener('wheel', handleWheel, { passive: false });
  return () => stickyColumn.removeEventListener('wheel', handleWheel);
}, []);
```

#### Change 3: Update minWidth calculation

Since the property column is now outside the scroll container, remove its width (256px) from the minWidth calculation:

**Line 404:**
- Before: `minWidth: ${256 + columns.length * 64}px`
- After: `minWidth: ${columns.length * 64}px`

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/booking/UnifiedCalendarView.tsx` | Restructure layout to place property column outside scroll container; update wheel handler; fix minWidth calculation |

---

## Visual Outcome

After this fix:
- Property names column will **always stay visible** on the left side
- Only the date cells and booking bars will scroll horizontally
- Scrolling right will still trigger infinite loading of future dates
- Scrolling left will still load past dates
- The calendar will never visually go "behind" the admin sidebar

---

## Technical Notes

- The property rows and date rows need to have matching heights to stay visually aligned
- The current `PropertyRowLabel` and `PropertyRow` components already use consistent sizing
- No changes needed to infinite scroll logic - just the ref target changes
- The loading indicator positioning may need adjustment since it was `fixed` positioned
