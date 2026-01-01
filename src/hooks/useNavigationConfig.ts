import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useNavigationPages } from '@/hooks/useNavigationPages';
import { navigationItems } from '@/components/navbar/navigationItems';
import type { NavigationConfig, NavigationItemConfig } from '@/types/navigation';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

const NAVIGATION_CONFIG_KEY = 'navigation_config';

// Generate default configuration from core items and custom pages
const generateDefaultConfig = (customPages: Array<{ id: string; slug: string; title: string }>): NavigationConfig => {
  const coreItems: NavigationItemConfig[] = navigationItems
    .filter(item => item.href !== '/admin') // Exclude admin from user config
    .map((item, idx) => ({
      id: item.name.toLowerCase(),
      type: 'core' as const,
      enabled: true,
      order: idx,
      originalTitle: item.title,
    }));

  const customItems: NavigationItemConfig[] = customPages.map((page, idx) => ({
    id: `custom_${page.id}`,
    type: 'custom' as const,
    enabled: true,
    order: coreItems.length + idx,
    slug: page.slug,
    originalTitle: page.title,
  }));

  return { items: [...coreItems, ...customItems] };
};

// Merge saved config with current items (handles new/removed pages)
const mergeConfigWithCurrentItems = (
  savedConfig: NavigationConfig | null,
  customPages: Array<{ id: string; slug: string; title: string }>
): NavigationConfig => {
  if (!savedConfig) {
    return generateDefaultConfig(customPages);
  }

  const existingIds = new Set(savedConfig.items.map(i => i.id));
  const currentCoreIds = navigationItems
    .filter(item => item.href !== '/admin')
    .map(item => item.name.toLowerCase());
  const currentCustomIds = customPages.map(p => `custom_${p.id}`);
  const allCurrentIds = new Set([...currentCoreIds, ...currentCustomIds]);

  // Filter out items that no longer exist
  let items = savedConfig.items.filter(item => allCurrentIds.has(item.id));

  // Add new core items that weren't in saved config
  const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) : -1;
  let nextOrder = maxOrder + 1;

  for (const coreId of currentCoreIds) {
    if (!existingIds.has(coreId)) {
      const navItem = navigationItems.find(n => n.name.toLowerCase() === coreId);
      items.push({
        id: coreId,
        type: 'core',
        enabled: true,
        order: nextOrder++,
        originalTitle: navItem?.title,
      });
    }
  }

  // Add new custom pages that weren't in saved config
  for (const page of customPages) {
    const customId = `custom_${page.id}`;
    if (!existingIds.has(customId)) {
      items.push({
        id: customId,
        type: 'custom',
        enabled: true,
        order: nextOrder++,
        slug: page.slug,
        originalTitle: page.title,
      });
    }
  }

  // Update slug/title for custom pages (in case they changed)
  items = items.map(item => {
    if (item.type === 'custom') {
      const pageId = item.id.replace('custom_', '');
      const page = customPages.find(p => p.id === pageId);
      if (page) {
        return { ...item, slug: page.slug, originalTitle: page.title };
      }
    }
    return item;
  });

  return { items };
};

export const useNavigationConfig = (organizationId?: string | null) => {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();
  
  // Use provided organizationId or fall back to tenantId from context
  const effectiveOrgId = organizationId ?? tenantId;
  
  const { data: customPages = [] } = useNavigationPages(effectiveOrgId);

  const query = useQuery({
    queryKey: ['navigation-config', effectiveOrgId],
    queryFn: async (): Promise<NavigationConfig> => {
      if (!effectiveOrgId) {
        return generateDefaultConfig([]);
      }

      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('organization_id', effectiveOrgId)
        .eq('key', NAVIGATION_CONFIG_KEY)
        .maybeSingle();

      if (error) {
        console.error('Error fetching navigation config:', error);
        return generateDefaultConfig(customPages);
      }

      const savedConfig = data?.value as unknown as NavigationConfig | null;
      return mergeConfigWithCurrentItems(savedConfig, customPages);
    },
    enabled: !!effectiveOrgId,
    staleTime: 1000 * 60 * 5,
  });

  const saveMutation = useMutation({
    mutationFn: async (config: NavigationConfig) => {
      if (!effectiveOrgId) throw new Error('No organization ID');

      // Check if record exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('organization_id', effectiveOrgId)
        .eq('key', NAVIGATION_CONFIG_KEY)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: config as unknown as Json })
          .eq('organization_id', effectiveOrgId)
          .eq('key', NAVIGATION_CONFIG_KEY);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({
            organization_id: effectiveOrgId,
            key: NAVIGATION_CONFIG_KEY,
            value: config as unknown as Json,
          });
        if (error) throw error;
      }

      if (false) throw new Error(); // satisfy TS
      return config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-config', effectiveOrgId] });
      toast({
        title: 'Navigation updated',
        description: 'Your navigation menu has been saved.',
      });
    },
    onError: (error) => {
      console.error('Error saving navigation config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save navigation settings.',
        variant: 'destructive',
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveOrgId) throw new Error('No organization ID');

      const { error } = await supabase
        .from('site_settings')
        .delete()
        .eq('organization_id', effectiveOrgId)
        .eq('key', NAVIGATION_CONFIG_KEY);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-config', effectiveOrgId] });
      toast({
        title: 'Navigation reset',
        description: 'Navigation menu has been reset to defaults.',
      });
    },
    onError: (error) => {
      console.error('Error resetting navigation config:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset navigation settings.',
        variant: 'destructive',
      });
    },
  });

  return {
    config: query.data,
    isLoading: query.isLoading,
    saveConfig: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    resetConfig: resetMutation.mutate,
    isResetting: resetMutation.isPending,
  };
};
