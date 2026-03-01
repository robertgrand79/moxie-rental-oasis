

# Rework Single Property Template

## Overview
Modernize the single property homepage with a full featured photo gallery (all 10 featured photos), a conditional YouTube video section, and conditional TikTok/Instagram social feed sections. All media sections render only when data is present.

## Current State
- `SinglePropertyHome.tsx` shows a hero, a bento grid (only 5 photos), description, amenities, reviews, nearby, events, and newsletter
- `PhotoSpotlight.tsx` displays max 5 photos in a bento layout with a modal for the rest
- Settings store `socialMedia.instagram`, `socialMedia.facebook`, `socialMedia.twitter` as URLs
- No YouTube video URL, TikTok URL, or social feed embed fields exist in settings or property data

## Plan

### 1. Add new settings fields for video and social feeds
- Add to `SettingsState` (types.ts) and `defaultSettings` (constants.ts):
  - `youtubeVideoUrl: string` -- a YouTube video link (e.g. property tour)
  - `tiktokProfileUrl: string` -- TikTok profile URL for embed
  - `instagramFeedUrl: string` -- Instagram profile URL for embed
- Add key mappings in `utils.ts` so they persist via the existing site_settings system
- Add admin UI fields in the branding/settings panel so users can input these URLs

### 2. Rework PhotoSpotlight to show all 10 featured photos
- Replace the 5-photo bento grid with a full gallery grid layout
- Desktop: show all photos (up to 10) in a visually interesting masonry/grid pattern (e.g., 3-column grid with the first image spanning 2 columns)
- Mobile: 2-column scrollable grid showing all photos
- Keep the modal for full-screen browsing

### 3. Create YouTube Video Section component
- New `SinglePropertyVideoSection.tsx`
- Accept a YouTube URL, extract the video ID, render a responsive 16:9 iframe embed
- Only renders when `youtubeVideoUrl` is non-empty
- Clean section header: "Take a Tour" or similar

### 4. Create Social Feed Sections
- New `SinglePropertySocialSection.tsx`
- **Instagram**: If `instagramFeedUrl` is set, render an embedded Instagram feed using an `<iframe>` embed or a curated link-out card section with the Instagram branding
- **TikTok**: If `tiktokProfileUrl` is set, render a TikTok embed section similarly
- Both sections only render when their respective URL is provided
- Use clean card layouts with social platform icons and CTAs to view more

### 5. Rework SinglePropertyHome layout
- Modernize the section ordering and spacing:
  1. Hero (existing, keep as-is)
  2. Sticky booking bar (existing)
  3. **Full Photo Gallery** (reworked PhotoSpotlight showing all 10)
  4. **YouTube Video Section** (conditional)
  5. Property description + amenities
  6. **Instagram & TikTok Section** (conditional)
  7. Reviews
  8. What's Nearby + Local Events
  9. Newsletter
  10. Mobile sticky booking bar
- Add smooth section transitions and modern spacing

### 6. Admin settings UI for new fields
- Add YouTube, TikTok, and Instagram feed URL inputs to the appropriate settings tab (likely the branding or social media section in admin settings)

## Technical Details
- YouTube embed: extract video ID from various YouTube URL formats, render via `https://www.youtube.com/embed/{id}`
- Instagram/TikTok: use simple link-out card sections with platform branding rather than complex API integrations (which require API keys). This keeps it lightweight and always functional
- All new sections are wrapped in conditional rendering (`if (!url) return null`)
- Settings persist through the existing `site_settings` key-value store in Supabase

