import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export interface CategoryCompletion {
  id: string;
  complete: number;
  total: number;
  status: 'complete' | 'partial' | 'needs-setup';
}

export interface SettingsCompletion {
  categories: Record<string, CategoryCompletion>;
  overallPercentage: number;
  completeCount: number;
  totalCount: number;
}

// Helper functions to avoid type instantiation depth issues
async function getTableCount(table: string, orgId: string): Promise<number> {
  const { count } = await (supabase
    .from(table as any)
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId) as any);
  return count || 0;
}

export const useSettingsCompletion = () => {
  const { organization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['settings-completion', organization?.id],
    queryFn: async (): Promise<SettingsCompletion> => {
      if (!organization?.id) {
        return getEmptyCompletion();
      }

      const orgId = organization.id;

      // Fetch all required data in parallel
      const [
        siteSettingsResult,
        orgResult,
        membersCount,
        propertiesCount,
        testimonialsCount,
        eventsCount,
        placesCount
      ] = await Promise.all([
        supabase
          .from('site_settings')
          .select('key, value')
          .eq('organization_id', orgId),
        supabase
          .from('organizations_safe')
          .select('name, slug, has_stripe_configured, has_pricelabs_configured, has_resend_configured, has_seam_configured, has_openphone_configured')
          .eq('id', orgId)
          .single(),
        getTableCount('organization_members', orgId),
        getTableCount('properties', orgId),
        getTableCount('testimonials', orgId),
        getTableCount('eugene_events', orgId),
        getTableCount('places', orgId)
      ]);

      // Parse site_settings key-value pairs into a map
      const settingsMap: Record<string, string> = {};
      if (siteSettingsResult.data) {
        for (const row of siteSettingsResult.data) {
          settingsMap[row.key] = row.value as string;
        }
      }

      const org = orgResult.data;

      // Calculate completion for each category
      const categories: Record<string, CategoryCompletion> = {};

      // Organization: name, slug, has property
      const orgComplete = [
        !!org?.name,
        !!org?.slug,
        propertiesCount > 0
      ].filter(Boolean).length;
      categories.organization = {
        id: 'organization',
        complete: orgComplete,
        total: 3,
        status: getStatus(orgComplete, 3)
      };

      // Site & Content: site name, hero title, contact email
      const siteComplete = [
        !!settingsMap.siteName,
        !!settingsMap.heroTitle,
        !!settingsMap.contactEmail
      ].filter(Boolean).length;
      categories.site = {
        id: 'site',
        complete: siteComplete,
        total: 3,
        status: getStatus(siteComplete, 3)
      };

      // Appearance: logo uploaded
      const appearanceComplete = [
        !!settingsMap.siteLogo
      ].filter(Boolean).length;
      categories.appearance = {
        id: 'appearance',
        complete: appearanceComplete,
        total: 1,
        status: getStatus(appearanceComplete, 1)
      };

      // Team & Access: at least 1 member
      const teamComplete = membersCount > 0 ? 1 : 0;
      categories.team = {
        id: 'team',
        complete: teamComplete,
        total: 1,
        status: getStatus(teamComplete, 1)
      };

      // Integrations: at least 1 configured
      const integrationsConfigured = [
        !!org?.resend_api_key,
        !!org?.seam_api_key,
        !!org?.openphone_api_key
      ].filter(Boolean).length;
      categories.integrations = {
        id: 'integrations',
        complete: integrationsConfigured > 0 ? 1 : 0,
        total: 1,
        status: integrationsConfigured > 0 ? 'complete' : 'needs-setup'
      };

      // Payments: Stripe configured
      const paymentsComplete = [
        !!org?.stripe_secret_key
      ].filter(Boolean).length;
      categories.payments = {
        id: 'payments',
        complete: paymentsComplete,
        total: 1,
        status: getStatus(paymentsComplete, 1)
      };

      // Local Content: at least 1 item (testimonial, event, or place)
      const hasLocalContent = testimonialsCount > 0 || eventsCount > 0 || placesCount > 0;
      categories.content = {
        id: 'content',
        complete: hasLocalContent ? 1 : 0,
        total: 1,
        status: hasLocalContent ? 'complete' : 'needs-setup'
      };

      // Calculate overall
      const completeCount = Object.values(categories).filter(c => c.status === 'complete').length;
      const totalCount = Object.keys(categories).length;
      const overallPercentage = Math.round((completeCount / totalCount) * 100);

      return {
        categories,
        overallPercentage,
        completeCount,
        totalCount
      };
    },
    enabled: !!organization?.id,
    staleTime: 30000
  });
};

function getStatus(complete: number, total: number): 'complete' | 'partial' | 'needs-setup' {
  if (complete === total) return 'complete';
  if (complete === 0) return 'needs-setup';
  return 'partial';
}

function getEmptyCompletion(): SettingsCompletion {
  return {
    categories: {},
    overallPercentage: 0,
    completeCount: 0,
    totalCount: 7
  };
}
