

## Plan: Add Live Preview to Template Switcher

**Goal**: Add a "Preview" button to each template card that opens a dialog/drawer showing the user's actual site rendered with that template, using their real data.

### How It Works

The app already supports rendering any tenant's site via `/?org=slug`. We can leverage this by adding a query parameter to force a specific template slug (e.g., `/?org=moxie-vacation-rentals&template=minimal`). The homepage (`Index.tsx`) will read this param and use it to override the active template, giving a real-time preview with the user's actual property data.

### Changes

1. **Add `template` query param support to `Index.tsx`**
   - Read `?template=` from the URL search params
   - If present, use it as the template slug instead of the database value
   - This is read-only and does not change the database

2. **Add "Preview" button to each `TemplateCard`**
   - An `Eye` icon button that opens a dialog containing the existing `SitePreviewPanel` component
   - The preview URL will be `/?org={slug}&template={templateSlug}`
   - Only shown for templates that are not currently active (active template is already what they see)

3. **Preview Dialog in `TemplateSwitcher`**
   - A `Dialog` with the `SitePreviewPanel` embedded, showing desktop/tablet/mobile toggle and the iframe preview
   - The iframe loads the user's actual site with the selected template applied via the query param override

### Result

Users click "Preview" on any template card and see their own site (with their real properties, branding, etc.) rendered in that template layout -- without changing anything. They can then confidently click "Use This Template" to commit.

