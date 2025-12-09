import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AIGenerateButtonProps {
  onClick: () => void;
  tooltip?: string;
  size?: 'sm' | 'default';
  className?: string;
}

const AIGenerateButton = ({ 
  onClick, 
  tooltip = 'Generate with AI',
  size = 'sm',
  className = ''
}: AIGenerateButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClick}
            className={`h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 ${className}`}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AIGenerateButton;
