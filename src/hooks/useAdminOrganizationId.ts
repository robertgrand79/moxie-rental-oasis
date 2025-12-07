import { useCurrentOrganization } from '@/contexts/OrganizationContext';

/**
 * Helper hook for admin pages to get the current organization ID.
 * Uses OrganizationContext which is scoped to the authenticated user's organization.
 */
export const useAdminOrganizationId = () => {
  const { organization, loading, error } = useCurrentOrganization();
  
  return {
    organizationId: organization?.id ?? null,
    organization,
    loading,
    error,
  };
};
