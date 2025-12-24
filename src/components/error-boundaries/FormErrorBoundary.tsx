import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  formName?: string;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * FormErrorBoundary - Catches errors in form components
 * Shows a form-specific error state with reset functionality
 */
export class FormErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`🚨 Form Error (${this.props.formName || 'Unknown'}):`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  public render() {
    const { formName } = this.props;

    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Form Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              {formName 
                ? `The ${formName} form encountered an error.`
                : 'This form encountered an error and cannot be displayed.'}
            </p>
            {import.meta.env.DEV && this.state.error && (
              <p className="text-xs font-mono mb-3 opacity-75">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={this.handleRetry} 
                variant="outline" 
                size="sm"
                className="border-destructive/50 hover:bg-destructive/10"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Retry
              </Button>
              {this.props.onReset && (
                <Button 
                  onClick={this.handleReset} 
                  variant="outline" 
                  size="sm"
                  className="border-destructive/50 hover:bg-destructive/10"
                >
                  <RotateCcw className="w-3 h-3 mr-2" />
                  Reset Form
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default FormErrorBoundary;
