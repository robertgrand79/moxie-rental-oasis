import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { useNewsletterStats } from '@/hooks/useNewsletterStats';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Save, Loader2, Plus } from 'lucide-react';
import ReactQuillEditor from '../../ReactQuillEditor';
import ContentPicker, { SelectedContent } from './ContentPicker';
import { generateContentTemplate } from './ContentTemplateGenerator';
import { BlogPost } from '@/types/blogPost';
import { EugeneEvent } from '@/hooks/useEugeneEvents';
import { Place } from '@/hooks/usePlaces';

interface NewsletterFormData {
  subject: string;
  content: string;
  cover_image_url?: string;
  linked_content?: SelectedContent;
}

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  cover_image_url?: string;
  sent_at: string | null;
  recipient_count: number;
  blog_post_id: string | null;
  linked_content?: SelectedContent;
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
  const [showContentPicker, setShowContentPicker] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState(newsletter?.cover_image_url || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SelectedContent>(() => {
    if (newsletter?.linked_content) {
      const content = newsletter.linked_content as any;
      return {
        blog_posts: content.blog_posts || [],
        events: content.events || [],
        places: content.places || []
      };
    }
    return { blog_posts: [], events: [], places: [] };
  });
  const { toast: showToast } = useToast();
  const { subscriberCount, refetch: refetchSubscriberCount } = useNewsletterStats();
  
  const form = useForm<NewsletterFormData>({
    defaultValues: {
      subject: newsletter?.subject || '',
      content: newsletter?.content || '',
      cover_image_url: newsletter?.cover_image_url || '',
      linked_content: newsletter?.linked_content || { blog_posts: [], events: [], places: [] },
    },
  });

  const currentSubject = form.watch('subject');
  const isFormValid = currentSubject?.trim() && content?.trim();
  const canSend = isFormValid && subscriberCount && subscriberCount > 0;
  const isEdit = !!newsletter;

  useEffect(() => {
    if (newsletter) {
      form.setValue('subject', newsletter.subject);
      form.setValue('content', newsletter.content);
      setContent(newsletter.content);
      
      if (newsletter.linked_content) {
        const content = newsletter.linked_content as any;
        const parsedContent = {
          blog_posts: content.blog_posts || [],
          events: content.events || [],
          places: content.places || []
        };
        form.setValue('linked_content', parsedContent);
        setSelectedContent(parsedContent);
      }
    }
  }, [newsletter, form]);

  const onSaveDraft = async (data: NewsletterFormData) => {
    console.log('🔄 Save draft called with data:', data);
    console.log('🔄 Current content:', content);
    console.log('🔄 Current selectedContent:', selectedContent);
    
    if (!data.subject || !content) {
      console.warn('⚠️ Missing required fields for save draft');
      showToast({
        title: "Missing Information",
        description: "Please provide both a subject and content for the newsletter.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    console.log('🔄 Starting save draft process...');

    try {
      const newsletterData = {
        subject: data.subject,
        content: content,
        linked_content: JSON.parse(JSON.stringify(selectedContent)),
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
          linkedContent: selectedContent,
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

  const handleContentImport = (contentType: 'blog_posts' | 'events' | 'places', items: (BlogPost | EugeneEvent | Place)[]) => {
    const template = generateContentTemplate(contentType, items);
    const currentContent = content || '';
    const newContent = currentContent + (currentContent ? '\n\n' : '') + template;
    setContent(newContent);
    
    showToast({
      title: "Content Imported",
      description: `${items.length} ${contentType.replace('_', ' ')} imported to newsletter.`,
    });
  };

  const getTotalSelectedItems = () => {
    return selectedContent.blog_posts.length + selectedContent.events.length + selectedContent.places.length;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] p-0">
        <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">
              {isEdit ? 'Edit Newsletter' : 'Create Newsletter'}
            </DialogTitle>
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Content Library</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowContentPicker(!showContentPicker)}
                    disabled={isLoading || isSaving}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content ({getTotalSelectedItems()})
                  </Button>
                </div>
                
                {showContentPicker && (
                  <ContentPicker
                    selectedContent={selectedContent}
                    onContentChange={setSelectedContent}
                    onImportContent={handleContentImport}
                  />
                )}
              </div>

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