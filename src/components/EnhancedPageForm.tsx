
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { PageBuilder } from './page-builder/PageBuilder';
import TiptapEditor from './TiptapEditor';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, Layout, Code } from 'lucide-react';

interface EnhancedPageFormProps {
  page?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const EnhancedPageForm = ({ page, onSubmit, onCancel }: EnhancedPageFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    meta_description: '',
    is_published: false
  });

  const [activeTab, setActiveTab] = useState('rich-text');

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        content: page.content || '',
        meta_description: page.meta_description || '',
        is_published: page.is_published || false
      });
    }
  }, [page]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !page ? generateSlug(title) : prev.slug
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Page title is required.',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.slug.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Page slug is required.',
        variant: 'destructive'
      });
      return;
    }

    onSubmit(formData);
  };

  const PagePreview = () => (
    <div className="bg-white rounded-lg border min-h-96 p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.title || 'Page Title'}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Badge variant={formData.is_published ? 'default' : 'secondary'}>
            {formData.is_published ? 'Published' : 'Draft'}
          </Badge>
          <span>/{formData.slug || 'page-slug'}</span>
        </div>
      </div>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: formData.content || '<p>Your page content will appear here...</p>' 
        }}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {page ? 'Edit Page' : 'Create New Page'}
        </CardTitle>
        <CardDescription>
          {page ? 'Update the page details and content below.' : 'Create a new page with rich content and preview capabilities.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter page title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="page-url-slug"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Input
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
              placeholder="Brief description for SEO (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Page Content</Label>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="rich-text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Rich Text
                </TabsTrigger>
                <TabsTrigger value="visual" className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Visual Builder
                </TabsTrigger>
                <TabsTrigger value="html" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="rich-text" className="mt-4">
                <TiptapEditor
                  content={formData.content}
                  onChange={handleContentChange}
                  placeholder="Start writing your page content..."
                  className="min-h-96"
                />
              </TabsContent>
              
              <TabsContent value="visual" className="mt-4">
                <div className="border rounded-lg h-96">
                  <PageBuilder
                    initialContent={formData.content}
                    onContentChange={handleContentChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="html" className="mt-4">
                <textarea
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Enter HTML content directly..."
                  rows={20}
                  className="w-full p-3 border rounded-lg font-mono text-sm"
                />
              </TabsContent>
              
              <TabsContent value="preview" className="mt-4">
                <PagePreview />
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
            />
            <Label htmlFor="is_published">Publish immediately</Label>
          </div>

          <div className="flex space-x-4">
            <Button type="submit" className="bg-gradient-to-r from-gradient-from to-gradient-accent-from hover:from-gradient-from/90 hover:to-gradient-accent-from/90">
              {page ? 'Update Page' : 'Create Page'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedPageForm;
