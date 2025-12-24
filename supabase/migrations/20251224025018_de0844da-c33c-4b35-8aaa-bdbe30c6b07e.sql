-- Create table for Stripe webhook event idempotency tracking
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  metadata JSONB,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS - only service role can access
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_event_id 
ON public.stripe_webhook_events(stripe_event_id);

-- Auto-cleanup old events (older than 30 days) to keep table small
CREATE OR REPLACE FUNCTION public.cleanup_old_webhook_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.stripe_webhook_events
  WHERE created_at < now() - interval '30 days';
END;
$$;

-- Add refund_amount and payment_notes columns to property_reservations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'property_reservations' 
    AND column_name = 'refund_amount'
  ) THEN
    ALTER TABLE public.property_reservations 
    ADD COLUMN refund_amount NUMERIC(10,2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'property_reservations' 
    AND column_name = 'payment_notes'
  ) THEN
    ALTER TABLE public.property_reservations 
    ADD COLUMN payment_notes TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'property_reservations' 
    AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE public.property_reservations 
    ADD COLUMN stripe_payment_intent_id TEXT;
  END IF;
END $$;