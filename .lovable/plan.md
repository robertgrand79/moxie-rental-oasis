

# Plan: Add Owner Travels Settings Section to Blog Management

## Overview

Add a collapsible settings section at the top of the Blog Management page (`/admin/blog`) that allows property owners to customize how the "Owner Travels" section appears on their blog. This keeps blog-related settings together in one place.

## What You'll Be Able to Customize

| Setting | Description | Default Value |
|---------|-------------|---------------|
| Custom Title | Override the section title | Uses your name from About settings (e.g., "Robert & Shelly's Travels") |
| Description | Personal message to introduce your travel content | Default welcome message |
| Photo | Upload a photo of you traveling | Uses first letter avatar if not set |
| Enable/Disable | Show or hide the Owner Travels section | Enabled by default |

## User Experience

1. Go to Blog Management (`/admin/blog`)
2. See a new "Owner Travels Settings" collapsible section at the top
3. Click to expand and customize:
   - Upload a travel photo
   - Write a custom title (or leave blank to use your name automatically)
   - Write a personal description
   - Toggle the section on/off
4. Click "Save Settings" to apply changes
5. Changes appear immediately on the public blog page

---

## Technical Details

### New Component

**File: `src/components/admin/blog/OwnerTravelsSettings.tsx`**

A collapsible card component with:
- Image upload field (using existing ImageUpload component pattern)
- Text input for custom title with placeholder showing the dynamic default
- Textarea for custom description
- Switch toggle to enable/disable the section
- Save button that calls `saveSetting()` for each field

### Integration Point

**File: `src/components/admin/blog/BlogsManager.tsx`**

Add the new `OwnerTravelsSettings` component above the header, wrapped in a `Collapsible` component so it doesn't take up space when collapsed.

### Settings Used

Uses existing settings already defined in `useTenantSettings.ts`:
- `ownerTravelsTitle` - Custom title override
- `ownerTravelsDescription` - Custom description
- `ownerTravelsImageUrl` - Photo URL
- `ownerTravelsEnabled` - Boolean toggle (stored as string "true"/"false")

No database changes required - these settings are already defined and will be stored in the existing `site_settings` table.

### File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/admin/blog/OwnerTravelsSettings.tsx` | Create | New settings form component |
| `src/components/admin/blog/BlogsManager.tsx` | Modify | Import and render OwnerTravelsSettings at top |

