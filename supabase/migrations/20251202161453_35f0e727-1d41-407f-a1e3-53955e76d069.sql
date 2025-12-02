-- Add new columns for PriceLabs custom pricing data
ALTER TABLE dynamic_pricing 
ADD COLUMN IF NOT EXISTS min_stay integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS checkin_allowed boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_allowed boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS last_synced_at timestamp with time zone DEFAULT now();

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_last_synced 
ON dynamic_pricing(property_id, last_synced_at DESC);