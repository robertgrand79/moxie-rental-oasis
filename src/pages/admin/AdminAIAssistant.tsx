import React, { useState } from 'react';
import { Copy, RefreshCw, Sparkles, Instagram, Facebook, Linkedin } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useContentForSocial, ContentType, contentTypeLabels } from '@/hooks/useContentForSocial';
import { cn } from '@/lib/utils';

type Platform = 'instagram' | 'facebook' | 'x' | 'linkedin';

const platforms: { id: Platform; label: string; icon: React.ReactNode; maxChars: number }[] = [
  { id: 'instagram', label: 'Instagram', icon: <Instagram className="h-5 w-5" />, maxChars: 2200 },
  { id: 'facebook', label: 'Facebook', icon: <Facebook className="h-5 w-5" />, maxChars: 63206 },
  { id: 'x', label: 'X (Twitter)', icon: <span className="font-bold text-lg">𝕏</span>, maxChars: 280 },
  { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-5 w-5" />, maxChars: 3000 },
];

const contentTypes: ContentType[] = [
  'blog_post',
  'newsletter',
  'property',
  'point_of_interest',
  'lifestyle_gallery',
  'testimonial',
  'event',
];

const AdminAIAssistant = () => {
  const { toast } = useToast();
  const [contentType, setContentType] = useState<ContentType | ''>('');
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('instagram');
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: contentItems = [], isLoading: isLoadingContent } = useContentForSocial(contentType || undefined);

  const handleGenerate = async () => {
    if (!contentType || !selectedContentId || !selectedPlatform) {
      toast({
        title: 'Missing selection',
        description: 'Please select content type, item, and platform.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedPost('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-social-post', {
        body: {
          contentType,
          contentId: selectedContentId,
          platform: selectedPlatform,
        },
      });

      if (error) throw error;

      if (data?.post) {
        setGeneratedPost(data.post);
        toast({
          title: 'Post generated',
          description: 'Your social media post is ready!',
        });
      } else {
        throw new Error('No post returned from AI');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPost);
      toast({
        title: 'Copied!',
        description: 'Post copied to clipboard.',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);
  const charCount = generatedPost.length;
  const maxChars = selectedPlatformData?.maxChars || 0;

  return (
    <AdminPageWrapper
      title="AI Assistant"
      description="Generate social media posts from your content using AI"
    >
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Content Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Content</CardTitle>
              <CardDescription>Choose the content you want to promote</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Content Type</label>
                <Select
                  value={contentType}
                  onValueChange={(value: ContentType) => {
                    setContentType(value);
                    setSelectedContentId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {contentTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content Item */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Item</label>
                <Select
                  value={selectedContentId}
                  onValueChange={setSelectedContentId}
                  disabled={!contentType || isLoadingContent}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingContent ? 'Loading...' : 'Select an item'} />
                  </SelectTrigger>
                  <SelectContent>
                    {contentItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                        selectedPlatform === platform.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground/50'
                      )}
                    >
                      {platform.icon}
                      <span className="font-medium">{platform.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!contentType || !selectedContentId || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Social Post
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Right Column - Generated Output */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generated Post</CardTitle>
              <CardDescription>
                {selectedPlatformData 
                  ? `Optimized for ${selectedPlatformData.label}` 
                  : 'Your AI-generated post will appear here'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={generatedPost}
                onChange={(e) => setGeneratedPost(e.target.value)}
                placeholder="Your generated social media post will appear here..."
                className="min-h-[300px] resize-none"
                readOnly={isGenerating}
              />

              {generatedPost && (
                <>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {charCount} / {maxChars.toLocaleString()} characters
                    </span>
                    {charCount > maxChars && (
                      <span className="text-destructive font-medium">
                        Exceeds limit by {(charCount - maxChars).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleCopy} variant="outline" className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      variant="outline"
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      <RefreshCw className={cn('h-4 w-4 mr-2', isGenerating && 'animate-spin')} />
                      Regenerate
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminAIAssistant;
