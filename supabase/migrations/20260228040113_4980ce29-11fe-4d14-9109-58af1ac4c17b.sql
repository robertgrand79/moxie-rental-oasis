
-- 1. Add new team_role values only
ALTER TYPE public.team_role ADD VALUE IF NOT EXISTS 'maintenance';
ALTER TYPE public.team_role ADD VALUE IF NOT EXISTS 'cleaner';
