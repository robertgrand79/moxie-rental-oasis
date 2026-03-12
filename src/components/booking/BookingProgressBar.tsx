import React from 'react';
import { Check } from 'lucide-react';

interface BookingProgressBarProps {
  currentStep: number;
  steps: { label: string; }[];
}

export const BookingProgressBar = ({ currentStep, steps }: BookingProgressBarProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          
          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-300
                    ${isComplete ? 'bg-primary text-primary-foreground' : ''}
                    ${isActive ? 'bg-foreground text-background ring-4 ring-foreground/10' : ''}
                    ${!isComplete && !isActive ? 'bg-muted/50 text-muted-foreground border border-border/40' : ''}
                  `}
                >
                  {isComplete ? <Check className="w-4 h-4" strokeWidth={2} /> : stepNumber}
                </div>
                <span className={`text-xs tracking-wide ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-px mx-6 bg-border/40 relative top-[-10px]">
                  <div
                    className={`h-full bg-primary transition-all duration-500 ${
                      isComplete ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
