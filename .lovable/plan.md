

## Problem

The "Back to Site" button sits in the top-left header bar, right next to where the sidebar collapse/expand toggle is. When the sidebar is collapsed, users instinctively click that area expecting to expand the sidebar, but instead navigate away from admin entirely.

Modern SaaS apps (Linear, Notion, Vercel) solve this by:
1. Keeping navigation actions (expand sidebar) physically separated from "leave this context" links
2. Placing the "view live site" link in the **user profile dropdown** or as a subtle icon in the **top-right header area** — not as a prominent button in the primary action zone

## Plan

### 1. Move "Back to Site" out of the header left side

Remove the `EnhancedButton` with "Back to Site" from the left side of the `AdminLayout.tsx` header. Replace it with a **breadcrumb or page title** area (currently empty after removing the button).

### 2. Add "View Site" to two discoverable locations

**A. User profile dropdown (sidebar footer)**
Add a "View Live Site" menu item with an `ExternalLink` icon to the `DropdownMenu` in `AdminSidebarFooter.tsx` — both collapsed and expanded states. This opens the front-end in a new tab (`window.open`).

**B. Top-right header area**
Add a small icon-only button (using `ExternalLink` or `Globe` icon) with a tooltip "View Site" next to the `NotificationBell` in the header. This keeps it accessible but not in the way of sidebar interactions.

### Files to modify

- `src/components/admin/AdminLayout.tsx` — Remove the "Back to Site" button from the left header area; add a small "View Site" icon button to the right header area next to NotificationBell
- `src/components/admin/sidebar/AdminSidebarFooter.tsx` — Add "View Live Site" item to both collapsed and expanded dropdown menus

