-- Create platform admin preferences table for starred sections
CREATE TABLE public.platform_admin_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  starred_sections TEXT[] DEFAULT ARRAY['organizations', 'support']::TEXT[],
  sidebar_collapsed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT platform_admin_preferences_user_id_key UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.platform_admin_preferences ENABLE ROW LEVEL SECURITY;

-- Platform admins can manage their own preferences
CREATE POLICY "Users can view their own platform preferences"
ON public.platform_admin_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own platform preferences"
ON public.platform_admin_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platform preferences"
ON public.platform_admin_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_platform_admin_preferences_updated_at
BEFORE UPDATE ON public.platform_admin_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();