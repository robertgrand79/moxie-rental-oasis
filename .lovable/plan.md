
Goal
- Ensure Calendar Management (/admin/calendar) only scrolls horizontally inside the date grid area, and the overall admin page never horizontally scrolls (which is what makes the calendar slide “behind” the fixed left menu).

What’s most likely happening (based on current code + how CSS flex works)
- Even though the property column is now outside the date scroll container, the page can still get a horizontal overflow if the date-grid flex child refuses to shrink.
- In CSS flexbox, children have `min-width: auto` by default, which can cause the flex item to expand to the width of its contents (your “minWidth: columns * 64px” grid), creating page-level horizontal scroll.
- When the page (or main content area) scrolls horizontally, the fixed admin sidebar stays in place, and the calendar appears to move behind it.

Plan of attack (small, targeted changes)
1) Make the date scroll area “shrinkable” inside the flex row
   - Update the date scroll container class from:
     - `className="flex-1 overflow-x-auto relative"`
     - to:
       - `className="flex-1 min-w-0 overflow-x-auto relative"`
   - Why: `min-w-0` is the standard fix that allows a flex child to be narrower than its content and put the overflow into its own scrollbar (instead of the page).

2) Prevent the outer calendar wrapper from contributing to page horizontal overflow
   - Add `w-full` and `overflow-x-hidden` on the immediate calendar flex wrapper (the one containing property column + date grid).
   - Example target in `UnifiedCalendarView.tsx`:
     - change `className="flex border-t"`
     - to something like `className="flex border-t w-full overflow-x-hidden"`
   - Why: This ensures any accidental oversize content doesn’t create body-level horizontal scroll.

3) Ensure the outer Card can’t expand beyond its container
   - Add `w-full` and optionally `max-w-full overflow-x-hidden` to the outer `<Card>` in `UnifiedCalendarView`.
   - Why: The Card currently has no width constraints; in some layouts it can size to content. Forcing `w-full` keeps it bounded.

4) Fix trackpad horizontal swipes when hovering the property column (important on Mac)
   - Right now, the wheel handler only converts vertical wheel (deltaY) → horizontal scroll. Many trackpads use deltaX for horizontal swipes.
   - Update the `handleWheelScroll` logic so that:
     - If `Math.abs(deltaX) > 0`, prevent default and apply it to `scrollContainer.scrollLeft += deltaX`
     - Keep the existing deltaY conversion (vertical-to-horizontal) as well.
   - Why: If deltaX isn’t handled, the browser can apply that horizontal motion to the page instead of your date grid, recreating the “slides behind sidebar” behavior.

5) Add “containment” to stop scroll chaining to the page
   - Add Tailwind `overscroll-x-contain` to the date scroll container.
   - Optionally also add `overscroll-contain` if you notice combined axis issues.
   - Why: Prevents the browser from passing the scroll gesture up to parent containers when the inner scroller hits its edges.

Files to change
- `src/components/booking/UnifiedCalendarView.tsx`
  - Add `min-w-0` to the date scroll flex child
  - Add `overflow-x-hidden`/`w-full` to the wrapper and/or Card
  - Improve wheel handler to handle deltaX as well as deltaY
  - Add `overscroll-x-contain` to the date scroll container

Verification checklist (what you should see after)
- On /admin/calendar:
  - Swiping/scrolling horizontally only moves the date columns (not the whole page).
  - The property column never shifts left/right and never disappears under the left sidebar.
  - Infinite load still triggers when you scroll near the right/left edge of the date grid.

About the uploaded .mov recording
- I can’t reliably “play” a .mov directly with the current tooling in this mode.
- If you can reproduce the issue once more in the preview, I can use the built-in session replay tool (it records UI interactions) to verify exactly which container is scrolling—page vs. date grid—which will confirm the fix.

Risks / edge cases
- If the horizontal overflow is also coming from a parent container (AdminLayout main wrapper), we may additionally add `overflow-x-hidden` at the admin content container level—but I want to try the localized fix first to avoid side effects elsewhere.

Implementation sequence (fastest path)
1) Apply `min-w-0` + `overscroll-x-contain` to the date grid scroll container
2) Add `w-full overflow-x-hidden` to the calendar wrapper / Card
3) Update wheel handler to support deltaX
4) Re-test on desktop + trackpad, and confirm infinite load still works
