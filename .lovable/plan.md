

## Problem

The calendar export edge function currently exports **all** availability blocks (including synced OTA bookings from Airbnb, VRBO, etc.). When other platforms import this feed, they see their own bookings reflected back, causing duplicate/error issues.

## Solution

Add a `source_platform` filter to the query in `supabase/functions/calendar-export/index.ts` so it only exports:
- **Direct bookings** (`source_platform` is `null`, `'direct'`, or `'staymoxie'`)
- **Blocked** periods
- **Maintenance** blocks

This is a single-line change to the existing query (line ~73-77):

```typescript
const { data: blocks, error: blocksError } = await supabase
  .from('availability_blocks')
  .select('*')
  .eq('property_id', propertyId)
  .in('block_type', ['booked', 'blocked', 'maintenance'])
  .neq('sync_status', 'cancelled')
  .or('source_platform.is.null,source_platform.eq.direct,source_platform.eq.staymoxie,block_type.neq.booked')
```

The `.or()` filter ensures:
- All `blocked` and `maintenance` blocks are always included (regardless of source)
- `booked` blocks are only included if `source_platform` is null, `'direct'`, or `'staymoxie'` — excluding Airbnb, VRBO, Hospitable synced bookings

After updating, redeploy the edge function.

