-- Create guest profiles table for enhanced guest experience
CREATE TABLE public.guest_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  profile_image_url TEXT,
  preferences JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create digital guidebooks table
CREATE TABLE public.property_guidebooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Structured guidebook content
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create guest support chat table
CREATE TABLE public.guest_support_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_profile_id UUID REFERENCES guest_profiles(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES property_reservations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active', -- 'active', 'resolved', 'closed'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  subject TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create guest support messages table
CREATE TABLE public.guest_support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES guest_support_chats(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'guest', 'admin', 'system'
  sender_id UUID, -- guest_profile_id or admin user_id
  message_content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file'
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create guest notifications table
CREATE TABLE public.guest_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_profile_id UUID REFERENCES guest_profiles(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES property_reservations(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'booking_reminder', 'checkin_ready', 'weather_alert', 'local_event', 'checkout_reminder'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.guest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_guidebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_notifications ENABLE ROW LEVEL SECURITY;