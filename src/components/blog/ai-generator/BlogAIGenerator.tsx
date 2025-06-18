
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenTool } from 'lucide-react';
import { blogTemplates, blogQuickPrompts } from './BlogTemplates';
import BlogTemplateSelector from './BlogTemplateSelector';
import BlogQuickPrompts from './BlogQuickPrompts';
import BlogCustomPromptInput from './BlogCustomPromptInput';
import BlogGeneratedContentDisplay from './BlogGeneratedContentDisplay';
import { useBlogAIGeneration } from './useBlogAIGeneration';

interface BlogAIGeneratorProps {
  currentTitle: string;
  currentExcerpt: string;
  currentContent: string;
  onContentGenerated: (field: 'title' | 'excerpt' | 'content', content: string) => void;
}

const BlogAIGenerator = ({ 
  currentTitle, 
  currentExcerpt,
  currentContent, 
  onContentGenerated 
}: BlogAIGeneratorProps) => {
  const [activeTab, setActiveTab] = useState('templates');

  const {
    isGenerating,
    aiPrompt,
    setAiPrompt,
    selectedField,
    setSelectedField,
    generatedContent,
    setGeneratedContent,
    generateContent,
    applyGeneratedContent
  } = useBlogAIGeneration({
    currentTitle,
    currentExcerpt,
    currentContent,
    onContentGenerated
  });

  const useTemplate = async (template: any) => {
    setAiPrompt(template.prompt);
    setSelectedField('content');
    await generateContent(template.prompt);
  };

  const useQuickPrompt = async (prompt: string) => {
    setAiPrompt(prompt);
    await generateContent(prompt);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PenTool className="h-5 w-5 mr-2" />
          Content Assistant
        </CardTitle>
        <CardDescription>
          Get help with specific parts of your blog post using AI-powered templates and suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Content Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Professional Content Templates</p>
                <p className="text-sm text-gray-600 mt-1">Choose from expert-crafted content templates to enhance your blog post</p>
              </div>
              
              <BlogTemplateSelector
                templates={blogTemplates}
                onTemplateSelect={useTemplate}
                isGenerating={isGenerating}
              />
              
              <BlogQuickPrompts
                prompts={blogQuickPrompts}
                onPromptSelect={useQuickPrompt}
                isGenerating={isGenerating}
              />
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <BlogCustomPromptInput
              selectedField={selectedField}
              onFieldChange={setSelectedField}
              aiPrompt={aiPrompt}
              onPromptChange={setAiPrompt}
              onGenerate={() => generateContent()}
              isGenerating={isGenerating}
            />
          </TabsContent>
        </Tabs>

        <BlogGeneratedContentDisplay
          generatedContent={generatedContent}
          selectedField={selectedField}
          onApply={applyGeneratedContent}
          onClear={() => setGeneratedContent('')}
        />
      </CardContent>
    </Card>
  );
};

export default BlogAIGenerator;
