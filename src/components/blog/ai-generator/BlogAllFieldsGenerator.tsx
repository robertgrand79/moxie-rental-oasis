
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

interface BlogAllFieldsGeneratorProps {
  onGenerateAllFields: (topicPrompt: string) => Promise<void>;
  isGeneratingAll: boolean;
  generationProgress: string;
}

const BlogAllFieldsGenerator = ({ 
  onGenerateAllFields, 
  isGeneratingAll, 
  generationProgress 
}: BlogAllFieldsGeneratorProps) => {
  const [topicPrompt, setTopicPrompt] = useState('');

  const handleGenerateAll = async () => {
    await onGenerateAllFields(topicPrompt);
    setTopicPrompt('');
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Generate Complete Blog Post</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="topic-prompt">Blog Topic</Label>
          <Input
            id="topic-prompt"
            value={topicPrompt}
            onChange={(e) => setTopicPrompt(e.target.value)}
            placeholder="e.g., Best coffee shops in the area, Local food scene, Nearby hiking trails"
            disabled={isGeneratingAll}
          />
        </div>
        
        <Button 
          onClick={handleGenerateAll}
          disabled={isGeneratingAll || !topicPrompt.trim()}
          className="w-full"
          size="lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isGeneratingAll ? generationProgress || "Generating..." : "Generate All Fields (Title + Excerpt + Content)"}
        </Button>
      </div>
    </div>
  );
};

export default BlogAllFieldsGenerator;
