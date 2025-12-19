-- Create place_categories table
CREATE TABLE public.place_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT DEFAULT 'MapPin',
  color TEXT DEFAULT '#6366f1',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint for slug per organization
CREATE UNIQUE INDEX place_categories_slug_org_idx ON public.place_categories(slug, organization_id);

-- Enable RLS
ALTER TABLE public.place_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view categories in their organization"
  ON public.place_categories FOR SELECT
  USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Users can manage categories in their organization"
  ON public.place_categories FOR ALL
  USING (user_belongs_to_organization(auth.uid(), organization_id));

-- Trigger for updated_at
CREATE TRIGGER update_place_categories_updated_at
  BEFORE UPDATE ON public.place_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default categories for existing organizations
INSERT INTO public.place_categories (name, slug, icon, color, display_order, organization_id)
SELECT 
  category.name,
  category.slug,
  category.icon,
  category.color,
  category.display_order,
  o.id as organization_id
FROM public.organizations o
CROSS JOIN (VALUES
  ('Dining', 'dining', 'Utensils', '#ef4444', 1),
  ('Outdoor', 'outdoor', 'Mountain', '#22c55e', 2),
  ('Entertainment', 'entertainment', 'Music', '#a855f7', 3),
  ('Shopping', 'shopping', 'ShoppingBag', '#f59e0b', 4),
  ('Accommodation', 'accommodation', 'Bed', '#3b82f6', 5),
  ('Lifestyle', 'lifestyle', 'Heart', '#ec4899', 6),
  ('Culture', 'culture', 'Landmark', '#8b5cf6', 7),
  ('Nature', 'nature', 'Trees', '#10b981', 8),
  ('Recreation', 'recreation', 'Bike', '#06b6d4', 9),
  ('Restaurant', 'restaurant', 'UtensilsCrossed', '#f97316', 10),
  ('Other', 'other', 'MapPin', '#6b7280', 99)
) AS category(name, slug, icon, color, display_order)
WHERE o.is_active = true;