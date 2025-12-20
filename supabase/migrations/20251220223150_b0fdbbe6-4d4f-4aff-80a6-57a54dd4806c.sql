-- Add billing fields to contractors table
ALTER TABLE public.contractors
ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS default_billing_type text DEFAULT 'hourly' CHECK (default_billing_type IN ('hourly', 'fixed'));

-- Add billing fields to work_orders table
ALTER TABLE public.work_orders
ADD COLUMN IF NOT EXISTS billing_type text DEFAULT 'hourly' CHECK (billing_type IN ('hourly', 'fixed')),
ADD COLUMN IF NOT EXISTS billing_rate numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS hours_worked numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS billing_amount numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'paid')),
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_notes text DEFAULT NULL;

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_work_orders_payment_status ON public.work_orders(payment_status);

-- Create index for contractor billing queries
CREATE INDEX IF NOT EXISTS idx_work_orders_contractor_payment ON public.work_orders(contractor_id, payment_status);

COMMENT ON COLUMN public.contractors.hourly_rate IS 'Default hourly rate for this contractor';
COMMENT ON COLUMN public.contractors.default_billing_type IS 'Default billing method: hourly or fixed';
COMMENT ON COLUMN public.work_orders.billing_type IS 'Billing method for this work order: hourly or fixed';
COMMENT ON COLUMN public.work_orders.billing_rate IS 'Hourly rate or fixed price for this work order';
COMMENT ON COLUMN public.work_orders.hours_worked IS 'Hours worked (for hourly billing)';
COMMENT ON COLUMN public.work_orders.billing_amount IS 'Total amount due (calculated or fixed)';
COMMENT ON COLUMN public.work_orders.payment_status IS 'Payment status: pending, approved, paid';
COMMENT ON COLUMN public.work_orders.paid_at IS 'When payment was made';
COMMENT ON COLUMN public.work_orders.payment_notes IS 'Notes about the payment';