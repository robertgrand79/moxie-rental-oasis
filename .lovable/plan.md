

# Plan: Add Owner Travels Section to Blog

## Overview

Add a dedicated "Owner Travels" section to the blog where STR property owners can showcase their own travel experiences, stories, and recommendations. This creates a personal connection with guests by showing the hosts are travelers themselves who understand the guest experience.

## Current State Analysis

Based on exploring the codebase:

- **Blog filtering**: Uses tags array for category filtering (e.g., `travel`, `local`, `destinations`)
- **Categories**: Hardcoded in `BlogCategoryFilter.tsx` with icons
- **Content types**: `article`, `event`, `poi`, `lifestyle` 
- **Owner data**: `founderNames` setting exists (currently "Robert & Shelly")
- **Site settings**: Follows the pattern of storing customizable content with preserved defaults

## Implementation Approach

### 1. Add "Owner Travels" as a Blog Category

**File: `src/components/blog/BlogCategoryFilter.tsx`**

Add a new category entry with a personalized icon (e.g., `Plane` or `Heart`):

```text
Categories will become:
- All Posts (BookOpen)
- Local Guides (MapPin)  
- Travel Tips (Compass)
- Destinations (MapPin)
- Owner Travels (Plane) ← NEW
```

**File: `src/pages/Blog.tsx`**

Update the categories array to match.

### 2. Add Owner Travels Section Component

**New file: `src/components/blog/OwnerTravelsSection.tsx`**

A dedicated highlighted section that appears when the "Owner Travels" category is selected or on the main blog page, featuring:

- Owner photo(s) with names pulled from `founderNames` setting
- A brief intro explaining who the owners are
- Grid of their travel posts filtered by the `owner-travels` tag

### 3. Add Site Settings for Customization

Following the established pattern in `useTenantSettings.ts`, add new settings:

```text
ownerTravelsTitle: e.g., "Robert & Shelly's Travels"
ownerTravelsDescription: e.g., "Join us as we explore our favorite destinations..."
ownerTravelsImageUrl: Photo of the owners traveling
ownerTravelsEnabled: boolean to show/hide the section
```

### 4. Update BlogSidebar with Owner Travels Link

**File: `src/components/blog/BlogSidebar.tsx`**

Add a highlighted card or link to the Owner Travels section when posts exist with that tag.

### 5. Add Admin UI for Owner Travels Settings

**File: `src/components/admin/settings/BlogSettingsTab.tsx`** (or similar)

Add fields to customize:
- Section title (default: `{founderNames}'s Travels`)
- Section description
- Owner photo upload
- Enable/disable toggle

---

## Technical Details

### Database Changes

No schema changes needed. Uses existing:
- `blog_posts.tags` array (add `owner-travels` tag to posts)
- `blog_posts.category` field (set to `owner-travels`)
- `site_settings` table for customization

### Tag Convention

Posts for this section should have:
- Tag: `owner-travels`
- Category: `owner-travels`

### Filter Logic Update

**File: `src/services/blog/blogQueryBuilder.ts`**

The existing query builder already supports category filtering via tags - no changes needed.

### UI Components Structure

```text
Blog.tsx
├── BlogHero
├── BlogCategoryFilter (+ owner-travels category)
├── BlogSearchBar
├── Main Content
│   ├── OwnerTravelsSection (NEW - shown when category selected)
│   └── BlogPostsGrid
└── BlogSidebar (+ owner travels card)
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/blog/OwnerTravelsSection.tsx` | Featured section with owner intro + their travel posts |
| `src/components/blog/OwnerTravelsCard.tsx` | Sidebar card linking to owner travels |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/blog/BlogCategoryFilter.tsx` | Add owner-travels category with Plane icon |
| `src/pages/Blog.tsx` | Add owner-travels to categories array, render OwnerTravelsSection |
| `src/components/blog/BlogSidebar.tsx` | Add OwnerTravelsCard component |
| `src/hooks/useTenantSettings.ts` | Add owner travels settings types |
| `src/types/blogPost.ts` | Add owner-travels to CONTENT_TYPE_CATEGORIES.article array |

---

## User Experience

1. **Blog page**: New "Owner Travels" category tab appears alongside existing categories
2. **When selected**: Shows a personalized hero with owner photos and intro, followed by their travel posts
3. **Sidebar**: "Follow Our Adventures" card with link to owner travels section
4. **Admin**: Owners can customize the section title, description, and photo in settings
5. **Creating posts**: Authors tag posts with `owner-travels` to include them in the section

---

## Default Values

Following the established pattern, these defaults will be used:

- **Title**: `{founderNames}'s Travels` (e.g., "Robert & Shelly's Travels")
- **Description**: "Travel is at the heart of what we do. Follow along as we explore destinations, discover hidden gems, and share the experiences that inspire our hospitality."
- **Enabled**: `true` (visible by default when posts exist)

