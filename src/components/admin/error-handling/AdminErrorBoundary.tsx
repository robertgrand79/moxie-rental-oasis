import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Admin Error Boundary (${this.props.context || 'Unknown'}):`, error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Track error for analytics
    this.trackError(error, errorInfo);
  }

  trackError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Log to console for debugging
      console.group('🚨 Admin Error Details');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Context:', this.props.context);
      console.groupEnd();

      // Could integrate with external error tracking service here
      // Example: Sentry, LogRocket, etc.
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: ''
    });
    
    toast({
      title: 'Retrying...',
      description: 'Attempting to reload the component.',
    });
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      id: errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      context: this.props.context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Copy error details to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    
    toast({
      title: 'Error details copied',
      description: 'Error information has been copied to your clipboard for reporting.',
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const context = this.props.context || 'Admin Component';

      return (
        <div className="p-6 min-h-[400px] flex items-center justify-center">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                {context} Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-3">
                    {error?.message || 'An unexpected error occurred while loading this section.'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Error ID: <code className="bg-gray-100 px-1 rounded">{errorId}</code>
                  </p>
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap gap-3">
                <EnhancedButton
                  onClick={this.handleRetry}
                  variant="outline"
                  icon={<RefreshCw className="h-4 w-4" />}
                >
                  Try Again
                </EnhancedButton>
                
                <EnhancedButton
                  variant="outline"
                  icon={<Home className="h-4 w-4" />}
                  asChild
                >
                  <Link to="/admin">Go to Dashboard</Link>
                </EnhancedButton>
                
                <EnhancedButton
                  onClick={this.handleReportError}
                  variant="ghost"
                  icon={<Bug className="h-4 w-4" />}
                >
                  Copy Error Details
                </EnhancedButton>
              </div>

              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Developer Details (Development Mode)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
