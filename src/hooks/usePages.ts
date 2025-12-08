
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';
import { pageService } from '@/services/pageService';
import { usePageOperations } from '@/hooks/usePageOperations';
import { Page } from '@/types/page';

export const usePages = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();

  const fetchPages = async () => {
    if (!organization?.id) {
      setPages([]);
      setLoading(false);
      return;
    }

    console.log('Fetching pages for organization:', organization.id);
    setLoading(true);
    try {
      const data = await pageService.fetchPages(organization.id);
      console.log('Fetched pages:', data);
      console.log('Number of pages found:', data?.length || 0);
      setPages(data);
    } catch (error) {
      console.error('Error in fetchPages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pages.',
        variant: 'destructive'
      });
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const pageOperations = usePageOperations(user, setPages, fetchPages, organization?.id);

  useEffect(() => {
    console.log('usePages effect triggered, user:', user, 'organization:', organization?.id);
    const loadPages = async () => {
      if (user && organization?.id) {
        await pageOperations.autoLoadAllPages();
      }
      await fetchPages();
    };
    loadPages();
  }, [user, organization?.id]);

  return {
    pages,
    loading,
    addPage: pageOperations.addPage,
    editPage: pageOperations.editPage,
    deletePage: pageOperations.deletePage,
    addSitePages: pageOperations.addSitePages,
    refetch: fetchPages
  };
};
