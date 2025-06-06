
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Send, Users, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import TiptapEditor from './TiptapEditor';

interface NewsletterForm {
  subject: string;
  content: string;
  blogPostId?: string;
}

const NewsletterManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const { toast } = useToast();
  
  const form = useForm<NewsletterForm>({
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

  const onSubmit = async (data: NewsletterForm) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Newsletter Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-sm text-gray-600">Active Subscribers: </span>
              <span className="font-semibold">{subscriberCount ?? 'Loading...'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Newsletter</CardTitle>
          <CardDescription>
            Create and send a newsletter to all active subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Your newsletter subject..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Newsletter Content</FormLabel>
                <div className="mt-2">
                  <TiptapEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Write your newsletter content here..."
                    className="min-h-[300px]"
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="blogPostId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blog Post ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Link to a specific blog post..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || !subscriberCount}
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : `Send Newsletter to ${subscriberCount || 0} Subscribers`}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            Generate newsletter content from recent blog posts:
          </div>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => generateBlogNewsletter(
                "Top 5 Vacation Destinations for 2024",
                "Discover the most sought-after vacation spots that offer unforgettable experiences and luxury accommodations.",
                "top-5-vacation-destinations-2024"
              )}
            >
              Use "Top 5 Vacation Destinations" Post
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => generateBlogNewsletter(
                "Making the Most of Your Vacation Rental Experience",
                "Essential tips and tricks to ensure your vacation rental stay exceeds all expectations.",
                "making-most-vacation-rental-experience"
              )}
            >
              Use "Vacation Rental Experience" Post
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterManager;
