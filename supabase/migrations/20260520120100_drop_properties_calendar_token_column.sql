-- Remove the calendar export token from `properties`.
--
-- Tokens now live in `property_calendar_tokens` (see 20260520120000) and the
-- calendar-export edge function reads from there. Dropping the column closes
-- the public-read leak permanently. The dependent index is dropped with it.

DROP INDEX IF EXISTS public.idx_properties_calendar_export_token;

ALTER TABLE public.properties DROP COLUMN IF EXISTS calendar_export_token;
