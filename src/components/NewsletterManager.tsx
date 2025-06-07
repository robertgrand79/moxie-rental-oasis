
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import NewsletterOverview from './NewsletterOverview';
import NewsletterAIGenerator from './NewsletterAIGenerator';
import NewsletterForm from './NewsletterForm';
import NewsletterPreview from './NewsletterPreview';
import NewsletterQuickActions from './NewsletterQuickActions';

interface NewsletterFormData {
  subject: string;
  content: string;
  blogPostId?: string;
}

const NewsletterManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const { toast } = useToast();
  
  const form = useForm<NewsletterFormData>({
    defaultValues: {
      subject: '',
      content: '',
      blogPostId: '',
    },
  });

  React.useEffect(() => {
    fetchSubscriberCount();
  }, []);

  const fetchSubscriberCount = async () => {
    try {
      const { count, error } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error) throw error;
      setSubscriberCount(count || 0);
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
    }
  };

  const onSubmit = async (data: NewsletterFormData) => {
    setIsLoading(true);

    try {
      const { data: result, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          subject: data.subject,
          content: content,
          blogPostId: data.blogPostId || undefined,
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Newsletter Sent!",
        description: `Successfully sent to ${result.recipientCount} subscribers.`,
      });
      
      form.reset();
      setContent('');
    } catch (error: any) {
      console.error('Newsletter send error:', error);
      toast({
        title: "Send Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateBlogNewsletter = (title: string, excerpt: string, slug: string) => {
    form.setValue('subject', `New Post: ${title}`);
    const newsletterContent = `
      <h2>${title}</h2>
      <p>${excerpt}</p>
      <p>
        <a href="${window.location.origin}/blog/${slug}" 
           style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 15px;">
          Read Full Article
        </a>
      </p>
    `;
    setContent(newsletterContent);
    form.setValue('blogPostId', slug);
  };

  const handleContentGenerated = (field: 'subject' | 'content', generatedContent: string) => {
    if (field === 'content') {
      setContent(generatedContent);
    } else {
      form.setValue('subject', generatedContent);
    }
  };

  return (
    <div className="space-y-6">
      <NewsletterOverview subscriberCount={subscriberCount} />

      <NewsletterAIGenerator
        currentSubject={form.getValues('subject')}
        currentContent={content}
        onContentGenerated={handleContentGenerated}
      />

      <NewsletterForm
        form={form}
        content={content}
        setContent={setContent}
        onSubmit={onSubmit}
        isLoading={isLoading}
        subscriberCount={subscriberCount}
      />

      <NewsletterPreview
        subject={form.getValues('subject')}
        content={content}
      />

      <NewsletterQuickActions
        onGenerateBlogNewsletter={generateBlogNewsletter}
      />
    </div>
  );
};

export default NewsletterManager;
