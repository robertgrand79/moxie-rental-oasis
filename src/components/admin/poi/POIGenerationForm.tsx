
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';

interface POIGenerationFormProps {
  onGenerate: (prompt: string, numberOfItems: number, category: string) => void;
  isGenerating: boolean;
  categories: string[];
}

const POIGenerationForm = ({
  onGenerate,
  isGenerating,
  categories
}: POIGenerationFormProps) => {
  const [prompt, setPrompt] = useState('');
  const [numberOfItems, setNumberOfItems] = useState(5);
  const [category, setCategory] = useState('all');

  const handleGenerate = () => {
    // Convert "all" back to empty string for the generation logic
    const categoryValue = category === 'all' ? '' : category;
    onGenerate(prompt, numberOfItems, categoryValue);
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
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="prompt">POI Generation Prompt</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the types of points of interest you want to generate for Eugene, Oregon..."
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
            Generate {numberOfItems} POI Items
          </>
        )}
      </Button>
    </div>
  );
};

export default POIGenerationForm;
