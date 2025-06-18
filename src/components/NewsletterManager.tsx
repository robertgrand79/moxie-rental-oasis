
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useNewsletterStats } from '@/hooks/useNewsletterStats';
import NewsletterOverview from './NewsletterOverview';
import NewsletterAIGenerator from './NewsletterAIGenerator';
import NewsletterEditorLayout from './NewsletterEditorLayout';
import EnhancedNewsletterPreview from './newsletter/EnhancedNewsletterPreview';
import NewsletterQuickActions from './NewsletterQuickActions';

interface NewsletterFormData {
  subject: string;
  content: string;
  blogPostId?: string;
}

const NewsletterManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const { toast } = useToast();
  const { blogPosts, loading: blogPostsLoading } = useBlogPosts();
  const { subscriberCount, refetch: refetchSubscriberCount } = useNewsletterStats();
  
  const form = useForm<NewsletterFormData>({
    defaultValues: {
      subject: '',
      content: '',
      blogPostId: '',
    },
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsLoading(true);

    try {
      console.log('📧 Sending newsletter to all subscribers');
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
      refetchSubscriberCount();
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

  // Filter to only show published blog posts
  const publishedBlogPosts = blogPosts.filter(post => post.status === 'published');

  // Get current form values for preview
  const currentSubject = form.watch('subject');

  return (
    <div className="space-y-6">
      <NewsletterOverview subscriberCount={subscriberCount} />

      <NewsletterAIGenerator
        currentSubject={currentSubject}
        currentContent={content}
        onContentGenerated={handleContentGenerated}
      />

      <NewsletterEditorLayout
        form={form}
        content={content}
        setContent={setContent}
        onSubmit={onSubmit}
        isLoading={isLoading}
        subscriberCount={subscriberCount}
        blogPosts={publishedBlogPosts}
        blogPostsLoading={blogPostsLoading}
      />

      {/* Single Enhanced Newsletter Preview with Send Functionality */}
      <EnhancedNewsletterPreview
        subject={currentSubject}
        content={content}
      />

      <NewsletterQuickActions
        onGenerateBlogNewsletter={generateBlogNewsletter}
      />
    </div>
  );
};

export default NewsletterManager;
