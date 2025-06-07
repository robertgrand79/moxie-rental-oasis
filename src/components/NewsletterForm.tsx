
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Send } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
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
}

const NewsletterForm = ({ 
  form, 
  content, 
  setContent, 
  onSubmit, 
  isLoading, 
  subscriberCount 
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
                  <FormLabel>Blog Post ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Link to a specific blog post..." {...field} />
                  </FormControl>
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
