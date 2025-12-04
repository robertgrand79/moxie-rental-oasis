-- Create maintenance checklist templates table
CREATE TABLE public.maintenance_checklist_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('monthly', 'quarterly', 'fall', 'spring', 'custom')),
  description TEXT,
  is_system_template BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maintenance checklist items table
CREATE TABLE public.maintenance_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.maintenance_checklist_templates(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property checklist runs table
CREATE TABLE public.property_checklist_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.maintenance_checklist_templates(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  completed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property checklist item completions table
CREATE TABLE public.property_checklist_item_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.property_checklist_runs(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.maintenance_checklist_items(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  notes TEXT,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(run_id, item_id)
);

-- Enable RLS
ALTER TABLE public.maintenance_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_checklist_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_checklist_item_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates
CREATE POLICY "Users can view system templates or their org templates"
  ON public.maintenance_checklist_templates FOR SELECT
  USING (is_system_template = true OR user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Users can manage templates in their organization"
  ON public.maintenance_checklist_templates FOR ALL
  USING (user_belongs_to_organization(auth.uid(), organization_id));

-- RLS Policies for items
CREATE POLICY "Users can view checklist items"
  ON public.maintenance_checklist_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM maintenance_checklist_templates t
    WHERE t.id = template_id AND (t.is_system_template = true OR user_belongs_to_organization(auth.uid(), t.organization_id))
  ));

CREATE POLICY "Users can manage items in their org templates"
  ON public.maintenance_checklist_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM maintenance_checklist_templates t
    WHERE t.id = template_id AND user_belongs_to_organization(auth.uid(), t.organization_id)
  ));

-- RLS Policies for runs
CREATE POLICY "Admins can manage checklist runs"
  ON public.property_checklist_runs FOR ALL
  USING (is_admin());

-- RLS Policies for completions
CREATE POLICY "Admins can manage checklist completions"
  ON public.property_checklist_item_completions FOR ALL
  USING (is_admin());

-- Create indexes
CREATE INDEX idx_checklist_items_template ON public.maintenance_checklist_items(template_id);
CREATE INDEX idx_checklist_runs_property ON public.property_checklist_runs(property_id);
CREATE INDEX idx_checklist_runs_template ON public.property_checklist_runs(template_id);
CREATE INDEX idx_checklist_completions_run ON public.property_checklist_item_completions(run_id);

-- Seed Fall Checklist Template
INSERT INTO public.maintenance_checklist_templates (name, type, description, is_system_template, created_by)
VALUES ('Fall Maintenance Checklist', 'fall', 'Comprehensive fall maintenance checklist to prepare properties for winter', true, '00000000-0000-0000-0000-000000000000');

-- Get the fall template ID and insert items
WITH fall_template AS (SELECT id FROM maintenance_checklist_templates WHERE type = 'fall' AND is_system_template = true LIMIT 1)
INSERT INTO public.maintenance_checklist_items (template_id, category, title, description, display_order)
SELECT id, category, title, description, display_order FROM fall_template, (VALUES
  ('Roof & Gutters', 'Inspect roof for loose, damaged, or missing shingles', NULL, 1),
  ('Roof & Gutters', 'Clean gutters and downspouts', 'Remove leaves/debris, check for leaks', 2),
  ('Roof & Gutters', 'Check flashing around chimneys and vents', NULL, 3),
  ('Sprinkler Systems', 'Winterize irrigation system', 'Shut off water supply to outdoor systems', 4),
  ('Sprinkler Systems', 'Blow out sprinkler lines', 'Use compressed air to remove water from lines', 5),
  ('Sprinkler Systems', 'Insulate backflow preventers', NULL, 6),
  ('Outdoor Drains & Faucets', 'Disconnect and drain outdoor hoses', NULL, 7),
  ('Outdoor Drains & Faucets', 'Shut off exterior faucets', 'Turn off interior shutoff valves', 8),
  ('Outdoor Drains & Faucets', 'Install faucet covers', NULL, 9),
  ('Exterior Sealing', 'Inspect and caulk windows and doors', 'Check for drafts and seal gaps', 10),
  ('Exterior Sealing', 'Check weatherstripping on doors', 'Replace if worn or damaged', 11),
  ('Exterior Sealing', 'Seal cracks in foundation', NULL, 12),
  ('Outdoor Furniture & Tools', 'Clean and store patio furniture', NULL, 13),
  ('Outdoor Furniture & Tools', 'Drain and store garden hoses', NULL, 14),
  ('Outdoor Furniture & Tools', 'Winterize lawn equipment', 'Drain fuel or add stabilizer', 15),
  ('Deck, Driveways & External Surfaces', 'Inspect deck for rot or damage', NULL, 16),
  ('Deck, Driveways & External Surfaces', 'Seal or stain deck if needed', NULL, 17),
  ('Deck, Driveways & External Surfaces', 'Fill cracks in driveway', NULL, 18),
  ('Landscape & Debris', 'Rake and remove fallen leaves', NULL, 19),
  ('Landscape & Debris', 'Trim trees and shrubs away from house', NULL, 20),
  ('Landscape & Debris', 'Apply fall fertilizer to lawn', NULL, 21),
  ('Landscape & Debris', 'Mulch garden beds for winter protection', NULL, 22),
  ('Safety & Final Walkaround', 'Test smoke and CO detectors', 'Replace batteries if needed', 23),
  ('Safety & Final Walkaround', 'Check fire extinguishers', 'Verify they are charged and accessible', 24),
  ('Safety & Final Walkaround', 'Inspect HVAC system', 'Replace filters, schedule furnace tune-up', 25),
  ('Safety & Final Walkaround', 'Final property walkaround', 'Document any issues found', 26)
) AS items(category, title, description, display_order);

-- Seed Spring Checklist Template
INSERT INTO public.maintenance_checklist_templates (name, type, description, is_system_template, created_by)
VALUES ('Spring Maintenance Checklist', 'spring', 'Comprehensive spring maintenance checklist to prepare properties for the warm season', true, '00000000-0000-0000-0000-000000000000');

-- Get the spring template ID and insert items
WITH spring_template AS (SELECT id FROM maintenance_checklist_templates WHERE type = 'spring' AND is_system_template = true LIMIT 1)
INSERT INTO public.maintenance_checklist_items (template_id, category, title, description, display_order)
SELECT id, category, title, description, display_order FROM spring_template, (VALUES
  ('Exterior', 'Inspect the roof', 'Look for loose, damaged, or missing shingles', 1),
  ('Exterior', 'Clean gutters and downspouts', 'Remove leaves/debris, check for leaks', 2),
  ('Exterior', 'Check siding and paint', 'Touch up peeling paint, inspect for damage', 3),
  ('Exterior', 'Inspect foundation', 'Look for cracks or water pooling', 4),
  ('Exterior', 'Power wash walkways, driveways, and patios', 'Remove dirt, moss, or mold', 5),
  ('Exterior', 'Service outdoor lighting', 'Replace bulbs and check wiring', 6),
  ('Exterior', 'Sprinkler system check', 'Test irrigation, adjust sprinkler heads, repair leaks', 7),
  ('Exterior', 'Inspect fence and deck', 'Check for rot, repaint or reseal wood as needed', 8),
  ('Yard & Landscaping', 'Clean up yard debris', 'Branches, dead plants, leaves', 9),
  ('Yard & Landscaping', 'Prune shrubs and trees', 'Especially those near the house', 10),
  ('Yard & Landscaping', 'Fertilize lawn and garden beds', 'Encourage growth', 11),
  ('Yard & Landscaping', 'Mulch garden beds', 'Helps retain moisture and reduce weeds', 12),
  ('Yard & Landscaping', 'Start pest control', 'Apply preventative treatments if needed', 13),
  ('Interior', 'HVAC system maintenance', 'Replace filters, schedule spring service tune-up', 14),
  ('Interior', 'Check windows and screens', 'Wash windows, repair torn screens, inspect seals', 15),
  ('Interior', 'Reverse ceiling fans', 'Set to counterclockwise for cooling season', 16),
  ('Interior', 'Inspect plumbing', 'Look for leaks under sinks and in crawlspaces', 17),
  ('Interior', 'Test smoke and CO detectors', 'Replace batteries if needed', 18),
  ('Interior', 'Check basement and attic for moisture', 'Address dampness before summer', 19),
  ('Interior', 'Deep clean', 'Carpets, curtains, upholstery', 20),
  ('Appliances & Utilities', 'Flush water heater', 'Remove sediment buildup', 21),
  ('Appliances & Utilities', 'Clean refrigerator coils', 'Vacuum coils and check door seals', 22),
  ('Appliances & Utilities', 'Clean dryer vent', 'Remove lint from venting system to prevent fire hazard', 23),
  ('Appliances & Utilities', 'Test sump pump', 'Ensure it is working properly', 24),
  ('Extras', 'Touch up interior paint', NULL, 25),
  ('Extras', 'Declutter and organize', 'Closets, garage, storage areas', 26),
  ('Extras', 'Inspect and restock emergency supplies', 'Flashlights, batteries, first aid kit', 27)
) AS items(category, title, description, display_order);