import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, RefreshCw, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldName: string;
  fieldLabel: string;
  contextPrompt: string;
  currentValue?: string;
  onApply: (content: string) => void;
}

const AIContentModal = ({
  open,
  onOpenChange,
  fieldName,
  fieldLabel,
  contextPrompt,
  currentValue,
  onApply,
}: AIContentModalProps) => {
  const [notes, setNotes] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = `${contextPrompt}${notes ? `\n\nAdditional context/keywords from user: ${notes}` : ''}${currentValue ? `\n\nCurrent content for reference: ${currentValue}` : ''}`;

      const { data, error } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt,
          context: {
            category: 'settings',
            field: fieldName,
          },
        },
      });

      if (error) throw error;

      if (data?.content) {
        setGeneratedContent(data.content);
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate content',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onApply(generatedContent);
    onOpenChange(false);
    setGeneratedContent('');
    setNotes('');
    toast({
      title: 'Content Applied',
      description: `${fieldLabel} has been updated with AI-generated content.`,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setGeneratedContent('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate {fieldLabel}
          </DialogTitle>
          <DialogDescription>
            {contextPrompt}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add keywords, tone preferences, or specific requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
            variant="default"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {generatedContent && (
            <div className="space-y-3 pt-2">
              <Label>Generated Content</Label>
              <div className="p-4 bg-muted rounded-lg border">
                <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleApply}
                  className="flex-1"
                  variant="default"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Use This
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIContentModal;
