
import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type, label, error, helper, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = () => setFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setHasValue(e.target.value !== '');
      props.onBlur?.(e);
    };

    const labelFloated = focused || hasValue || props.value || props.defaultValue;

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "peer w-full rounded-lg border-2 border-input bg-background px-4 pt-6 pb-2 text-sm transition-all duration-200 placeholder-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={label}
          {...props}
        />
        <label
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground transition-all duration-200 pointer-events-none",
            labelFloated && "top-2 translate-y-0 text-xs font-medium",
            focused && "text-ring",
            error && "text-destructive"
          )}
        >
          {label}
        </label>
        {(error || helper) && (
          <p className={cn(
            "mt-1 text-xs",
            error ? "text-destructive" : "text-muted-foreground"
          )}>
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
