import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  routeName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * RouteErrorBoundary - Catches errors at the route/page level
 * Shows a full-page error state with navigation options
 */
export class RouteErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`🚨 Route Error (${this.props.routeName || 'Unknown'}):`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleGoBack = () => {
    window.history.back();
  };

  // handleGoHome removed - using Link component instead

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-semibold">
                Page Error
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {this.props.routeName 
                  ? `We couldn't load the ${this.props.routeName} page.`
                  : 'We encountered an error loading this page.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {import.meta.env.DEV && this.state.error && (
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-md">
                  <p className="text-sm font-medium text-destructive mb-1">Error:</p>
                  <p className="text-xs text-destructive/80 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={this.handleGoBack} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/">
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
