-- Create turno_problems table for dedicated problem management
CREATE TABLE public.turno_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  turno_problem_id TEXT NOT NULL UNIQUE,
  turno_property_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT,
  room_location TEXT,
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  property_address TEXT,
  turno_created_at TIMESTAMP WITH TIME ZONE,
  turno_updated_at TIMESTAMP WITH TIME ZONE,
  linked_work_order_id UUID,
  sync_status TEXT NOT NULL DEFAULT 'synced',
  last_sync_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.turno_problems ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view turno problems" 
ON public.turno_problems 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert turno problems" 
ON public.turno_problems 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update turno problems" 
ON public.turno_problems 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete turno problems" 
ON public.turno_problems 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_turno_problems_turno_id ON public.turno_problems(turno_problem_id);
CREATE INDEX idx_turno_problems_property_id ON public.turno_problems(turno_property_id);
CREATE INDEX idx_turno_problems_status ON public.turno_problems(status);
CREATE INDEX idx_turno_problems_sync_status ON public.turno_problems(sync_status);
CREATE INDEX idx_turno_problems_linked_work_order ON public.turno_problems(linked_work_order_id);

-- Add foreign key to work orders if linked
ALTER TABLE public.turno_problems 
ADD CONSTRAINT fk_turno_problems_work_order 
FOREIGN KEY (linked_work_order_id) REFERENCES public.work_orders(id) ON DELETE SET NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_turno_problems_updated_at
BEFORE UPDATE ON public.turno_problems
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();