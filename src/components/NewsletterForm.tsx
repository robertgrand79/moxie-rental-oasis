
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { BlogPost } from '@/hooks/useBlogPosts';
import TiptapEditor from './TiptapEditor';

interface NewsletterFormData {
  subject: string;
  content: string;
  blogPostId?: string;
}

interface NewsletterFormProps {
  form: UseFormReturn<NewsletterFormData>;
  content: string;
  setContent: (content: string) => void;
  onSubmit: (data: NewsletterFormData) => void;
  isLoading: boolean;
  subscriberCount: number | null;
  blogPosts: BlogPost[];
  blogPostsLoading: boolean;
}

const NewsletterForm = ({ 
  form, 
  content, 
  setContent, 
  onSubmit, 
  isLoading, 
  subscriberCount,
  blogPosts,
  blogPostsLoading
}: NewsletterFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Newsletter</CardTitle>
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
              <Label>Newsletter Content</Label>
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
                  <FormLabel>Link to Blog Post (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading || !subscriberCount}
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : `Send Newsletter to ${subscriberCount || 0} Subscribers`}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NewsletterForm;
