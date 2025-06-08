
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Eye, Edit3, Monitor } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { BlogPost } from '@/hooks/useBlogPosts';
import TiptapEditor from './TiptapEditor';
import NewsletterVisualPreview from './NewsletterVisualPreview';

interface NewsletterFormData {
  subject: string;
  content: string;
  blogPostId?: string;
}

interface NewsletterEditorLayoutProps {
  form: UseFormReturn<NewsletterFormData>;
  content: string;
  setContent: (content: string) => void;
  onSubmit: (data: NewsletterFormData) => void;
  isLoading: boolean;
  subscriberCount: number | null;
  blogPosts: BlogPost[];
  blogPostsLoading: boolean;
}

const NewsletterEditorLayout = ({
  form,
  content,
  setContent,
  onSubmit,
  isLoading,
  subscriberCount,
  blogPosts,
  blogPostsLoading
}: NewsletterEditorLayoutProps) => {
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Newsletter Editor</CardTitle>
            <CardDescription>
              Create and preview your newsletter with our visual editor
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'editor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('editor')}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Editor
            </Button>
            <Button
              variant={viewMode === 'split' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('split')}
            >
              <Monitor className="h-4 w-4 mr-1" />
              Split
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-6 ${viewMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Editor Panel */}
          {(viewMode === 'editor' || viewMode === 'split') && (
            <div className="space-y-6">
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
                        className="min-h-[400px]"
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
            </div>
          )}

          {/* Preview Panel */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="min-h-[600px]">
              <NewsletterVisualPreview 
                subject={form.getValues('subject')}
                content={content}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterEditorLayout;
