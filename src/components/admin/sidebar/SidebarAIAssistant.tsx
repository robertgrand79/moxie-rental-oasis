import React, { useState } from 'react';
import { Sparkles, Copy, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useContentForSocial, ContentType, contentTypeLabels } from '@/hooks/useContentForSocial';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Platform = 'instagram' | 'facebook' | 'twitter' | 'linkedin';

const platforms: { id: Platform; label: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'twitter', label: 'X', icon: '𝕏' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
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

export default function SidebarAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [contentId, setContentId] = useState<string>('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const { data: contentItems = [], isLoading: isLoadingContent } = useContentForSocial(contentType);

  const handleGenerate = async () => {
    if (!contentType || !contentId || !platform) {
      toast.error('Please select content type, item, and platform');
      return;
    }

    setIsGenerating(true);
    setGeneratedPost('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-social-post', {
        body: { contentType, contentId, platform },
      });

      if (error) throw error;

      if (data?.post) {
        setGeneratedPost(data.post);
        toast.success('Social post generated!');
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error generating social post:', error);
      toast.error('Failed to generate post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPost);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleContentTypeChange = (value: string) => {
    setContentType(value as ContentType);
    setContentId('');
    setGeneratedPost('');
  };

  return (
    <div className="border-t border-sidebar-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI Assistant</span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Generate social media posts from your content
            </p>

            {/* Content Type Selector */}
            <Select value={contentType || ''} onValueChange={handleContentTypeChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-xs">
                    {contentTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Content Item Selector */}
            <Select
              value={contentId}
              onValueChange={setContentId}
              disabled={!contentType || isLoadingContent}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={isLoadingContent ? 'Loading...' : 'Select item'} />
              </SelectTrigger>
              <SelectContent>
                {contentItems.map((item) => (
                  <SelectItem key={item.id} value={item.id} className="text-xs">
                    {item.title.length > 35 ? `${item.title.substring(0, 35)}...` : item.title}
                  </SelectItem>
                ))}
                {contentItems.length === 0 && !isLoadingContent && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    No items found
                  </div>
                )}
              </SelectContent>
            </Select>

            {/* Platform Chips */}
            <div className="flex flex-wrap gap-1.5">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md transition-colors',
                    platform === p.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!contentType || !contentId || isGenerating}
              className="w-full h-8 text-xs"
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  Generate Post
                </>
              )}
            </Button>

            {/* Generated Result */}
            {generatedPost && (
              <div className="relative">
                <div className="bg-muted/50 rounded-md p-2.5 text-xs max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {generatedPost}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
