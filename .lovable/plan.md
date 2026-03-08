

## PWA Conversion Plan for Stay Moxie

### Current State
- `manifest.json` exists but uses wrong colors and only has one icon size
- `sw.js` is a self-destruct worker (clears caches, unregisters itself) -- not useful for offline
- `sw-push.js` handles push notifications only -- no caching
- No install prompt logic exists anywhere
- No Apple PWA meta tags in `index.html`

### What We'll Build

**1. Update manifest.json**
- Theme color: `#0f172a`, background: `#f8fafc`, display: `standalone`
- Add multiple icon sizes (192x192, 512x512) with maskable variants
- Keep using `moxie-logo.png` as the source icon

**2. Replace sw.js with a real caching service worker**
- Cache the app shell (index.html, JS/CSS bundles, fonts) using a cache-first strategy
- Use network-first for API calls (Supabase) so data stays fresh
- Exclude `/~oauth` from caching (critical for auth redirects)
- Keep `sw-push.js` separate and untouched for push notifications

**3. Add Apple PWA meta tags to index.html**
- `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`
- Apple touch icon link
- Update `theme-color` meta tag to `#0f172a`

**4. Register the new service worker in main.tsx**
- Replace the "unregister everything" logic with proper SW registration
- Still preserve `sw-push.js` registration (handled separately in `usePushNotifications`)

**5. Create `usePWAInstall` hook** (`src/hooks/usePWAInstall.ts`)
- Listen for `beforeinstallprompt` event (Chrome/Android)
- Detect iOS Safari standalone mode
- Expose `canInstall`, `isIOS`, `isStandalone`, `promptInstall()`

**6. Create iOS Install Prompt component** (`src/components/pwa/IOSInstallPrompt.tsx`)
- Fixed bottom banner shown only on iOS Safari when not in standalone mode
- Shows share icon + "Add to Home Screen" instructions
- Dismissible with X button, remembers dismissal in localStorage

**7. Add "Install App" button to admin sidebar footer dropdown**
- In `AdminSidebarFooter.tsx`, add a `DropdownMenuItem` with download icon
- Only visible when `canInstall` is true (Chrome/Android)
- Clicking triggers the native browser install prompt

**8. Mount IOSInstallPrompt in App.tsx**
- Renders globally so it appears on any page for iOS Safari users

### Files Changed
- `public/manifest.json` -- updated colors and icons
- `public/sw.js` -- rewritten as a proper caching service worker
- `index.html` -- Apple meta tags, updated theme color
- `src/main.tsx` -- register caching SW instead of unregistering
- `src/hooks/usePWAInstall.ts` -- new hook
- `src/components/pwa/IOSInstallPrompt.tsx` -- new component
- `src/components/admin/sidebar/AdminSidebarFooter.tsx` -- add Install App menu item
- `src/App.tsx` -- mount IOSInstallPrompt

