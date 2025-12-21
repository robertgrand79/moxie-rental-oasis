-- Priority 1 Security Fixes: Tighten RLS Policies

-- =============================================
-- Fix 1: Chat Sessions - Remove overly permissive SELECT
-- =============================================
DROP POLICY IF EXISTS "Users can view specific chat sessions" ON chat_sessions;

-- =============================================
-- Fix 2: Chat Messages - Remove overly permissive SELECT
-- =============================================
DROP POLICY IF EXISTS "Users can view messages in accessible sessions" ON chat_messages;

-- =============================================
-- Fix 3: Device Configurations - Replace permissive SELECT with proper access control
-- =============================================
DROP POLICY IF EXISTS "Devices can view their configuration" ON device_configurations;

-- Add proper policy: Only organization members with property access can view device configs
CREATE POLICY "Organization members can view device configurations"
ON device_configurations
FOR SELECT
USING (can_access_property(auth.uid(), property_id));