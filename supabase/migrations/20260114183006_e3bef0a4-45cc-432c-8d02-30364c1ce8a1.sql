-- Add font color customization columns to assistant_settings
ALTER TABLE assistant_settings
  ADD COLUMN IF NOT EXISTS header_text_color TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS welcome_title_color TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS welcome_subtitle_color TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS quick_action_text_color TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN assistant_settings.header_text_color IS 'Color of the assistant name and status in the header';
COMMENT ON COLUMN assistant_settings.welcome_title_color IS 'Color of the assistant name in the welcome screen';
COMMENT ON COLUMN assistant_settings.welcome_subtitle_color IS 'Color of the greeting message text';
COMMENT ON COLUMN assistant_settings.quick_action_text_color IS 'Color of text in quick action suggestion buttons';