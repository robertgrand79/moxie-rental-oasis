-- Add new columns to assistant_settings for personality and FAQs
ALTER TABLE public.assistant_settings 
ADD COLUMN IF NOT EXISTS personality text DEFAULT 'friendly',
ADD COLUMN IF NOT EXISTS custom_faqs jsonb DEFAULT '[]'::jsonb;

-- Add comment for personality options
COMMENT ON COLUMN public.assistant_settings.personality IS 'AI personality: friendly, professional, casual, concise';

-- Create conversation logging table
CREATE TABLE IF NOT EXISTS public.assistant_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  visitor_id text,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  message_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create conversation messages table
CREATE TABLE IF NOT EXISTS public.assistant_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.assistant_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  tool_calls jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_org ON public.assistant_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_session ON public.assistant_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_assistant_messages_conversation ON public.assistant_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_assistant_messages_created ON public.assistant_messages(created_at);

-- Enable RLS
ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Organization admins can view conversations"
ON public.assistant_conversations FOR SELECT
USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Public can create conversations"
ON public.assistant_conversations FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update conversations"
ON public.assistant_conversations FOR UPDATE
USING (true);

-- RLS policies for messages
CREATE POLICY "Organization admins can view messages"
ON public.assistant_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.assistant_conversations c
  WHERE c.id = assistant_messages.conversation_id
  AND user_belongs_to_organization(auth.uid(), c.organization_id)
));

CREATE POLICY "Public can insert messages"
ON public.assistant_messages FOR INSERT
WITH CHECK (true);