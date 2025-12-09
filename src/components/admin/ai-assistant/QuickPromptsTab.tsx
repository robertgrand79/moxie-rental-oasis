import React, { useState } from 'react';
import { MessageSquare, Home, Megaphone, ClipboardList, Send, ArrowLeft, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PromptCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  prompts: { title: string; prompt: string }[];
}

const categories: PromptCategory[] = [
  {
    id: 'guest',
    name: 'Guest Communication',
    icon: MessageSquare,
    prompts: [
      { title: 'Welcome Message', prompt: 'Write a warm, friendly welcome message for guests checking into a vacation rental. Include check-in time (4 PM), WiFi info placeholder, and local tips.' },
      { title: 'Check-out Instructions', prompt: 'Write clear and friendly check-out instructions for guests. Include 11 AM checkout time, key return process, and thank you message.' },
      { title: 'Late Check-out Response', prompt: 'Draft a polite response to a guest requesting late check-out. Be helpful but explain availability depends on next booking.' },
      { title: 'Review Response', prompt: 'Write a professional thank you response to a positive guest review. Keep it warm and personal.' },
    ]
  },
  {
    id: 'property',
    name: 'Property Content',
    icon: Home,
    prompts: [
      { title: 'Property Description', prompt: 'Write a compelling vacation rental property description. Highlight comfort, location, and unique features. Make it inviting and descriptive.' },
      { title: 'Amenity Highlights', prompt: 'Create an engaging amenities section for a vacation rental listing. Organize by category (kitchen, entertainment, outdoor, etc.).' },
      { title: 'Neighborhood Guide', prompt: 'Write a neighborhood guide for vacation rental guests. Include nearby restaurants, attractions, and local tips.' },
      { title: 'House Rules', prompt: 'Write clear but friendly house rules for a vacation rental. Cover noise, pets, smoking, and guest policies.' },
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: Megaphone,
    prompts: [
      { title: 'Holiday Promotion', prompt: 'Write promotional copy for a holiday special offer on vacation rentals. Create urgency while staying professional.' },
      { title: 'Last-Minute Deal', prompt: 'Create marketing copy for a last-minute booking discount. Emphasize the value and limited availability.' },
      { title: 'New Amenity Announcement', prompt: 'Draft an announcement for new amenities added to a vacation rental. Make it exciting and highlight guest benefits.' },
      { title: 'Email Newsletter', prompt: 'Write engaging newsletter content for vacation rental subscribers. Include seasonal highlights and booking reminders.' },
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: ClipboardList,
    prompts: [
      { title: 'Cleaning Checklist', prompt: 'Generate a detailed cleaning checklist for vacation rental turnover. Cover all rooms and include often-missed items.' },
      { title: 'Maintenance Report', prompt: 'Create a template for maintenance inspection notes. Include categories for HVAC, plumbing, appliances, and exterior.' },
      { title: 'Contractor Instructions', prompt: 'Write clear work order instructions for a contractor. Include access info, scope of work, and completion requirements.' },
      { title: 'Inventory List', prompt: 'Create a comprehensive inventory checklist for a vacation rental. Include kitchen, linens, and amenity supplies.' },
    ]
  },
];

const QuickPromptsTab = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<{ title: string; prompt: string } | null>(null);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePromptSelect = async (prompt: { title: string; prompt: string }) => {
    setSelectedPrompt(prompt);
    setResponse('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: prompt.prompt,
          conversationHistory: []
        }
      });

      if (error) throw error;
      setResponse(data.aiResponse || 'Sorry, I could not generate a response.');
    } catch (error: any) {
      console.error('Prompt error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate response',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    toast({ title: 'Copied to clipboard!' });
  };

  if (selectedPrompt) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPrompt(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span className="font-medium">{selectedPrompt.title}</span>
        </div>

        <div className="border rounded-lg p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">{selectedPrompt.prompt}</p>
        </div>

        <div className="border rounded-lg bg-card">
          <div className="flex items-center gap-2 p-3 border-b">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Response</span>
          </div>
          <ScrollArea className="h-[350px] p-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
                <span className="text-sm">Generating...</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-sm">{response}</p>
            )}
          </ScrollArea>
        </div>

        {response && !isLoading && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy} className="flex-1">
              Copy Response
            </Button>
            <Button variant="outline" onClick={() => handlePromptSelect(selectedPrompt)} className="flex-1">
              Regenerate
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map(category => {
        const Icon = category.icon;
        return (
          <div key={category.id} className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-medium">{category.name}</h3>
            </div>
            <div className="space-y-2">
              {category.prompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptSelect(prompt)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center justify-between group"
                >
                  <span>{prompt.title}</span>
                  <Send className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickPromptsTab;
