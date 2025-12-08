
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import LoadingState from '@/components/ui/loading-state';
import { pageService } from '@/services/pageService';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { getDefaultPages } from '@/data/defaultPages';
import { toast } from '@/hooks/use-toast';
import SecureContentRenderer from '@/components/SecureContentRenderer';

const DynamicFAQ = () => {
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();
  
  const { data: faqPage, isLoading, error, refetch } = useQuery({
    queryKey: ['page', 'faq', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;
      const pages = await pageService.fetchPages(organization.id);
      return pages.find(page => page.slug === 'faq' && page.is_published);
    },
    enabled: !!organization?.id
  });

  const updateFAQContent = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update content.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (!organization?.id) return;
      const defaultPages = getDefaultPages(user.id, organization.id);
      const faqDefaultContent = defaultPages.find(page => page.slug === 'faq');
      
      if (faqDefaultContent && faqPage) {
        await pageService.updatePage(faqPage.id, {
          content: faqDefaultContent.content,
          meta_description: faqDefaultContent.meta_description,
          is_published: faqDefaultContent.is_published
        });
        
        await refetch();
        
        toast({
          title: 'Success',
          description: 'FAQ content has been updated with comprehensive information!'
        });
      }
    } catch (error) {
      console.error('Error updating FAQ content:', error);
      toast({
        title: 'Error',
        description: 'Failed to update FAQ content.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return <LoadingState variant="page" message="Loading FAQ..." />;
  }

  if (error || !faqPage) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-8">FAQ Not Available</h1>
            <p className="text-muted-foreground mb-8">
              The FAQ page is currently being updated. Please check back later or contact us directly.
            </p>
            {user && (
              <Button onClick={updateFAQContent} className="mb-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Comprehensive FAQ Content
              </Button>
            )}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for? Contact us at gabby@moxievacationrentals.com or call 541-255-1545.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if content seems minimal and show update option for admins
  const isMinimalContent = !faqPage.content || faqPage.content.length < 1000;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-4xl font-bold text-foreground">{faqPage.title}</h1>
            {user && isMinimalContent && (
              <Button onClick={updateFAQContent} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Full Content
              </Button>
            )}
          </div>
          
          {faqPage.meta_description && (
            <p className="text-lg text-muted-foreground mb-8">{faqPage.meta_description}</p>
          )}
          
          <SecureContentRenderer
            content={faqPage.content || ''}
            className="prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2"
          />

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Can't find what you're looking for? Contact us at gabby@moxievacationrentals.com or call 541-255-1545.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicFAQ;
