-- Add RLS policies for guest experience tables

-- Create policies for guest profiles
CREATE POLICY "Guests can view and update their own profile" 
ON public.guest_profiles 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Public can create guest profiles" 
ON public.guest_profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all guest profiles" 
ON public.guest_profiles 
FOR ALL 
USING (is_admin());

-- Create policies for guidebooks
CREATE POLICY "Anyone can view active guidebooks" 
ON public.property_guidebooks 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage guidebooks" 
ON public.property_guidebooks 
FOR ALL 
USING (is_admin());

-- Create policies for guest support
CREATE POLICY "Guests can manage their own support chats" 
ON public.guest_support_chats 
FOR ALL 
USING (guest_profile_id IN (SELECT id FROM guest_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all support chats" 
ON public.guest_support_chats 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view messages in their chats" 
ON public.guest_support_messages 
FOR SELECT 
USING (
  chat_id IN (
    SELECT id FROM guest_support_chats 
    WHERE guest_profile_id IN (SELECT id FROM guest_profiles WHERE user_id = auth.uid())
  ) OR is_admin()
);

CREATE POLICY "Users can send messages in their chats" 
ON public.guest_support_messages 
FOR INSERT 
WITH CHECK (
  chat_id IN (
    SELECT id FROM guest_support_chats 
    WHERE guest_profile_id IN (SELECT id FROM guest_profiles WHERE user_id = auth.uid())
  ) OR is_admin()
);

-- Create policies for notifications
CREATE POLICY "Guests can view their own notifications" 
ON public.guest_notifications 
FOR SELECT 
USING (guest_profile_id IN (SELECT id FROM guest_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Guests can update their own notifications" 
ON public.guest_notifications 
FOR UPDATE 
USING (guest_profile_id IN (SELECT id FROM guest_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all notifications" 
ON public.guest_notifications 
FOR ALL 
USING (is_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_guest_profiles_updated_at
BEFORE UPDATE ON public.guest_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_guidebooks_updated_at
BEFORE UPDATE ON public.property_guidebooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guest_support_chats_updated_at
BEFORE UPDATE ON public.guest_support_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();