-- AI-Powered Automated Communications & Multi-language Support

-- 1. Add AI personalization fields to messaging_rules
ALTER TABLE messaging_rules 
ADD COLUMN IF NOT EXISTS ai_personalization BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_personalization_context TEXT;

-- 2. Add language fields to property_reservations
ALTER TABLE property_reservations 
ADD COLUMN IF NOT EXISTS guest_language VARCHAR(10) DEFAULT 'en';

-- 3. Add language detection to guest_inbox_threads
ALTER TABLE guest_inbox_threads 
ADD COLUMN IF NOT EXISTS detected_language VARCHAR(10);

-- 4. Add translation fields to guest_communications
ALTER TABLE guest_communications 
ADD COLUMN IF NOT EXISTS original_content TEXT,
ADD COLUMN IF NOT EXISTS translated_language VARCHAR(10),
ADD COLUMN IF NOT EXISTS detected_language VARCHAR(10);

-- 5. Create index for language queries
CREATE INDEX IF NOT EXISTS idx_reservations_guest_language 
ON property_reservations(guest_language);

CREATE INDEX IF NOT EXISTS idx_inbox_threads_detected_language 
ON guest_inbox_threads(detected_language);