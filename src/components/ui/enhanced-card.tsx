
import * as React from "react";
import { cn } from "@/lib/utils";

const EnhancedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'glass' | 'elevated' | 'bordered';
    hover?: boolean;
  }
>(({ className, variant = 'default', hover = true, ...props }, ref) => {
  const variantClasses = {
    default: "bg-card text-card-foreground border shadow-sm",
    glass: "bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl",
    elevated: "bg-white shadow-xl border-0",
    bordered: "bg-white border-2 border-gray-100 shadow-md"
  };

  const hoverClasses = hover 
    ? "transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]" 
    : "";

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl overflow-hidden transform-gpu",
        variantClasses[variant],
        hoverClasses,
        className
      )}
      {...props}
    />
  );
});
EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-8 pb-4", className)}
    {...props}
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
));
EnhancedCardTitle.displayName = "EnhancedCardTitle";

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription";

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-8 pt-0", className)} {...props} />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-8 pt-0", className)}
    {...props}
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";

export { 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardFooter, 
  EnhancedCardTitle, 
  EnhancedCardDescription, 
  EnhancedCardContent 
};
