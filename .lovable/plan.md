

# Plan: Fix Duplicate Labels and Favicon Issue

## Issues Identified

### Issue 1: Duplicate "Featured Image" Labels

The screenshot shows two "Featured Image" labels stacked on top of each other. This happens because:

- The `ImageUploader` component has a hardcoded `<Label>Featured Image</Label>` inside it
- Parent components like `ImageSection` (for blog posts) and `OwnerTravelsSettings` (for owner travels) add their own labels before rendering `ImageUploader`

This creates duplicate labels and also means when `ImageUploader` is used for "Travel Photo" in Owner Travels settings, it still shows "Featured Image" which is incorrect.

### Issue 2: Favicon on Published Site Shows Lovable Default

The database confirms your custom favicon IS saved correctly, but on the published site visitors may briefly see the Lovable default favicon. This happens because:

- The `index.html` has a hardcoded fallback `/favicon.ico` (Lovable's default)
- The React app loads and the `useTenantMetaTags` hook then updates the favicon dynamically
- On initial page load (before React hydrates), visitors see the default favicon

---

## Solution

### Fix 1: Remove Hardcoded Label from ImageUploader

**File: `src/components/ImageUploader.tsx`**

Remove the `<Label>Featured Image</Label>` from inside the component. This makes the component generic and reusable - parent components can provide their own appropriate labels.

| Before | After |
|--------|-------|
| Line 100: `<Label>Featured Image</Label>` | Remove this line |

This fixes both the duplicate label issue and allows proper labeling like "Travel Photo" in the Owner Travels settings.

### Fix 2: Add Fallback Favicon for Moxie

For the published moxievacationrentals.com site, update `index.html` to reference a proper fallback that works for Moxie tenants.

**Approach**: The `useTenantMetaTags` hook is already correctly fetching and applying the tenant's favicon. The issue is the brief flash of the wrong favicon on initial load.

**Options**:
1. Keep the current setup (React updates it quickly, usually not noticeable)
2. Add a transparent/generic placeholder favicon
3. Use server-side rendering or meta tag injection (not available in current stack)

Since the tenant-specific favicon loads correctly once React hydrates, this is mainly a cosmetic issue affecting the initial ~100-500ms of page load. The current implementation is already correct.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/ImageUploader.tsx` | Remove the hardcoded "Featured Image" label (line 100) |

---

## Result

After this fix:
- Blog post editor will show only ONE "Featured Image" label
- Owner Travels settings will correctly show "Travel Photo" label
- The `ImageUploader` component becomes properly reusable with any label

