
-- Insert default permissions for maintenance and cleaner roles
INSERT INTO public.team_permissions (team_role, permission_key, is_allowed) VALUES
  ('maintenance', 'view_dashboard', true),
  ('maintenance', 'view_properties', true),
  ('maintenance', 'edit_properties', false),
  ('maintenance', 'add_delete_properties', false),
  ('maintenance', 'view_bookings', false),
  ('maintenance', 'manage_bookings', false),
  ('maintenance', 'view_guest_info', false),
  ('maintenance', 'respond_inquiries', false),
  ('maintenance', 'edit_site', false),
  ('maintenance', 'view_reports', false),
  ('maintenance', 'export_data', false),
  ('maintenance', 'manage_billing', false),
  ('maintenance', 'manage_team', false),
  ('maintenance', 'account_settings', false),
  ('cleaner', 'view_dashboard', true),
  ('cleaner', 'view_properties', true),
  ('cleaner', 'edit_properties', false),
  ('cleaner', 'add_delete_properties', false),
  ('cleaner', 'view_bookings', false),
  ('cleaner', 'manage_bookings', false),
  ('cleaner', 'view_guest_info', false),
  ('cleaner', 'respond_inquiries', false),
  ('cleaner', 'edit_site', false),
  ('cleaner', 'view_reports', false),
  ('cleaner', 'export_data', false),
  ('cleaner', 'manage_billing', false),
  ('cleaner', 'manage_team', false),
  ('cleaner', 'account_settings', false)
ON CONFLICT DO NOTHING;

-- Tighten org_members management: only owners & managers
DROP POLICY IF EXISTS "Org admins can manage members" ON public.organization_members;

CREATE POLICY "Owners and managers can manage members"
  ON public.organization_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = organization_members.organization_id
        AND (om.team_role IN ('owner', 'manager') OR om.role = 'owner')
    )
    OR public.is_platform_admin(auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = organization_members.organization_id
        AND (om.team_role IN ('owner', 'manager') OR om.role = 'owner')
    )
    OR public.is_platform_admin(auth.uid())
  );

-- Tighten invitation management
DROP POLICY IF EXISTS "Org admins can manage invitations" ON public.user_invitations;

CREATE POLICY "Owners and managers can manage invitations"
  ON public.user_invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = user_invitations.organization_id
        AND (om.team_role IN ('owner', 'manager') OR om.role = 'owner')
    )
    OR public.is_platform_admin(auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = user_invitations.organization_id
        AND (om.team_role IN ('owner', 'manager') OR om.role = 'owner')
    )
    OR public.is_platform_admin(auth.uid())
  );
