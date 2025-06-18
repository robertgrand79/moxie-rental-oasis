
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
      const existingPages = await pageService.fetchPages();
      
      for (const pageData of defaultPages) {
        const existingPage = existingPages.find(page => page.slug === pageData.slug);
        
        if (!existingPage) {
          // Create new page if it doesn't exist
          console.log(`Creating new page: ${pageData.slug}`);
          await pageService.createPage(pageData);
        } else {
          // Always update existing pages with default content to ensure they have the latest version
          // This is especially important for pages like FAQ that have comprehensive content
          const shouldUpdate = !existingPage.content || 
                              existingPage.content.length < 1000 || 
                              pageData.slug === 'faq'; // Always update FAQ to ensure comprehensive content
          
          if (shouldUpdate) {
            console.log(`Updating page ${pageData.slug} with comprehensive content`);
            await pageService.updatePage(existingPage.id, {
              content: pageData.content,
              meta_description: pageData.meta_description,
              is_published: pageData.is_published
            });
          }
        }
      }

      console.log('Auto-loaded and updated all website pages');
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
      const existingPages = await pageService.fetchPages();
      
      for (const pageData of publicPages) {
        const existingPage = existingPages.find(page => page.slug === pageData.slug);
        
        if (!existingPage) {
          console.log(`Creating new page: ${pageData.slug}`);
          await pageService.createPage(pageData);
        } else {
          // Always update with comprehensive content, especially for FAQ
          const shouldUpdate = !existingPage.content || 
                              existingPage.content.length < 1000 || 
                              pageData.slug === 'faq';
          
          if (shouldUpdate) {
            console.log(`Updating page ${pageData.slug} with comprehensive default content`);
            await pageService.updatePage(existingPage.id, {
              content: pageData.content,
              meta_description: pageData.meta_description,
              is_published: pageData.is_published
            });
          }
        }
      }

      await fetchPages();
      
      toast({
        title: 'Success',
        description: 'Site pages have been added and updated with comprehensive content!'
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
