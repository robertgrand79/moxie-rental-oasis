
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform-gpu",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        destructive: "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        outline: "border-2 border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 hover:scale-[1.02] active:scale-[0.98]",
        secondary: "bg-gradient-to-r from-secondary to-secondary/90 text-foreground shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline hover:scale-[1.02] active:scale-[0.98]",
        gradient: "bg-gradient-to-r from-gradient-from to-gradient-accent-from text-white shadow-lg hover:shadow-xl hover:from-gradient-from/90 hover:to-gradient-accent-from/90 hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
      loading: {
        true: "cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant, size, loading, asChild = false, children, icon, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(enhancedButtonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            Loading...
          </>
        ) : (
          <>
            {icon && <span className="transition-transform duration-200 group-hover:scale-110">{icon}</span>}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton, enhancedButtonVariants };
