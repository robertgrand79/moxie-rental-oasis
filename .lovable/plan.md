

## Analysis: Admin Sidebar Comparison

### Hospitable's Approach
- **~10 top-level items** with clean icons, large spacing
- **Expandable sub-menus** (Guest Experience → Messaging, Guest Portal, Reviews) with chevron indicators
- **No section header labels** — grouping is implicit via collapsible parent items
- Minimal, uncluttered feel

### Our Current Sidebar
- **9 named sections** with uppercase labels (Overview, Property & Booking, Content Management, etc.)
- **~25 flat menu items** all visible at once — very long scroll
- No collapsible grouping — everything is exposed
- Section headers add visual noise without aiding navigation

---

## Proposed Restructure

Reorganize into ~10 top-level items, some with collapsible sub-menus, matching Hospitable's pattern:

```text
Dashboard
Notifications
Properties
Calendar                    (combines Calendar Management)
Bookings                    (Booking Management)
Guest Experience  ›         (sub: Inbox, Messaging/Guest Experience, Reviews)
Content           ›         (sub: Blog, Custom Pages, Newsletter, AI Assistant)
Local             ›         (sub: Events, Places)
Operations        ›         (sub: Work Orders, Contractors, Checklists)
Analytics         ›         (sub: Property Analytics, Reports)
Settings
Help & Support    ›         (sub: Help Center, My Requests, System Status)
Team Management             (single item, shown if permitted)
Platform Admin              (single item, shown if platform admin)
```

### Technical Changes

1. **`adminMenuItems.ts`** — Restructure from flat sections to a new shape supporting `children` on items:
   ```typescript
   export interface MenuItem {
     title: string;
     href?: string;          // optional if parent-only
     icon: LucideIcon;
     description: string;
     requiredPermission?: PermissionKey;
     children?: MenuItem[];  // collapsible sub-items
   }
   ```
   Remove the `MenuSection` wrapper — items become a flat array of top-level `MenuItem`s.

2. **`AdminSidebarSection.tsx`** — Replace with a new component that renders:
   - Simple `SidebarMenuItem` for items without children
   - `Collapsible` wrapper (from Radix) for items with children, showing a chevron toggle and indented sub-items with a left border accent (like Hospitable)

3. **`AdminSidebar.tsx`** — Update to iterate over the flat item list instead of sections. Remove `SidebarGroupLabel` section headers entirely.

4. **Styling** — Add left border indicator on expanded groups, increase item spacing slightly, ensure collapsed icon-only mode still works with tooltips for parent items.

No route changes, no permission logic changes — just reorganizing how items are displayed.

