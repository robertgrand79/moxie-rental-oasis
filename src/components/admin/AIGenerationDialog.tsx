
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wand2, Loader2 } from 'lucide-react';
import { useAIContentGeneration } from '@/hooks/useAIContentGeneration';

interface AIGenerationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'poi' | 'events' | 'lifestyle';
  categories: { value: string; label: string }[];
  onContentGenerated: (content: any[]) => void;
}

const AIGenerationDialog: React.FC<AIGenerationDialogProps> = ({
  isOpen,
  onOpenChange,
  type,
  categories,
  onContentGenerated
}) => {
  const { generateContent, isGenerating } = useAIContentGeneration();
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState(categories[0]?.value || '');
  const [count, setCount] = useState(3);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const content = await generateContent(type, prompt, category, count);
    if (content) {
      onContentGenerated(content);
      onOpenChange(false);
      setPrompt('');
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'poi': return 'Points of Interest';
      case 'events': return 'Events';
      case 'lifestyle': return 'Lifestyle Content';
      default: return 'Content';
    }
  };

  const getPromptPlaceholder = () => {
    switch (type) {
      case 'poi': return 'e.g., Generate family-friendly restaurants with outdoor seating';
      case 'events': return 'e.g., Generate summer outdoor festivals in Eugene';
      case 'lifestyle': return 'e.g., Generate outdoor hiking and nature activities around Eugene';
      default: return 'Describe what you want to generate...';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate {getTypeLabel()} with AI</DialogTitle>
          <DialogDescription>
            Use AI to quickly generate {getTypeLabel().toLowerCase()} for Eugene, Oregon
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="ai-prompt">Description Prompt</Label>
            <Textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={getPromptPlaceholder()}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ai-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ai-count">Number to Generate</Label>
              <Input
                id="ai-count"
                type="number"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIGenerationDialog;
