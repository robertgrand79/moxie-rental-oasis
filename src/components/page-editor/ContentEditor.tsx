
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Layout, Code, Eye, AlertTriangle } from 'lucide-react';
import ReactQuillEditor from '@/components/ReactQuillEditor';
import { PageBuilder } from '@/components/page-builder/PageBuilder';
import { detectContentType, shouldUseRichTextEditor, shouldUseVisualBuilder, ContentType } from '@/utils/contentTypeDetection';
import { convertHTMLToCraftJS, convertCraftJSToHTML } from '@/utils/htmlToCraftJS';
import SecureContentRenderer from '@/components/SecureContentRenderer';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  pageSlug?: string;
  pageTitle?: string;
}

const ContentEditor = ({ content, onChange, pageSlug, pageTitle }: ContentEditorProps) => {
  const [contentType, setContentType] = useState<ContentType>('html');
  const [activeTab, setActiveTab] = useState('rich-text');
  const [showFormatWarning, setShowFormatWarning] = useState(false);

  useEffect(() => {
    const detectedType = detectContentType(content);
    setContentType(detectedType);
    
    // Auto-select appropriate editor based on content type
    if (shouldUseRichTextEditor(detectedType)) {
      setActiveTab('rich-text');
    } else if (shouldUseVisualBuilder(detectedType)) {
      setActiveTab('visual');
    }
  }, [content]);

  const handleTabChange = (newTab: string) => {
    // Show warning when switching between incompatible formats
    if ((activeTab === 'visual' && newTab !== 'visual' && contentType === 'craftjs') ||
        (activeTab !== 'visual' && newTab === 'visual' && contentType === 'html')) {
      setShowFormatWarning(true);
    }
    setActiveTab(newTab);
  };

  const handleContentChange = (newContent: string) => {
    const newContentType = detectContentType(newContent);
    setContentType(newContentType);
    setShowFormatWarning(false);
    onChange(newContent);
  };

  const handleVisualBuilderChange = (newContent: string) => {
    // Visual builder always outputs CraftJS format
    setContentType('craftjs');
    setShowFormatWarning(false);
    onChange(newContent);
  };

  const getContentTypeBadge = () => {
    const variants: Record<ContentType, string> = {
      html: 'default',
      craftjs: 'secondary',
      markdown: 'outline',
      empty: 'destructive'
    };
    
    return (
      <Badge variant={variants[contentType] as any} className="ml-2">
        {contentType.toUpperCase()}
      </Badge>
    );
  };

  const getVisualBuilderContent = () => {
    if (contentType === 'craftjs') {
      return content;
    } else if (content && content.trim()) {
      // Convert HTML to CraftJS for the visual builder
      return convertHTMLToCraftJS(content);
    }
    return undefined;
  };

  const getPreviewContent = () => {
    if (!content || content.trim() === '') {
      return '<p class="text-muted-foreground italic">Your page content will appear here...</p>';
    }

    if (contentType === 'craftjs') {
      // Convert CraftJS to HTML for preview
      return convertCraftJSToHTML(content);
    } else {
      // Already HTML, return as-is
      return content;
    }
  };

  const PagePreview = () => (
    <div className="bg-card rounded-lg border min-h-96 p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">{pageTitle || 'Page Title'}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          {getContentTypeBadge()}
          <span>/{pageSlug || 'page-slug'}</span>
        </div>
      </div>
      <div className="prose max-w-none">
        <SecureContentRenderer content={getPreviewContent()} className="prose max-w-none" />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {showFormatWarning && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Switching between editors may change the content format. Visual Builder uses a different format than Rich Text Editor.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rich-text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Rich Text
          </TabsTrigger>
          <TabsTrigger value="html" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            HTML
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Visual Builder
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="rich-text" className="mt-4">
          <ReactQuillEditor
            content={contentType === 'craftjs' ? convertCraftJSToHTML(content) : content}
            onChange={handleContentChange}
            placeholder="Start writing your page content..."
            className="min-h-96"
          />
        </TabsContent>

        <TabsContent value="html" className="mt-4">
          <textarea
            value={contentType === 'craftjs' ? convertCraftJSToHTML(content) : content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Enter HTML content directly..."
            rows={20}
            className="w-full p-3 border rounded-lg font-mono text-sm"
          />
        </TabsContent>
        
        <TabsContent value="visual" className="mt-4">
          <div className="border rounded-lg h-96">
            <PageBuilder
              initialContent={getVisualBuilderContent()}
              onContentChange={handleVisualBuilderChange}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <PagePreview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentEditor;
