-- Create organizations table for multi-tenancy
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  -- Org-wide Stripe configuration (optional)
  stripe_secret_key TEXT,
  stripe_publishable_key TEXT,
  stripe_webhook_secret TEXT,
  stripe_account_id TEXT,
  -- Billing/subscription info
  subscription_status TEXT DEFAULT 'trial',
  subscription_tier TEXT DEFAULT 'basic',
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days')
);

-- Create organization members junction table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Add organization_id to existing tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.lifestyle_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.contractors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add Stripe fields to properties for per-property Stripe accounts
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS stripe_secret_key TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS stripe_publishable_key TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS stripe_webhook_secret TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Add stripe_account_id to reservations to track which Stripe account processed payment
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_properties_organization_id ON public.properties(organization_id);

-- Security definer function to check if user belongs to organization
CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
    AND organization_id = _org_id
  );
$$;

-- Security definer function to check if user is org admin
CREATE OR REPLACE FUNCTION public.user_is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
    AND organization_id = _org_id
    AND role IN ('admin', 'owner')
  );
$$;

-- Security definer function to get user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations table
CREATE POLICY "Users can view their own organization"
  ON public.organizations
  FOR SELECT
  USING (public.user_belongs_to_organization(auth.uid(), id));

CREATE POLICY "Org admins can update their organization"
  ON public.organizations
  FOR UPDATE
  USING (public.user_is_org_admin(auth.uid(), id));

-- RLS Policies for organization_members table
CREATE POLICY "Users can view members of their organization"
  ON public.organization_members
  FOR SELECT
  USING (public.user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Org admins can manage members"
  ON public.organization_members
  FOR ALL
  USING (public.user_is_org_admin(auth.uid(), organization_id));

-- Update RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view profiles in their organization"
  ON public.profiles
  FOR SELECT
  USING (
    public.user_belongs_to_organization(auth.uid(), organization_id)
    OR is_admin()
  );

-- Update RLS policies for properties table  
DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;

CREATE POLICY "Users can view properties in their organization"
  ON public.properties
  FOR SELECT
  USING (
    public.user_belongs_to_organization(auth.uid(), organization_id)
    OR organization_id IS NULL
  );

CREATE POLICY "Org admins can manage properties"
  ON public.properties
  FOR ALL
  USING (public.user_is_org_admin(auth.uid(), organization_id));

-- Update RLS policies for blog_posts
DROP POLICY IF EXISTS "Allow authenticated users to view all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated users to insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated users to update their own blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can create blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can delete their own blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can update their own blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can view their own blog posts" ON public.blog_posts;

CREATE POLICY "Users can view blog posts in their organization"
  ON public.blog_posts
  FOR SELECT
  USING (
    public.user_belongs_to_organization(auth.uid(), organization_id)
    OR status = 'published'
  );

CREATE POLICY "Users can manage blog posts in their organization"
  ON public.blog_posts
  FOR ALL
  USING (public.user_belongs_to_organization(auth.uid(), organization_id));

-- Update RLS policies for lifestyle_gallery
DROP POLICY IF EXISTS "Admins can manage gallery items" ON public.lifestyle_gallery;
DROP POLICY IF EXISTS "Anyone can view active gallery items" ON public.lifestyle_gallery;

CREATE POLICY "Users can view lifestyle items in their organization"
  ON public.lifestyle_gallery
  FOR SELECT
  USING (
    public.user_belongs_to_organization(auth.uid(), organization_id)
    OR (is_active = true AND status = 'published')
  );

CREATE POLICY "Users can manage lifestyle items in their organization"
  ON public.lifestyle_gallery
  FOR ALL
  USING (public.user_belongs_to_organization(auth.uid(), organization_id));

-- Update RLS policies for work_orders
DROP POLICY IF EXISTS "Admins and work order owners can view work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Users can create work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Users can delete their own work orders or admins can delete all" ON public.work_orders;
DROP POLICY IF EXISTS "Users can update their own work orders or admins can update all" ON public.work_orders;

CREATE POLICY "Users can view work orders in their organization"
  ON public.work_orders
  FOR SELECT
  USING (public.user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Users can manage work orders in their organization"
  ON public.work_orders
  FOR ALL
  USING (public.user_belongs_to_organization(auth.uid(), organization_id));

-- Update RLS policies for contractors
DROP POLICY IF EXISTS "Admins and contractor owners can view contractors" ON public.contractors;
DROP POLICY IF EXISTS "Users can create contractors" ON public.contractors;
DROP POLICY IF EXISTS "Users can delete their own contractors or admins can delete all" ON public.contractors;
DROP POLICY IF EXISTS "Users can update their own contractors or admins can update all" ON public.contractors;

CREATE POLICY "Users can view contractors in their organization"
  ON public.contractors
  FOR SELECT
  USING (public.user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Users can manage contractors in their organization"
  ON public.contractors
  FOR ALL
  USING (public.user_belongs_to_organization(auth.uid(), organization_id));

-- Update RLS policies for site_settings
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;

CREATE POLICY "Users can view settings for their organization"
  ON public.site_settings
  FOR SELECT
  USING (public.user_belongs_to_organization(auth.uid(), organization_id) OR organization_id IS NULL);

CREATE POLICY "Org admins can manage settings"
  ON public.site_settings
  FOR ALL
  USING (public.user_is_org_admin(auth.uid(), organization_id));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_organizations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_organizations_updated_at();