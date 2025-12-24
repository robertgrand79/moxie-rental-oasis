import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  featureName: string;
  fallbackMessage?: string;
  showRetry?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * FeatureErrorBoundary - Catches errors within feature sections
 * Shows a contained error state without breaking the entire page
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`🚨 Feature Error (${this.props.featureName}):`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    const { featureName, fallbackMessage, showRetry = true } = this.props;

    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{featureName} Unavailable</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              {fallbackMessage || `The ${featureName.toLowerCase()} feature encountered an error and couldn't be loaded.`}
            </p>
            {import.meta.env.DEV && this.state.error && (
              <p className="text-xs font-mono mb-3 opacity-75">
                {this.state.error.message}
              </p>
            )}
            {showRetry && (
              <Button 
                onClick={this.handleRetry} 
                variant="outline" 
                size="sm"
                className="border-destructive/50 hover:bg-destructive/10"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default FeatureErrorBoundary;
