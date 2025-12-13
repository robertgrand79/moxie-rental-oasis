-- Add avatar and style settings to assistant_settings
ALTER TABLE public.assistant_settings 
ADD COLUMN IF NOT EXISTS avatar_type text DEFAULT 'concierge',
ADD COLUMN IF NOT EXISTS chat_style text DEFAULT 'modern';

-- Add constraint for valid avatar types
ALTER TABLE public.assistant_settings 
ADD CONSTRAINT valid_avatar_type CHECK (avatar_type IN ('concierge', 'traveler', 'host', 'advisor', 'guide', 'assistant'));

-- Add constraint for valid chat styles
ALTER TABLE public.assistant_settings 
ADD CONSTRAINT valid_chat_style CHECK (chat_style IN ('modern', 'minimal', 'playful', 'elegant'));