import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Database } from 'lucide-react';

interface Props {
  children: ReactNode;
  dataSource?: string;
  onRetry?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * DataErrorBoundary - Catches errors in data-fetching components
 * Shows a data-specific error state with retry functionality
 */
export class DataErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`🚨 Data Error (${this.props.dataSource || 'Unknown'}):`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  public render() {
    const { dataSource } = this.props;

    if (this.state.hasError) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Failed to load data</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              {dataSource 
                ? `We couldn't load the ${dataSource}. Please try again.`
                : 'There was a problem loading this data. Please try again.'}
            </p>
            {import.meta.env.DEV && this.state.error && (
              <p className="text-xs font-mono text-muted-foreground mb-4 max-w-md break-all">
                {this.state.error.message}
              </p>
            )}
            <Button onClick={this.handleRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default DataErrorBoundary;
