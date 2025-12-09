import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, Linkedin, Sparkles, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useContentForSocial, ContentType, contentTypeLabels } from '@/hooks/useContentForSocial';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', limit: 2200 },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', limit: 63206 },
  { id: 'x', name: 'X', icon: Twitter, color: 'text-foreground', limit: 280 },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', limit: 3000 },
];

const contentTypes: ContentType[] = [
  'blog_post',
  'newsletter',
  'property',
  'point_of_interest',
  'lifestyle_gallery',
  'testimonial',
  'event'
];

const SocialMediaTab = () => {
  const [selectedContentType, setSelectedContentType] = useState<ContentType | ''>('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: contentItems, isLoading: loadingItems } = useContentForSocial(
    selectedContentType as ContentType
  );

  const handleGenerate = async () => {
    if (!selectedContentType || !selectedItemId || !selectedPlatform) {
      toast({
        title: 'Missing selection',
        description: 'Please select content type, item, and platform',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const selectedItem = contentItems?.find(item => item.id === selectedItemId);
      const platform = platforms.find(p => p.id === selectedPlatform);

      const { data, error } = await supabase.functions.invoke('generate-social-post', {
        body: {
          contentType: selectedContentType,
          contentTitle: selectedItem?.title || '',
          contentId: selectedItemId,
          platform: selectedPlatform,
          characterLimit: platform?.limit || 280
        }
      });

      if (error) throw error;
      setGeneratedPost(data.post || '');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Could not generate post',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    toast({ title: 'Copied to clipboard!' });
  };

  const currentPlatform = platforms.find(p => p.id === selectedPlatform);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Selection */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Content Type</Label>
          <Select value={selectedContentType} onValueChange={(v) => {
            setSelectedContentType(v as ContentType);
            setSelectedItemId('');
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              {contentTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {contentTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Select Item</Label>
          <Select value={selectedItemId} onValueChange={setSelectedItemId} disabled={!selectedContentType || loadingItems}>
            <SelectTrigger>
              <SelectValue placeholder={loadingItems ? 'Loading...' : 'Select item'} />
            </SelectTrigger>
            <SelectContent>
              {contentItems?.map(item => (
                <SelectItem key={item.id} value={item.id}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Platform</Label>
          <div className="grid grid-cols-2 gap-3">
            {platforms.map(platform => {
              const Icon = platform.icon;
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    selectedPlatform === platform.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${platform.color}`} />
                  <span className="text-sm font-medium">{platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!selectedContentType || !selectedItemId || !selectedPlatform || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Post
            </>
          )}
        </Button>
      </div>

      {/* Right: Output */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Generated Post</Label>
          {generatedPost && currentPlatform && (
            <span className={`text-xs ${
              generatedPost.length > currentPlatform.limit ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {generatedPost.length} / {currentPlatform.limit}
            </span>
          )}
        </div>

        <Textarea
          value={generatedPost}
          onChange={(e) => setGeneratedPost(e.target.value)}
          placeholder="Your generated post will appear here..."
          className="min-h-[250px] resize-none"
        />

        {generatedPost && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleGenerate} disabled={isGenerating} className="flex-1">
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaTab;
