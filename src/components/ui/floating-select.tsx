
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FloatingSelectProps {
  label: string;
  error?: string;
  helper?: string;
  onValueChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
  children: React.ReactNode;
}

const FloatingSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  FloatingSelectProps
>(({ label, error, helper, onValueChange, value, placeholder, children, ...props }, ref) => {
  const [focused, setFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);

  React.useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const labelFloated = focused || hasValue;

  return (
    <div className="relative">
      <SelectPrimitive.Root onValueChange={onValueChange} value={value}>
        <SelectPrimitive.Trigger
          ref={ref}
          className={cn(
            "peer w-full rounded-lg border-2 border-input bg-background px-4 pt-6 pb-2 text-sm transition-all duration-200 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20"
          )}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        >
          <SelectPrimitive.Value placeholder="" />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {children}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

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
});
FloatingSelect.displayName = "FloatingSelect";

const FloatingSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
FloatingSelectItem.displayName = "FloatingSelectItem";

export { FloatingSelect, FloatingSelectItem };
