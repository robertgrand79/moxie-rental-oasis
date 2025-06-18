
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import LoadingState from '@/components/ui/loading-state';
import { pageService } from '@/services/pageService';

const DynamicFAQ = () => {
  const { data: faqPage, isLoading, error } = useQuery({
    queryKey: ['page', 'faq'],
    queryFn: async () => {
      const pages = await pageService.fetchPages();
      return pages.find(page => page.slug === 'faq' && page.is_published);
    }
  });

  if (isLoading) {
    return <LoadingState variant="page" message="Loading FAQ..." />;
  }

  if (error || !faqPage) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-8">FAQ Not Available</h1>
            <p className="text-muted-foreground">
              The FAQ page is currently being updated. Please check back later or contact us directly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">{faqPage.title}</h1>
          
          {faqPage.meta_description && (
            <p className="text-lg text-muted-foreground mb-8">{faqPage.meta_description}</p>
          )}
          
          <div 
            className="prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: faqPage.content || '' }}
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
