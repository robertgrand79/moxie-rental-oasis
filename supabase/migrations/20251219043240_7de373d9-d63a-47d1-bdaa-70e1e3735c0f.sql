-- Add acknowledged_at column to work_orders table if it doesn't exist
ALTER TABLE public.work_orders 
ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP WITH TIME ZONE;

-- Create table for tracking work order acknowledgment tokens
CREATE TABLE IF NOT EXISTS public.work_order_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  work_order_ids UUID[] NOT NULL,
  contractor_id UUID REFERENCES public.contractors(id),
  organization_id UUID REFERENCES public.organizations(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.work_order_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Policy for org members to view acknowledgments
CREATE POLICY "Organization members can view acknowledgments"
ON public.work_order_acknowledgments
FOR SELECT
USING (user_belongs_to_organization(auth.uid(), organization_id));

-- Policy for system to insert acknowledgments
CREATE POLICY "System can insert acknowledgments"
ON public.work_order_acknowledgments
FOR INSERT
WITH CHECK (true);

-- Policy for system to update acknowledgments (for marking as acknowledged)
CREATE POLICY "System can update acknowledgments"
ON public.work_order_acknowledgments
FOR UPDATE
USING (true);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_work_order_acknowledgments_token 
ON public.work_order_acknowledgments(token);