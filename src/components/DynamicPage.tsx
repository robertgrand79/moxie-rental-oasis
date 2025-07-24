
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import SecureContentRenderer from '@/components/SecureContentRenderer';

interface PageData {
  id: string;
  title: string;
  content: string;
  slug: string;
  is_published: boolean;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Page not found');
          } else {
            setError('Failed to load page');
          }
          return;
        }

        setPage(data);
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-full mb-8" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Page not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            {page.title}
          </h1>
          <SecureContentRenderer
            content={page.content || ''}
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-foreground prose-code:text-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;
