import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useNewsletterStats } from '@/hooks/useNewsletterStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Eye, EyeOff, Wand2, Users, Loader2, Maximize2, RotateCcw } from 'lucide-react';
import ReactQuillEditor from '../ReactQuillEditor';
import NewsletterPreviewPanel from './NewsletterPreviewPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import NewsletterAIGenerator from './ai-generator/NewsletterAIGenerator';
import TestEmailPanel from '@/components/admin/newsletter/TestEmailPanel';
import { toast } from 'sonner';

interface NewsletterFormData {
  subject: string;
  content: string;
  blogPostId?: string;
}

const StreamlinedNewsletterEditor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showFullPagePreview, setShowFullPagePreview] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const { toast: showToast } = useToast();
  const { blogPosts, loading: blogPostsLoading } = useBlogPosts();
  const { subscriberCount, refetch: refetchSubscriberCount } = useNewsletterStats();
  
  const form = useForm<NewsletterFormData>({
    defaultValues: {
      subject: '',
      content: '',
      blogPostId: '',
    },
  });

  const currentSubject = form.watch('subject');
  const isFormValid = currentSubject?.trim() && content?.trim() && subscriberCount && subscriberCount > 0;
  const publishedBlogPosts = blogPosts.filter(post => post.status === 'published');

  // Reset function for navigation
  const resetToDefaultState = () => {
    form.reset();
    setContent('');
    setShowPreview(false);
    setShowFullPagePreview(false);
    setShowAIDialog(false);
    setIsLoading(false);
    toast('Newsletter editor reset to clean state');
  };

  // Listen for reset events from navigation
  useEffect(() => {
    window.addEventListener('resetNewsletterTabs', resetToDefaultState);
    return () => window.removeEventListener('resetNewsletterTabs', resetToDefaultState);
  }, [form]);

  const onSubmit = async (data: NewsletterFormData) => {
    if (!data.subject || !content) {
      showToast({
        title: "Missing Information",
        description: "Please provide both a subject and content for the newsletter.",
        variant: "destructive",
      });
      return;
    }

    if (!subscriberCount || subscriberCount === 0) {
      showToast({
        title: "No Subscribers",
        description: "There are no active subscribers to send the newsletter to.",
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
          blogPostId: data.blogPostId || undefined,
        }
      });

      if (error) throw error;

      if (result?.success) {
        showToast({
          title: "Newsletter Sent! 🎉",
          description: `Successfully sent to ${result.recipientCount} subscribers.`,
        });
        
        form.reset();
        setContent('');
        refetchSubscriberCount();
      } else {
        throw new Error(result?.error || "Failed to send newsletter");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      showToast({
        title: "Send Failed",
        description: err.message || "Failed to send newsletter.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentGenerated = (field: 'subject' | 'content', generatedContent: string) => {
    if (field === 'content') {
      setContent(generatedContent);
    } else {
      form.setValue('subject', generatedContent);
    }
    setShowAIDialog(false);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      showToast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!currentSubject || !content) {
      showToast({
        title: "Missing Content",
        description: "Please provide both a subject and content before sending a test.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);

    try {
      const { data: result, error } = await supabase.functions.invoke('send-newsletter-preview', {
        body: {
          testEmail: testEmail,
          subject: currentSubject,
          content: content,
        }
      });

      if (error) throw error;

      if (result?.success) {
        showToast({
          title: "Test Email Sent! ✉️",
          description: `Preview sent successfully to ${testEmail}`,
        });
        setTestEmail('');
      } else {
        throw new Error(result?.error || "Failed to send test email");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error sending test email:', err);
      showToast({
        title: "Send Failed",
        description: err.message || "Failed to send test email.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with stats and actions */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Create Newsletter</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{subscriberCount || 0} subscribers</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Wand2 className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI Newsletter Generator</DialogTitle>
              </DialogHeader>
              <NewsletterAIGenerator
                currentSubject={currentSubject}
                currentContent={content}
                onContentGenerated={handleContentGenerated}
              />
            </DialogContent>
          </Dialog>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Side Preview'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullPagePreview(true)}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Preview
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaultState}
            title="Reset editor to clean state"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main editor layout */}
      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Newsletter Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Line</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your newsletter subject..." 
                          value={field.value}
                          onChange={field.onChange}
                          onValueChange={field.onChange}
                          disabled={isLoading}
                          className="text-base"
                          enableAI={true}
                          aiLabel="Subject Line"
                          aiPrompt="Generate an engaging email subject line for a newsletter that will increase open rates. Keep it concise (50 characters max), compelling, and create curiosity."
                          aiTooltip="Generate subject with AI"
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
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
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

                {/* Status alert */}
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

                {/* Test Email Section */}
                {currentSubject?.trim() && content?.trim() && (
                  <TestEmailPanel
                    testEmail={testEmail}
                    setTestEmail={setTestEmail}
                    onSendTest={handleSendTestEmail}
                    isSending={isSendingTest}
                    disabled={isLoading}
                  />
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base"
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Newsletter...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Newsletter to {subscriberCount || 0} Subscribers
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Preview */}
        {showPreview && (
          <div className="sticky top-6">
            <NewsletterPreviewPanel
              subject={currentSubject}
              content={content}
              viewMode="desktop"
            />
          </div>
        )}
      </div>

      {/* Full Page Preview Dialog */}
      <Dialog open={showFullPagePreview} onOpenChange={setShowFullPagePreview}>
        <DialogContent className="max-w-6xl max-h-[95vh] w-[95vw] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Maximize2 className="h-5 w-5" />
              Full Newsletter Preview
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0 overflow-y-auto max-h-[85vh]">
            <NewsletterPreviewPanel
              subject={currentSubject}
              content={content}
              viewMode="desktop"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StreamlinedNewsletterEditor;