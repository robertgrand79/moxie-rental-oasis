
-- Create a table to store acknowledgement tokens
CREATE TABLE public.work_order_acknowledgement_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster token lookups
CREATE INDEX idx_work_order_acknowledgement_tokens_token ON work_order_acknowledgement_tokens(token);
CREATE INDEX idx_work_order_acknowledgement_tokens_work_order_id ON work_order_acknowledgement_tokens(work_order_id);

-- Enable RLS
ALTER TABLE public.work_order_acknowledgement_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (needed for acknowledgement without auth)
CREATE POLICY "Allow public access to acknowledgement tokens" 
  ON public.work_order_acknowledgement_tokens 
  FOR ALL 
  USING (true);
