import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AIContentModal from '@/components/admin/settings/AIContentModal';

interface AIInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  aiPrompt?: string;
  aiTooltip?: string;
  onValueChange?: (value: string) => void;
  enableAI?: boolean;
}

const AIInput = React.forwardRef<HTMLInputElement, AIInputProps>(
  ({ label, aiPrompt = '', aiTooltip = 'Generate with AI', onValueChange, enableAI = true, className, id, ...props }, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    const handleAIApply = (content: string) => {
      if (onValueChange) {
        onValueChange(content);
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={inputId}>{label}</Label>
          {enableAI && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsModalOpen(true)}
                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{aiTooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Input
          ref={ref}
          id={inputId}
          className={className}
          {...props}
        />
        {enableAI && (
          <AIContentModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            fieldName={inputId}
            fieldLabel={label}
            contextPrompt={aiPrompt}
            currentValue={props.value as string}
            onApply={handleAIApply}
          />
        )}
      </div>
    );
  }
);

AIInput.displayName = 'AIInput';

export { AIInput };
