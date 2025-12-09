
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Palette, AlertCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { BlogPost } from '@/hooks/useBlogPosts';
import ReactQuillEditor from '../ReactQuillEditor';

interface NewsletterFormData {
  subject: string;
  content: string;
  blogPostId?: string;
}

interface NewsletterEditorFormProps {
  form: UseFormReturn<NewsletterFormData>;
  content: string;
  setContent: (content: string) => void;
  onSubmit: (data: NewsletterFormData) => void;
  isLoading: boolean;
  subscriberCount: number | null;
  blogPosts: BlogPost[];
  blogPostsLoading: boolean;
}

const NewsletterEditorForm = ({
  form,
  content,
  setContent,
  onSubmit,
  isLoading,
  subscriberCount,
  blogPosts,
  blogPostsLoading
}: NewsletterEditorFormProps) => {
  const currentSubject = form.watch('subject');
  const isFormValid = currentSubject?.trim() && content?.trim() && subscriberCount && subscriberCount > 0;

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Subject *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your newsletter subject..." 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                  {field.value && field.value.length > 0 && (
                    <p className="text-xs text-gray-600">
                      Subject length: {field.value.length} characters
                    </p>
                  )}
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Newsletter Content *</FormLabel>
              <p className="text-sm text-gray-600 mb-3">
                Write your content - changes appear in the preview in real-time
              </p>
              <ReactQuillEditor
                content={content}
                onChange={setContent}
                placeholder="Write your newsletter content here... The preview will update automatically as you type."
                className="min-h-[400px]"
              />
              {content && content.trim().length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  Content length: {content.replace(/<[^>]*>/g, '').trim().length} characters
                </p>
              )}
            </div>

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
                            : blogPosts.length === 0 
                              ? "No published blog posts available"
                              : "Select a blog post (optional)"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {blogPosts.map((post) => (
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

            {/* Validation and Status Alerts */}
            {!subscriberCount || subscriberCount === 0 ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>No Active Subscribers</strong>
                  <br />
                  You need at least one active subscriber to send a newsletter. Check your subscriber list.
                </AlertDescription>
              </Alert>
            ) : !isFormValid ? (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Required Fields Missing</strong>
                  <br />
                  Please provide both a subject line and newsletter content before sending.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Ready to Send!</strong>
                  <br />
                  Your newsletter will be sent to {subscriberCount} active subscribers.
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <Palette className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Real-Time Preview</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    Your content automatically includes your branding and professional design. 
                    See the live preview as you type on the right.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={!isFormValid || isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Sending Newsletter..." : `Send Newsletter to ${subscriberCount || 0} Subscribers`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NewsletterEditorForm;
