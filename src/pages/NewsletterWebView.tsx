import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import SecureContentRenderer from '@/components/SecureContentRenderer';
import { Helmet } from 'react-helmet-async';

const NewsletterWebView = () => {
  const { id } = useParams<{ id: string }>();

  const { data: newsletter, isLoading, error } = useQuery({
    queryKey: ['newsletter-web-view', id],
    queryFn: async () => {
      if (!id) throw new Error('Newsletter ID required');
      
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select(`
          id,
          subject,
          content,
          cover_image_url,
          sent_at,
          recipient_count,
          organization_id,
          organizations (
            name,
            logo_url
          )
        `)
        .eq('id', id)
        .not('sent_at', 'is', null)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch site settings for the organization
  const { data: siteSettings } = useQuery({
    queryKey: ['newsletter-org-settings', newsletter?.organization_id],
    queryFn: async () => {
      if (!newsletter?.organization_id) return null;
      
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('organization_id', newsletter.organization_id)
        .in('key', ['siteName', 'contactEmail', 'phone', 'address']);
      
      return data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>) || {};
    },
    enabled: !!newsletter?.organization_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Newsletter Not Found</h1>
          <p className="text-muted-foreground">
            This newsletter may have been removed or is not yet published.
          </p>
        </div>
      </div>
    );
  }

  const orgName = (newsletter as any).organizations?.name || siteSettings?.siteName || 'Newsletter';
  const logoUrl = (newsletter as any).organizations?.logo_url;

  return (
    <>
      <Helmet>
        <title>{newsletter.subject} | {orgName}</title>
        <meta name="description" content={newsletter.subject} />
      </Helmet>
      
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-gradient-to-br from-slate-200 to-slate-100 border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 py-8 text-center">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={orgName}
                className="h-12 w-auto mx-auto mb-4"
              />
            )}
            <h1 className="text-2xl font-bold text-slate-900">{orgName}</h1>
            <p className="text-slate-600 mt-1">Newsletter</p>
          </div>
        </header>

        {/* Cover Image */}
        {newsletter.cover_image_url && (
          <div className="max-w-3xl mx-auto">
            <img 
              src={newsletter.cover_image_url} 
              alt="Newsletter cover"
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Content */}
        <main className="max-w-3xl mx-auto px-4 py-8">
          <article className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8">
            {/* Subject */}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              {newsletter.subject}
            </h2>

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
              {newsletter.sent_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(newsletter.sent_at), 'MMMM d, yyyy')}</span>
                </div>
              )}
              {newsletter.recipient_count && newsletter.recipient_count > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>Sent to {newsletter.recipient_count} subscribers</span>
                </div>
              )}
            </div>

            {/* Newsletter content */}
            <div className="prose prose-slate max-w-none">
              <SecureContentRenderer 
                content={newsletter.content}
                className="newsletter-web-content"
              />
            </div>
          </article>
        </main>

        {/* Footer */}
        <footer className="bg-slate-100 border-t border-slate-200 mt-8">
          <div className="max-w-3xl mx-auto px-4 py-6 text-center text-sm text-slate-600">
            <p className="font-medium">{orgName}</p>
            {siteSettings?.address && (
              <p className="mt-1">{siteSettings.address}</p>
            )}
            {siteSettings?.contactEmail && (
              <p className="mt-1">
                <a href={`mailto:${siteSettings.contactEmail}`} className="text-primary hover:underline">
                  {siteSettings.contactEmail}
                </a>
              </p>
            )}
            <p className="mt-4 text-xs text-slate-400">
              View this email in your browser
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default NewsletterWebView;
