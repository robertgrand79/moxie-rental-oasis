-- Add PriceLabs listing ID column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pricelabs_listing_id TEXT;