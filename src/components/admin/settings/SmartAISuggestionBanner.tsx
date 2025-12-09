import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SmartAISuggestionBannerProps {
  localData: Record<string, string>;
  onApplyContent: (field: string, value: string) => void;
  onDismiss?: () => void;
}

// Fields that indicate "basic info" is filled
const BASIC_INFO_FIELDS = ['siteName', 'heroLocationText', 'address'];

// Fields that can be auto-generated
const GENERATABLE_FIELDS = [
  { key: 'tagline', label: 'Tagline', prompt: 'Generate a short, memorable tagline (under 10 words) for a vacation rental business' },
  { key: 'description', label: 'Site Description', prompt: 'Write a 2-3 sentence site description highlighting unique value' },
  { key: 'heroTitle', label: 'Hero Title', prompt: 'Create a powerful hero headline (5-8 words) that inspires wanderlust' },
  { key: 'heroSubtitle', label: 'Hero Subtitle', prompt: 'Write a supporting subtitle (10-15 words) that complements the main headline' },
  { key: 'heroDescription', label: 'Hero Description', prompt: 'Write 2-3 compelling sentences for the hero section' },
  { key: 'heroCTAText', label: 'Call to Action', prompt: 'Generate action-oriented CTA button text (2-4 words)' },
  { key: 'metaDescription', label: 'Meta Description', prompt: 'Write an SEO-optimized meta description under 160 characters' },
];

const SmartAISuggestionBanner = ({ localData, onApplyContent, onDismiss }: SmartAISuggestionBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

  // Check if basic info is filled
  const hasBasicInfo = useMemo(() => {
    const filledCount = BASIC_INFO_FIELDS.filter(field => 
      localData[field] && localData[field].trim().length > 2
    ).length;
    return filledCount >= 2; // At least 2 of 3 basic fields filled
  }, [localData]);

  // Get empty generatable fields
  const emptyFields = useMemo(() => {
    return GENERATABLE_FIELDS.filter(field => 
      !localData[field.key] || localData[field.key].trim().length === 0
    );
  }, [localData]);

  // Build context from filled fields
  const buildContext = () => {
    const context: Record<string, string> = {};
    if (localData.siteName) context.businessName = localData.siteName;
    if (localData.heroLocationText) context.location = localData.heroLocationText;
    if (localData.address) context.address = localData.address;
    if (localData.tagline) context.tagline = localData.tagline;
    if (localData.description) context.description = localData.description;
    return context;
  };

  const handleGenerateAll = async () => {
    if (emptyFields.length === 0) {
      toast({
        title: 'All fields filled',
        description: 'There are no empty fields to generate content for.',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedCount(0);

    const context = buildContext();
    const contextString = Object.entries(context)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    let successCount = 0;

    for (const field of emptyFields) {
      try {
        const fullPrompt = `${field.prompt}

Business Context:
${contextString}

Generate only the content, no explanations or formatting.`;

        const { data, error } = await supabase.functions.invoke('generate-site-content', {
          body: {
            prompt: fullPrompt,
            context: {
              category: 'settings',
              field: field.key,
            },
          },
        });

        if (error) throw error;

        if (data?.content) {
          onApplyContent(field.key, data.content.trim());
          successCount++;
          setGeneratedCount(successCount);
        }
      } catch (error) {
        console.error(`Failed to generate ${field.label}:`, error);
      }
    }

    setIsGenerating(false);

    if (successCount > 0) {
      toast({
        title: 'Content Generated!',
        description: `Successfully generated ${successCount} field${successCount > 1 ? 's' : ''}. Review and save your changes.`,
      });
      setDismissed(true);
    } else {
      toast({
        title: 'Generation Failed',
        description: 'Could not generate content. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  // Don't show if dismissed, no basic info, or no empty fields
  if (dismissed || !hasBasicInfo || emptyFields.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-6 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 shadow-sm">
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1">
            AI can help complete your site setup
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Based on your business details, we can auto-generate your {emptyFields.slice(0, 3).map(f => f.label.toLowerCase()).join(', ')}
            {emptyFields.length > 3 ? ` and ${emptyFields.length - 3} more fields` : ''}.
          </p>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerateAll}
              disabled={isGenerating}
              size="sm"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating {generatedCount}/{emptyFields.length}...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Yes, help me fill {emptyFields.length} field{emptyFields.length > 1 ? 's' : ''}
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              disabled={isGenerating}
            >
              No thanks
            </Button>
          </div>
        </div>

        {isGenerating && (
          <div className="flex-shrink-0 hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            {generatedCount} done
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAISuggestionBanner;
