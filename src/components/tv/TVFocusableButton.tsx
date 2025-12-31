import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface TVFocusableButtonProps extends ButtonProps {
  focusScale?: boolean;
  focusGlow?: boolean;
}

/**
 * TVFocusableButton - Button optimized for D-pad navigation
 * 
 * Features:
 * - Large touch/focus targets (min 48px height)
 * - Visible focus states for D-pad navigation
 * - Optional scale and glow effects on focus
 * - No hover states (no mouse on TV)
 */
const TVFocusableButton = forwardRef<HTMLButtonElement, TVFocusableButtonProps>(
  ({ className, focusScale = true, focusGlow = true, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          // Base TV button styles
          "min-h-[48px] md:min-h-[56px] px-6 md:px-8",
          "text-lg md:text-xl font-medium",
          "rounded-xl transition-all duration-200",
          
          // Focus styles for D-pad navigation
          "focus:outline-none focus:ring-4 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
          focusScale && "focus:scale-105",
          focusGlow && "focus:shadow-[0_0_20px_hsl(var(--primary)/0.4)]",
          
          // Remove hover states (no mouse on TV)
          "hover:bg-primary hover:text-primary-foreground",
          
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

TVFocusableButton.displayName = 'TVFocusableButton';

export default TVFocusableButton;
