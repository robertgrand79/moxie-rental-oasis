import React, { Component, ErrorInfo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  widgetName?: string;
  className?: string;
  silent?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
}

/**
 * WidgetErrorBoundary - Catches errors in small UI widgets
 * Shows minimal error state or can be completely silent
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(`⚠️ Widget Error (${this.props.widgetName || 'Unknown'}):`, error.message);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    const { silent = false, className, widgetName } = this.props;

    if (this.state.hasError) {
      if (silent) {
        return null;
      }

      return (
        <div 
          className={cn(
            "p-2 text-xs text-muted-foreground bg-muted/50 rounded border border-dashed",
            className
          )}
          title={widgetName ? `Error in ${widgetName}` : 'Widget error'}
        >
          Unable to load
        </div>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
