-- Add text color and submit button color customization columns to assistant_settings
ALTER TABLE public.assistant_settings 
ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#1F2937',
ADD COLUMN IF NOT EXISTS submit_button_color text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS user_message_text_color text DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS assistant_message_bg_color text DEFAULT NULL;