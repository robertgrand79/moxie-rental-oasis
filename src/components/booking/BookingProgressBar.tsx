import React from 'react';
import { Check } from 'lucide-react';

interface BookingProgressBarProps {
  currentStep: number;
  steps: { label: string; }[];
}

export const BookingProgressBar = ({ currentStep, steps }: BookingProgressBarProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          
          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-300
                    ${isComplete ? 'bg-primary text-primary-foreground' : ''}
                    ${isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : ''}
                    ${!isComplete && !isActive ? 'bg-muted text-muted-foreground' : ''}
                  `}
                >
                  {isComplete ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-muted relative top-[-12px]">
                  <div
                    className={`h-full bg-primary transition-all duration-300 ${
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
