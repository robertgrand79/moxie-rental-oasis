-- Add organization_id column to pages table
ALTER TABLE public.pages ADD COLUMN organization_id uuid REFERENCES public.organizations(id);

-- Update ALL pages to the default organization (handles NULL created_by cases)
UPDATE public.pages 
SET organization_id = 'a0000000-0000-0000-0000-000000000001'
WHERE organization_id IS NULL;

-- Make organization_id NOT NULL after data migration
ALTER TABLE public.pages ALTER COLUMN organization_id SET NOT NULL;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can create their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can update their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can delete their own pages" ON public.pages;

-- Create organization-scoped RLS policies
CREATE POLICY "Users can view pages in their organization"
ON public.pages FOR SELECT
USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Users can create pages in their organization"
ON public.pages FOR INSERT
WITH CHECK (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Users can update pages in their organization"
ON public.pages FOR UPDATE
USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Users can delete pages in their organization"
ON public.pages FOR DELETE
USING (user_belongs_to_organization(auth.uid(), organization_id));