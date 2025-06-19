
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, RefreshCw, Monitor, Smartphone } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { BlogPost } from '@/hooks/useBlogPosts';
import NewsletterEditorForm from './NewsletterEditorForm';
import NewsletterPreviewPanel from './NewsletterPreviewPanel';
import NewsletterEmailPreview from './NewsletterEmailPreview';

interface NewsletterFormData {
  subject: string;
  content: string;
  blogPostId?: string;
}

interface NewsletterEditorWithPreviewProps {
  form: UseFormReturn<NewsletterFormData>;
  content: string;
  setContent: (content: string) => void;
  onSubmit: (data: NewsletterFormData) => void;
  isLoading: boolean;
  subscriberCount: number | null;
  blogPosts: BlogPost[];
  blogPostsLoading: boolean;
}

const NewsletterEditorWithPreview = ({
  form,
  content,
  setContent,
  onSubmit,
  isLoading,
  subscriberCount,
  blogPosts,
  blogPostsLoading
}: NewsletterEditorWithPreviewProps) => {
  const [showPreview, setShowPreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('editor');

  const currentSubject = form.watch('subject');

  const handlePreviewSync = () => {
    // Force re-render of preview by updating a timestamp
    setContent(content + '');
  };

  return (
    <div className="space-y-6">
      {/* Editor Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Newsletter Editor</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              {showPreview && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewSync}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Preview
                  </Button>
                  <div className="flex gap-1 border rounded-md">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Editor Layout */}
      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* Editor Panel */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview-email">Email Preview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor">
              <NewsletterEditorForm
                form={form}
                content={content}
                setContent={setContent}
                onSubmit={onSubmit}
                isLoading={isLoading}
                subscriberCount={subscriberCount}
                blogPosts={blogPosts}
                blogPostsLoading={blogPostsLoading}
              />
            </TabsContent>

            <TabsContent value="preview-email">
              <NewsletterEmailPreview
                subject={currentSubject}
                content={content}
                disabled={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Live Preview</h4>
                    <p className="text-sm text-blue-700">
                      The preview automatically updates as you type. Use the sync button to force refresh if needed.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Email Preview</h4>
                    <p className="text-sm text-green-700">
                      Send a test email to yourself to see exactly what subscribers will receive.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Professional Design</h4>
                    <p className="text-sm text-purple-700">
                      Your newsletter includes Moxie branding, responsive design, and professional email formatting.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="sticky top-4">
            <NewsletterPreviewPanel
              subject={currentSubject}
              content={content}
              viewMode={previewMode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterEditorWithPreview;
