CREATE POLICY "Platform admins can delete notifications"
ON public.platform_notifications
FOR DELETE
TO authenticated
USING (public.is_platform_admin(auth.uid()));