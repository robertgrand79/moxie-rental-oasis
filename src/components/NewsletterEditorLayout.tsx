
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Eye, Edit3, Monitor, Palette } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { BlogPost } from '@/hooks/useBlogPosts';
import TiptapEditor from './TiptapEditor';
import EnhancedNewsletterPreview from './newsletter/EnhancedNewsletterPreview';

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
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Enhanced Newsletter Editor
            </CardTitle>
            <CardDescription>
              Create and preview your professionally designed newsletter with Moxie branding
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
              Design Preview
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
                    <p className="text-sm text-gray-600 mb-2">
                      Write your content - it will automatically be formatted with Moxie's professional design
                    </p>
                    <div className="mt-2">
                      <TiptapEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Write your newsletter content here... The AI will automatically format it with beautiful design, Moxie branding, and responsive layout."
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

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Palette className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Professional Design Applied</h4>
                        <p className="text-sm text-blue-800 mt-1">
                          Your content will automatically include Moxie's branding, responsive design, 
                          gradient headers, property showcases, and professional email formatting.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading || !subscriberCount}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? "Sending..." : `Send Designed Newsletter to ${subscriberCount || 0} Subscribers`}
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {/* Enhanced Preview Panel */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="min-h-[600px]">
              <EnhancedNewsletterPreview 
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
