
import { pageService } from '@/services/pageService';
import { getDefaultPages } from '@/data/defaultPages';
import { toast } from '@/hooks/use-toast';
import { Page, PageFormData } from '@/types/page';

export const usePageOperations = (user: any, setPages: (updater: (prev: Page[]) => Page[]) => void, fetchPages: () => Promise<void>) => {
  const addPage = async (pageData: PageFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create pages.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const data = await pageService.createPage({
        ...pageData,
        created_by: user.id
      });

      setPages(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Page created successfully!'
      });
    } catch (error) {
      console.error('Error in addPage:', error);
      toast({
        title: 'Error',
        description: 'Failed to create page.',
        variant: 'destructive'
      });
    }
  };

  const editPage = async (pageId: string, pageData: PageFormData) => {
    try {
      const data = await pageService.updatePage(pageId, pageData);

      setPages(prev => prev.map(page => 
        page.id === pageId ? data : page
      ));
      toast({
        title: 'Success',
        description: 'Page updated successfully!'
      });
    } catch (error) {
      console.error('Error in editPage:', error);
      toast({
        title: 'Error',
        description: 'Failed to update page.',
        variant: 'destructive'
      });
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      await pageService.deletePage(pageId);

      setPages(prev => prev.filter(page => page.id !== pageId));
      toast({
        title: 'Success',
        description: 'Page deleted successfully!'
      });
    } catch (error) {
      console.error('Error in deletePage:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete page.',
        variant: 'destructive'
      });
    }
  };

  const autoLoadAllPages = async () => {
    if (!user) return;

    const defaultPages = getDefaultPages(user.id);

    try {
      for (const pageData of defaultPages) {
        const exists = await pageService.checkPageExists(pageData.slug);
        
        if (!exists) {
          await pageService.createPage(pageData);
        }
      }

      console.log('Auto-loaded all website pages into database');
    } catch (error) {
      console.error('Error auto-loading pages:', error);
    }
  };

  const addSitePages = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add site pages.',
        variant: 'destructive'
      });
      return;
    }

    const publicPages = getDefaultPages(user.id).filter(page => page.is_published);

    try {
      for (const pageData of publicPages) {
        const exists = await pageService.checkPageExists(pageData.slug);
        
        if (!exists) {
          await pageService.createPage(pageData);
        }
      }

      await fetchPages();
      
      toast({
        title: 'Success',
        description: 'Site pages have been added successfully!'
      });
    } catch (error) {
      console.error('Error adding site pages:', error);
      toast({
        title: 'Error',
        description: 'Failed to add some site pages.',
        variant: 'destructive'
      });
    }
  };

  return {
    addPage,
    editPage,
    deletePage,
    autoLoadAllPages,
    addSitePages
  };
};
