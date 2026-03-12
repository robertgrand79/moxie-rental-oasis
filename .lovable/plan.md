

## Fix: "QUICK ACCESS" Text Cut Off

**Problem**: The hero header container (line 163) has `overflow-hidden` which, combined with the negative margin (`-mt-2` on line 210), is causing the "QUICK ACCESS" label to appear visually clipped.

**Fix** (in `src/components/guest/GuestPortalDashboard.tsx`):
- Change `overflow-hidden` on line 163 to `overflow-visible` or scope the overflow clip only to the gradient backgrounds using `overflow-hidden` on the gradient divs themselves instead of the parent.
- Alternatively, simply remove `overflow-hidden` from the hero wrapper `div` on line 163, since the gradient backgrounds already use `absolute inset-0` and won't overflow meaningfully.

This is a one-line CSS class fix.

