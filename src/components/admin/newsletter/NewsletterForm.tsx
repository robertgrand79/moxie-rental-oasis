import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useNewsletterStats } from '@/hooks/useNewsletterStats';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Save, Loader2, X } from 'lucide-react';
import ReactQuillEditor from '../../ReactQuillEditor';

interface NewsletterFormData {
  subject: string;
  content: string;
  blogPostId?: string;
}

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  sent_at: string | null;
  recipient_count: number;
  blog_post_id: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsletterFormProps {
  newsletter?: Newsletter | null;
  onClose: () => void;
}

const NewsletterForm = ({ newsletter, onClose }: NewsletterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState(newsletter?.content || '');
  const { toast: showToast } = useToast();
  const { blogPosts, loading: blogPostsLoading } = useBlogPosts();
  const { subscriberCount, refetch: refetchSubscriberCount } = useNewsletterStats();
  
  const form = useForm<NewsletterFormData>({
    defaultValues: {
      subject: newsletter?.subject || '',
      content: newsletter?.content || '',
      blogPostId: newsletter?.blog_post_id || 'none',
    },
  });

  const currentSubject = form.watch('subject');
  const isFormValid = currentSubject?.trim() && content?.trim();
  const canSend = isFormValid && subscriberCount && subscriberCount > 0;
  const publishedBlogPosts = blogPosts.filter(post => post.status === 'published');
  const isEdit = !!newsletter;

  useEffect(() => {
    if (newsletter) {
      form.setValue('subject', newsletter.subject);
      form.setValue('content', newsletter.content);
      form.setValue('blogPostId', newsletter.blog_post_id || 'none');
      setContent(newsletter.content);
    }
  }, [newsletter, form]);

  const onSaveDraft = async (data: NewsletterFormData) => {
    if (!data.subject || !content) {
      showToast({
        title: "Missing Information",
        description: "Please provide both a subject and content for the newsletter.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const newsletterData = {
        subject: data.subject,
        content: content,
        blog_post_id: data.blogPostId === 'none' ? null : data.blogPostId,
        recipient_count: 0,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('newsletter_campaigns')
          .update(newsletterData)
          .eq('id', newsletter.id);
        
        if (error) throw error;
        
        showToast({
          title: "Newsletter Updated",
          description: "Your newsletter draft has been saved successfully.",
        });
      } else {
        const { error } = await supabase
          .from('newsletter_campaigns')
          .insert([newsletterData]);
        
        if (error) throw error;
        
        showToast({
          title: "Draft Saved",
          description: "Your newsletter draft has been saved successfully.",
        });
      }
      
      onClose();
    } catch (error: any) {
      showToast({
        title: "Save Failed",
        description: error.message || "Failed to save newsletter draft.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSendNewsletter = async (data: NewsletterFormData) => {
    if (!canSend) {
      showToast({
        title: "Cannot Send",
        description: "Please ensure all fields are filled and you have subscribers.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: result, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          subject: data.subject,
          content: content,
          blogPostId: data.blogPostId === 'none' ? undefined : data.blogPostId,
          campaignId: isEdit ? newsletter.id : undefined,
        }
      });

      if (error) throw error;

      if (result?.success) {
        showToast({
          title: "Newsletter Sent! 🎉",
          description: `Successfully sent to ${result.recipientCount} subscribers.`,
        });
        
        refetchSubscriberCount();
        onClose();
      } else {
        throw new Error(result?.error || "Failed to send newsletter");
      }
    } catch (error: any) {
      showToast({
        title: "Send Failed",
        description: error.message || "Failed to send newsletter.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {isEdit ? 'Edit Newsletter' : 'Create Newsletter'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6 pt-0 overflow-y-auto max-h-[85vh]">
          <Form {...form}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your newsletter subject..." 
                        {...field} 
                        disabled={isLoading || isSaving}
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="blogPostId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Blog Post (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      disabled={isLoading || isSaving}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            blogPostsLoading 
                              ? "Loading blog posts..." 
                              : publishedBlogPosts.length === 0 
                                ? "No published blog posts available"
                                : "Select a blog post (optional)"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {publishedBlogPosts.map((post) => (
                          <SelectItem key={post.id} value={post.slug}>
                            {post.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Newsletter Content</FormLabel>
                <ReactQuillEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your newsletter content here..."
                  className="min-h-[400px]"
                />
              </div>

              {/* Status alerts */}
              {!subscriberCount || subscriberCount === 0 ? (
                <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
                  <AlertDescription>
                    <strong>No Active Subscribers</strong> - You need at least one subscriber to send a newsletter.
                  </AlertDescription>
                </Alert>
              ) : !isFormValid ? (
                <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                  <AlertDescription>
                    <strong>Required Fields Missing</strong> - Please provide both a subject line and content.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                  <AlertDescription>
                    <strong>Ready to Send!</strong> - Your newsletter will be sent to {subscriberCount} subscribers.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline"
                  onClick={form.handleSubmit(onSaveDraft)}
                  disabled={!isFormValid || isSaving || isLoading}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={form.handleSubmit(onSendNewsletter)}
                  disabled={!canSend || isLoading || isSaving}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Newsletter
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterForm;