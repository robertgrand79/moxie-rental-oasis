

## Diagnosis

The calendar export edge function works correctly — it returns valid iCal data with a 200 status. The problem is that **all calendar export URLs are hardcoded to `joiovubyokikqjytxtuv.supabase.co`** instead of using your custom Supabase domain `api.staymoxie.com`.

Hospitable likely rejects the raw Supabase project URL. Some platforms have domain allow-lists or follow redirects differently when custom domains are involved.

## Plan

**1. Create a shared constant for the API base URL**

Add to `src/config/platform.ts`:
```typescript
API_BASE_URL: 'https://api.staymoxie.com'
```

**2. Update CalendarSyncManager.tsx** (lines 398, 400, 413-414)

Replace all instances of `https://joiovubyokikqjytxtuv.supabase.co/functions/v1` with the new constant so the exported/copied URLs use `https://api.staymoxie.com/functions/v1/calendar-export?feed=...`.

**3. Update BookingTimelinePage.tsx** (lines 264, 544, 555)

Same replacement — use the platform constant for all calendar export URLs displayed and copied.

### Files Changed
- `src/config/platform.ts` — add `API_BASE_URL`
- `src/components/admin/properties/CalendarSyncManager.tsx` — use new constant
- `src/pages/admin/BookingTimelinePage.tsx` — use new constant

