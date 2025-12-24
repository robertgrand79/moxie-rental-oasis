import React from 'react';
import { useNavigate, useLocation, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

interface ErrorPageProps {
  isAdmin?: boolean;
  error?: Error;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ isAdmin = false, error: propError }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeError = useRouteError();

  const getErrorMessage = () => {
    if (propError) {
      return propError.message;
    }
    if (isRouteErrorResponse(routeError)) {
      return routeError.statusText;
    }
    if (routeError instanceof Error) {
      return routeError.message;
    }
    return 'An unexpected error occurred';
  };

  const getErrorCode = () => {
    if (isRouteErrorResponse(routeError)) {
      return routeError.status;
    }
    return 500;
  };

  const errorMessage = getErrorMessage();
  const errorCode = getErrorCode();

  React.useEffect(() => {
    console.error('Error Page displayed:', {
      path: location.pathname,
      error: errorMessage,
      code: errorCode,
      timestamp: new Date().toISOString(),
    });
  }, [location.pathname, errorMessage, errorCode]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate(isAdmin ? '/admin' : '/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const content = (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <div className="text-5xl font-bold text-destructive mb-2">{errorCode}</div>
          <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
          <CardDescription className="text-base">
            We're sorry, but something unexpected happened. Our team has been notified.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-muted rounded-lg text-left">
              <p className="text-xs font-medium text-muted-foreground mb-1">Error Details:</p>
              <p className="text-sm font-mono text-foreground break-all">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Here are some things you can try:
            </p>
            <ul className="text-sm text-muted-foreground text-left list-disc list-inside space-y-1">
              <li>Refresh the page and try again</li>
              <li>Go back to the previous page</li>
              <li>Return to the homepage</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleReload} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = 'mailto:support@staymoxie.com'}
              className="text-muted-foreground"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isAdmin) {
    return content;
  }

  return (
    <>
      <NavBar />
      {content}
      <Footer />
    </>
  );
};

export default ErrorPage;
