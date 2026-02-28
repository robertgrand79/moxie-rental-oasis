import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export type TeamRole = 'owner' | 'manager' | 'staff' | 'maintenance' | 'cleaner' | 'view_only';

export type PermissionKey = 
  | 'view_dashboard'
  | 'view_properties'
  | 'edit_properties'
  | 'add_delete_properties'
  | 'view_bookings'
  | 'manage_bookings'
  | 'view_guest_info'
  | 'respond_inquiries'
  | 'edit_site'
  | 'view_reports'
  | 'export_data'
  | 'manage_billing'
  | 'manage_team'
  | 'account_settings';

// Default permission matrix (fallback if DB fetch fails)
const DEFAULT_PERMISSIONS: Record<TeamRole, Record<PermissionKey, boolean>> = {
  owner: {
    view_dashboard: true,
    view_properties: true,
    edit_properties: true,
    add_delete_properties: true,
    view_bookings: true,
    manage_bookings: true,
    view_guest_info: true,
    respond_inquiries: true,
    edit_site: true,
    view_reports: true,
    export_data: true,
    manage_billing: true,
    manage_team: true,
    account_settings: true,
  },
  manager: {
    view_dashboard: true,
    view_properties: true,
    edit_properties: true,
    add_delete_properties: true,
    view_bookings: true,
    manage_bookings: true,
    view_guest_info: true,
    respond_inquiries: true,
    edit_site: true,
    view_reports: true,
    export_data: true,
    manage_billing: false,
    manage_team: false,
    account_settings: true,
  },
  staff: {
    view_dashboard: true,
    view_properties: true,
    edit_properties: true,
    add_delete_properties: false,
    view_bookings: true,
    manage_bookings: true,
    view_guest_info: true,
    respond_inquiries: true,
    edit_site: false,
    view_reports: true,
    export_data: false,
    manage_billing: false,
    manage_team: false,
    account_settings: false,
  },
  view_only: {
    view_dashboard: true,
    view_properties: true,
    edit_properties: false,
    add_delete_properties: false,
    view_bookings: true,
    manage_bookings: false,
    view_guest_info: false,
    respond_inquiries: false,
    edit_site: false,
    view_reports: true,
    export_data: false,
    manage_billing: false,
    manage_team: false,
    account_settings: false,
  },
  maintenance: {
    view_dashboard: true,
    view_properties: true,
    edit_properties: false,
    add_delete_properties: false,
    view_bookings: false,
    manage_bookings: false,
    view_guest_info: false,
    respond_inquiries: false,
    edit_site: false,
    view_reports: false,
    export_data: false,
    manage_billing: false,
    manage_team: false,
    account_settings: false,
  },
  cleaner: {
    view_dashboard: true,
    view_properties: true,
    edit_properties: false,
    add_delete_properties: false,
    view_bookings: false,
    manage_bookings: false,
    view_guest_info: false,
    respond_inquiries: false,
    edit_site: false,
    view_reports: false,
    export_data: false,
    manage_billing: false,
    manage_team: false,
    account_settings: false,
  },
};

interface TeamPermissionsHook {
  teamRole: TeamRole | null;
  loading: boolean;
  hasPermission: (permission: PermissionKey) => boolean;
  canViewDashboard: boolean;
  canViewProperties: boolean;
  canEditProperties: boolean;
  canAddDeleteProperties: boolean;
  canViewBookings: boolean;
  canManageBookings: boolean;
  canViewGuestInfo: boolean;
  canRespondInquiries: boolean;
  canEditSite: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageBilling: boolean;
  canManageTeam: boolean;
  canAccessSettings: boolean;
  isOwner: boolean;
  isManager: boolean;
  isStaff: boolean;
  isMaintenance: boolean;
  isCleaner: boolean;
  isViewOnly: boolean;
  isFieldRole: boolean;
  refetch: () => Promise<void>;
}

export const useTeamPermissions = (): TeamPermissionsHook => {
  const { user } = useAuth();
  const { organization: currentOrganization } = useCurrentOrganization();
  const [teamRole, setTeamRole] = useState<TeamRole | null>(null);
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTeamRole = useCallback(async () => {
    if (!user?.id || !currentOrganization?.id) {
      setTeamRole(null);
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch user's team role in the organization
      const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .select('team_role, role')
        .eq('user_id', user.id)
        .eq('organization_id', currentOrganization.id)
        .single();

      if (memberError || !membership) {
        console.log('No membership found, defaulting to staff');
        setTeamRole('staff');
        setPermissions(DEFAULT_PERMISSIONS.staff);
        setLoading(false);
        return;
      }

      // Use team_role if available, otherwise map from legacy role
      let role: TeamRole = 'staff';
      if (membership.team_role) {
        role = membership.team_role as TeamRole;
      } else if (membership.role === 'owner') {
        role = 'owner';
      } else if (membership.role === 'admin') {
        role = 'manager';
      }

      setTeamRole(role);

      // Fetch permissions from database
      const { data: permData, error: permError } = await supabase
        .from('team_permissions')
        .select('permission_key, is_allowed')
        .eq('team_role', role);

      if (permError || !permData || permData.length === 0) {
        // Use default permissions
        setPermissions(DEFAULT_PERMISSIONS[role]);
      } else {
        // Build permissions object from database
        const perms: Record<string, boolean> = {};
        permData.forEach(p => {
          perms[p.permission_key] = p.is_allowed;
        });
        setPermissions(perms as Record<PermissionKey, boolean>);
      }
    } catch (error) {
      console.error('Error fetching team permissions:', error);
      setTeamRole('staff');
      setPermissions(DEFAULT_PERMISSIONS.staff);
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentOrganization?.id]);

  useEffect(() => {
    fetchTeamRole();
  }, [fetchTeamRole]);

  const hasPermission = useCallback((permission: PermissionKey): boolean => {
    if (!permissions) return false;
    return permissions[permission] ?? false;
  }, [permissions]);

  return {
    teamRole,
    loading,
    hasPermission,
    canViewDashboard: hasPermission('view_dashboard'),
    canViewProperties: hasPermission('view_properties'),
    canEditProperties: hasPermission('edit_properties'),
    canAddDeleteProperties: hasPermission('add_delete_properties'),
    canViewBookings: hasPermission('view_bookings'),
    canManageBookings: hasPermission('manage_bookings'),
    canViewGuestInfo: hasPermission('view_guest_info'),
    canRespondInquiries: hasPermission('respond_inquiries'),
    canEditSite: hasPermission('edit_site'),
    canViewReports: hasPermission('view_reports'),
    canExportData: hasPermission('export_data'),
    canManageBilling: hasPermission('manage_billing'),
    canManageTeam: hasPermission('manage_team'),
    canAccessSettings: hasPermission('account_settings'),
    isOwner: teamRole === 'owner',
    isManager: teamRole === 'manager',
    isStaff: teamRole === 'staff',
    isMaintenance: teamRole === 'maintenance',
    isCleaner: teamRole === 'cleaner',
    isViewOnly: teamRole === 'view_only',
    isFieldRole: teamRole === 'maintenance' || teamRole === 'cleaner',
    refetch: fetchTeamRole,
  };
};
