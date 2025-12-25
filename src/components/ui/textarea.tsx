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

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  enableAI?: boolean;
  aiPrompt?: string;
  aiLabel?: string;
  aiTooltip?: string;
  onValueChange?: (value: string) => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, enableAI = false, aiPrompt = '', aiLabel, aiTooltip = 'Generate with AI', onValueChange, ...props }, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAIApply = (content: string) => {
      if (onValueChange) {
        onValueChange(content);
      }
    };

    // If AI is enabled, wrap with label and AI button
    if (enableAI && aiLabel) {
      const textareaId = props.id || aiLabel.toLowerCase().replace(/\s+/g, '-');
      
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={textareaId}>{aiLabel}</Label>
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
          <textarea
            id={textareaId}
            className={cn(
              "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            {...props}
          />
          <AIContentModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            fieldName={textareaId}
            fieldLabel={aiLabel}
            contextPrompt={aiPrompt}
            currentValue={props.value as string}
            onApply={handleAIApply}
          />
        </div>
      );
    }

    // Standard textarea without AI
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
