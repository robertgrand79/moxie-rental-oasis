import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useNewsletterStats } from '@/hooks/useNewsletterStats';
import NewsletterOverview from './NewsletterOverview';
import NewsletterAIGenerator from './NewsletterAIGenerator';
import NewsletterEditorLayout from './NewsletterEditorLayout';
import NewsletterQuickActions from './NewsletterQuickActions';
import NewsletterSMSCard from './NewsletterSMSCard';

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
    console.log('📧 Newsletter form submission started');
    console.log('Form data:', data);
    console.log('Content:', content);
    
    // Validate required fields on the frontend
    if (!data.subject || !content) {
      console.error('❌ Missing required fields:', { subject: !!data.subject, content: !!content });
      toast({
        title: "Missing Information",
        description: "Please provide both a subject and content for the newsletter.",
        variant: "destructive",
      });
      return;
    }

    if (data.subject.trim() === '' || content.trim() === '') {
      console.error('❌ Empty required fields:', { subjectEmpty: data.subject.trim() === '', contentEmpty: content.trim() === '' });
      toast({
        title: "Empty Fields",
        description: "Subject and content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!subscriberCount || subscriberCount === 0) {
      toast({
        title: "No Subscribers",
        description: "There are no active subscribers to send the newsletter to.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('📤 Sending newsletter to all subscribers');
      console.log('Payload being sent:', {
        subject: data.subject,
        content: content,
        blogPostId: data.blogPostId || undefined,
      });

      const { data: result, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          subject: data.subject,
          content: content,
          blogPostId: data.blogPostId || undefined,
        }
      });

      console.log('📧 Newsletter send response:', { result, error });

      if (error) {
        console.error('❌ Newsletter send error:', error);
        throw error;
      }

      if (result?.success) {
        toast({
          title: "Newsletter Sent! 🎉",
          description: `Successfully sent to ${result.recipientCount} subscribers.`,
        });
        
        form.reset();
        setContent('');
        refetchSubscriberCount();
      } else {
        throw new Error(result?.error || "Failed to send newsletter");
      }
    } catch (error: any) {
      console.error('❌ Newsletter send error:', error);
      
      let errorMessage = "Failed to send newsletter.";
      
      if (error.message?.includes("Missing required fields")) {
        errorMessage = "Please ensure both subject and content are provided.";
      } else if (error.message?.includes("No active subscribers")) {
        errorMessage = "There are no active subscribers to send to.";
      } else if (error.message?.includes("Resend")) {
        errorMessage = "Email delivery service error. Please check your configuration.";
      } else if (error.message?.includes("Admin access required")) {
        errorMessage = "You need administrator privileges to send newsletters.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Send Failed",
        description: errorMessage,
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

  return (
    <div className="space-y-6">
      <NewsletterOverview subscriberCount={subscriberCount} />

      <NewsletterAIGenerator
        currentSubject={form.watch('subject')}
        currentContent={content}
        onContentGenerated={handleContentGenerated}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <NewsletterSMSCard />
      </div>

      <NewsletterQuickActions
        onGenerateBlogNewsletter={generateBlogNewsletter}
      />
    </div>
  );
};

export default NewsletterManager;
