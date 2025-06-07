
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Sparkles, RefreshCw, Copy, Plus, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AISiteEditorProps {
  siteData: any;
  onUpdateSiteData: (data: any) => void;
}

const AISiteEditor = ({ siteData, onUpdateSiteData }: AISiteEditorProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [selectedField, setSelectedField] = useState('heroTitle');
  const [selectedCategory, setSelectedCategory] = useState('content');
  
  // Page creation states
  const [newPageName, setNewPageName] = useState('');
  const [newPageDescription, setNewPageDescription] = useState('');
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [generatedPageContent, setGeneratedPageContent] = useState('');
  
  const { toast } = useToast();

  const contentCategories = {
    content: {
      name: 'Content',
      fields: [
        { key: 'heroTitle', label: 'Hero Title', placeholder: 'Main headline for the homepage' },
        { key: 'heroSubtitle', label: 'Hero Subtitle', placeholder: 'Supporting text for the headline' },
        { key: 'description', label: 'Site Description', placeholder: 'Description of your business' },
        { key: 'tagline', label: 'Tagline', placeholder: 'Short, catchy phrase' },
      ]
    },
    contact: {
      name: 'Contact Information',
      fields: [
        { key: 'contactEmail', label: 'Contact Email', placeholder: 'Professional contact email' },
        { key: 'phone', label: 'Phone Number', placeholder: 'Business phone number' },
        { key: 'address', label: 'Address', placeholder: 'Business address' },
      ]
    },
    seo: {
      name: 'SEO & Marketing',
      fields: [
        { key: 'siteName', label: 'Site Name', placeholder: 'SEO-optimized site name' },
        { key: 'metaDescription', label: 'Meta Description', placeholder: 'SEO meta description' },
        { key: 'keywords', label: 'Keywords', placeholder: 'SEO keywords' },
      ]
    }
  };

  const promptSuggestions = {
    content: [
      "Write a compelling hero title for a luxury vacation rental business",
      "Create an engaging tagline for a premium property rental service",
      "Generate a professional description for a vacation rental company",
      "Write welcoming homepage content for a boutique rental business",
    ],
    contact: [
      "Generate a professional business address for a vacation rental company",
      "Create a welcoming contact email format for property inquiries",
      "Suggest a professional phone number format for customer service",
    ],
    seo: [
      "Create SEO-friendly meta description for vacation rental website",
      "Generate relevant keywords for vacation property rental business",
      "Write an SEO-optimized site name for luxury vacation rentals",
    ],
    pages: [
      "Create an About Us page for a vacation rental company",
      "Generate a Privacy Policy page content",
      "Write a Terms of Service page for vacation rentals",
      "Create a FAQ page for vacation rental guests",
      "Generate a Contact Us page with welcoming content",
    ]
  };

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: prompt,
          context: {
            businessType: 'vacation rental',
            currentContent: siteData,
            field: selectedField,
            category: selectedCategory
          }
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      
      toast({
        title: "Content Generated!",
        description: "AI has generated new content based on your prompt.",
      });
    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePage = async () => {
    if (!newPageName.trim() || !newPageDescription.trim()) {
      toast({
        title: "Page Details Required",
        description: "Please enter both page name and description.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPage(true);

    try {
      const pagePrompt = `Create a complete page content for "${newPageName}" with the following description: ${newPageDescription}. Include a title, subtitle, and main content that would be appropriate for a vacation rental website.`;
      
      const { data, error } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: pagePrompt,
          context: {
            businessType: 'vacation rental',
            currentContent: siteData,
            field: 'pageContent',
            category: 'pages'
          }
        }
      });

      if (error) throw error;

      setGeneratedPageContent(data.content);
      
      toast({
        title: "Page Content Generated!",
        description: `Content for "${newPageName}" has been generated.`,
      });
    } catch (error: any) {
      console.error('Page generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPage(false);
    }
  };

  const applyGeneratedContent = () => {
    if (!generatedContent) return;

    onUpdateSiteData({
      ...siteData,
      [selectedField]: generatedContent
    });

    toast({
      title: "Content Applied",
      description: `Updated ${contentCategories[selectedCategory]?.fields.find(f => f.key === selectedField)?.label}.`,
    });

    setGeneratedContent('');
    setPrompt('');
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  const useSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="h-5 w-5 mr-2" />
            AI Site Editor
          </CardTitle>
          <CardDescription>
            Use AI to generate compelling content for your website and create new pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="pages">
                <Plus className="h-4 w-4 mr-1" />
                Pages
              </TabsTrigger>
            </TabsList>

            {Object.entries(contentCategories).map(([categoryKey, category]) => (
              <TabsContent key={categoryKey} value={categoryKey} className="space-y-6">
                <div>
                  <Label>Content Field to Update</Label>
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="w-full p-2 border rounded-md mt-1"
                  >
                    {category.fields.map(field => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="prompt">AI Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what kind of content you want AI to generate..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={generateContent} 
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating..." : "Generate Content"}
                </Button>

                {generatedContent && (
                  <div className="space-y-4">
                    <div>
                      <Label>Generated Content</Label>
                      <div className="mt-1 p-4 border rounded-md bg-gray-50">
                        <p className="whitespace-pre-wrap">{generatedContent}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={applyGeneratedContent} className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Apply to Site
                      </Button>
                      <Button onClick={() => copyToClipboard(generatedContent)} variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Prompt Suggestions for {category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {promptSuggestions[categoryKey]?.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => useSuggestion(suggestion)}
                          className="w-full text-left justify-start h-auto p-3"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}

            <TabsContent value="pages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Create New Page
                  </CardTitle>
                  <CardDescription>
                    Generate complete page content for your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="pageName">Page Name</Label>
                    <Input
                      id="pageName"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      placeholder="e.g., About Us, Privacy Policy, FAQ"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pageDescription">Page Description</Label>
                    <Textarea
                      id="pageDescription"
                      value={newPageDescription}
                      onChange={(e) => setNewPageDescription(e.target.value)}
                      placeholder="Describe what this page should contain..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={generatePage} 
                    disabled={isCreatingPage || !newPageName.trim() || !newPageDescription.trim()}
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isCreatingPage ? "Generating Page..." : "Generate Page Content"}
                  </Button>

                  {generatedPageContent && (
                    <div className="space-y-4">
                      <div>
                        <Label>Generated Page Content</Label>
                        <div className="mt-1 p-4 border rounded-md bg-gray-50 max-h-96 overflow-y-auto">
                          <p className="whitespace-pre-wrap">{generatedPageContent}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={() => copyToClipboard(generatedPageContent)} className="flex-1">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Page Content
                        </Button>
                        <Button 
                          onClick={() => {
                            setGeneratedPageContent('');
                            setNewPageName('');
                            setNewPageDescription('');
                            toast({
                              title: "Page Content Cleared",
                              description: "Ready to create another page.",
                            });
                          }} 
                          variant="outline"
                        >
                          Clear & Start New
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Page Suggestions</CardTitle>
                  <CardDescription>
                    Click on any suggestion to use it as your page template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {promptSuggestions.pages?.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const pageName = suggestion.split(' for ')[0].replace('Create an ', '').replace('Create a ', '').replace('Generate a ', '').replace('Write a ', '');
                          setNewPageName(pageName);
                          setNewPageDescription(suggestion);
                        }}
                        className="w-full text-left justify-start h-auto p-3"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Content Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(contentCategories).map(([categoryKey, category]) => (
              <div key={categoryKey}>
                <h4 className="font-semibold text-lg mb-2">{category.name}</h4>
                <div className="grid gap-3">
                  {category.fields.map(field => (
                    <div key={field.key} className="p-3 border rounded">
                      <Label className="font-medium">{field.label}:</Label>
                      <p className="mt-1 text-sm text-gray-600">
                        {siteData[field.key] || `No ${field.label.toLowerCase()} set`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISiteEditor;
