
-- Fix the eugene_events table constraint by making created_by nullable
-- (since AI-generated content doesn't have a specific user creator)
ALTER TABLE eugene_events ALTER COLUMN created_by DROP NOT NULL;

-- Create the content_approval_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS content_approval_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('blog_post', 'property_description', 'page_content', 'ai_response', 'poi', 'events', 'lifestyle')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  original_prompt TEXT,
  feedback TEXT,
  created_by TEXT NOT NULL DEFAULT 'AI',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the chat_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'resolved')),
  last_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('guest', 'admin', 'ai')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on content_approval_items
ALTER TABLE content_approval_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_approval_items
CREATE POLICY "Anyone can view content approval items" ON content_approval_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert content approval items" ON content_approval_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update content approval items" ON content_approval_items FOR UPDATE USING (true);

-- Enable RLS on chat tables
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat tables
CREATE POLICY "Anyone can view chat sessions" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update chat sessions" ON chat_sessions FOR UPDATE USING (true);

CREATE POLICY "Anyone can view chat messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update chat messages" ON chat_messages FOR UPDATE USING (true);
