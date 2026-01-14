-- Create platform_roadmap_items table for tracking future improvements
CREATE TABLE public.platform_roadmap_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'feature',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'idea',
  phase TEXT,
  target_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_category CHECK (category IN ('feature', 'improvement', 'bug-fix', 'infrastructure', 'security', 'performance')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_status CHECK (status IN ('idea', 'planned', 'in-progress', 'completed', 'on-hold'))
);

-- Enable RLS
ALTER TABLE public.platform_roadmap_items ENABLE ROW LEVEL SECURITY;

-- Create policies for platform admins only (using role = 'admin')
CREATE POLICY "Platform admins can view roadmap items"
ON public.platform_roadmap_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Platform admins can create roadmap items"
ON public.platform_roadmap_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Platform admins can update roadmap items"
ON public.platform_roadmap_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Platform admins can delete roadmap items"
ON public.platform_roadmap_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_platform_roadmap_items_updated_at
BEFORE UPDATE ON public.platform_roadmap_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX idx_platform_roadmap_items_status ON public.platform_roadmap_items(status);
CREATE INDEX idx_platform_roadmap_items_priority ON public.platform_roadmap_items(priority);
CREATE INDEX idx_platform_roadmap_items_category ON public.platform_roadmap_items(category);
CREATE INDEX idx_platform_roadmap_items_phase ON public.platform_roadmap_items(phase) WHERE phase IS NOT NULL;