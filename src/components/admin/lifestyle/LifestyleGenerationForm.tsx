
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';

interface LifestyleGenerationFormProps {
  onGenerate: (prompt: string, numberOfItems: number, focusArea: string) => void;
  isGenerating: boolean;
}

const LifestyleGenerationForm = ({
  onGenerate,
  isGenerating
}: LifestyleGenerationFormProps) => {
  const [prompt, setPrompt] = useState('');
  const [numberOfItems, setNumberOfItems] = useState(5);
  const [focusArea, setFocusArea] = useState('');

  const handleGenerate = () => {
    onGenerate(prompt, numberOfItems, focusArea);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="numberOfItems">Number of Items</Label>
          <Input
            id="numberOfItems"
            type="number"
            min="1"
            max="15"
            value={numberOfItems}
            onChange={(e) => setNumberOfItems(parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="focusArea">Focus Area (Optional)</Label>
          <Input
            id="focusArea"
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            placeholder="e.g., outdoor activities, cultural events, dining"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="prompt">Lifestyle Generation Prompt</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the types of lifestyle activities you want to generate for Eugene, Oregon..."
          rows={4}
        />
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating || !prompt.trim()}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Items...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate {numberOfItems} Lifestyle Items
          </>
        )}
      </Button>
    </div>
  );
};

export default LifestyleGenerationForm;
