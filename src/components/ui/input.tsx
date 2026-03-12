import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import AIContentModal from "@/components/admin/settings/AIContentModal"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  enableAI?: boolean;
  aiPrompt?: string;
  aiLabel?: string;
  aiTooltip?: string;
  onValueChange?: (value: string) => void;
}

const inputBaseClasses = "flex h-10 w-full rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, enableAI = false, aiPrompt = '', aiLabel, aiTooltip = 'Generate with AI', onValueChange, ...props }, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAIApply = (content: string) => {
      if (onValueChange) {
        onValueChange(content);
      }
    };

    // If AI is enabled, wrap with label and AI button
    if (enableAI && aiLabel) {
      const inputId = props.id || (aiLabel?.toLowerCase() || 'input').replace(/\s+/g, '-');
      
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={inputId}>{aiLabel}</Label>
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
          </div>
          <input
            type={type}
            id={inputId}
            className={cn(inputBaseClasses, className)}
            ref={ref}
            {...props}
          />
          <AIContentModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            fieldName={inputId}
            fieldLabel={aiLabel}
            contextPrompt={aiPrompt}
            currentValue={props.value as string}
            onApply={handleAIApply}
          />
        </div>
      );
    }

    // Standard input without AI
    return (
      <input
        type={type}
        className={cn(inputBaseClasses, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
