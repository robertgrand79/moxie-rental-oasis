import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIRevisionButtonProps {
  content: string;
  onRevise: (revisedContent: string) => void;
  disabled?: boolean;
}

const revisionOptions = [
  { id: 'professional', label: 'Make more professional', prompt: 'Revise this guest message to be more professional and formal while maintaining warmth and hospitality' },
  { id: 'friendly', label: 'Make friendlier', prompt: 'Make this message warmer and more personable, like talking to a friend while keeping it professional' },
  { id: 'concise', label: 'Make more concise', prompt: 'Shorten this message while keeping all essential information and maintaining a friendly tone' },
  { id: 'grammar', label: 'Fix grammar & spelling', prompt: 'Fix any grammar, spelling, or punctuation errors in this message while preserving the original tone and meaning' },
];

const AIRevisionButton = ({ content, onRevise, disabled }: AIRevisionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const { toast } = useToast();

  const handleRevision = async (prompt: string) => {
    if (!content.trim()) {
      toast({
        title: 'No content',
        description: 'Please write some message content first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: `${prompt}:\n\n${content}`,
          context: {
            category: 'guest-communication',
            field: 'message',
            currentContent: content,
          },
        },
      });

      if (error) throw error;

      if (data?.content) {
        onRevise(data.content);
        toast({
          title: 'Message revised',
          description: 'Your message has been updated with AI suggestions.',
        });
      }
    } catch (error) {
      console.error('AI revision error:', error);
      toast({
        title: 'Error',
        description: 'Failed to revise message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setCustomDialogOpen(false);
      setCustomInstructions('');
    }
  };

  const handleCustomRevision = () => {
    if (!customInstructions.trim()) {
      toast({
        title: 'No instructions',
        description: 'Please enter custom revision instructions.',
        variant: 'destructive',
      });
      return;
    }
    handleRevision(customInstructions);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled || isLoading}
            className="absolute bottom-2 right-2 h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover">
          {revisionOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => handleRevision(option.prompt)}
              disabled={isLoading}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCustomDialogOpen(true)} disabled={isLoading}>
            Custom revision...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Revision Instructions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Enter your custom instructions for revising the message..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomRevision} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Revising...
                </>
              ) : (
                'Revise Message'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIRevisionButton;
