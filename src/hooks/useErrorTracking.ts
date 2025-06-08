
import { useState, useEffect } from 'react';

interface ErrorDetail {
  id: string;
  message: string;
  stack?: string;
  timestamp: Date;
  page: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'resolved' | 'acknowledged';
  userAgent?: string;
  userId?: string;
}

export const useErrorTracking = () => {
  const [errors, setErrors] = useState<ErrorDetail[]>([]);

  // Initialize with some sample errors
  useEffect(() => {
    const sampleErrors: ErrorDetail[] = [
      {
        id: '1',
        message: 'TypeError: Cannot read property \'map\' of undefined at PropertyList component',
        stack: 'TypeError: Cannot read property \'map\' of undefined\n    at PropertyList (PropertyList.tsx:45:23)\n    at renderWithHooks (react-dom.js:8031:18)',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        page: '/admin/properties',
        severity: 'critical',
        status: 'active',
        userAgent: 'Chrome/91.0'
      },
      {
        id: '2',
        message: 'Network Error: Failed to fetch blog posts from API',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        page: '/admin/blog-management',
        severity: 'warning',
        status: 'active',
        userAgent: 'Chrome/91.0'
      },
      {
        id: '3',
        message: 'Warning: React Hook useEffect has missing dependencies',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        page: '/admin/settings',
        severity: 'info',
        status: 'active',
        userAgent: 'Chrome/91.0'
      }
    ];
    
    setErrors(sampleErrors);

    // Set up global error handler
    const handleError = (event: ErrorEvent) => {
      const newError: ErrorDetail = {
        id: Date.now().toString(),
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date(),
        page: window.location.pathname,
        severity: 'critical',
        status: 'active',
        userAgent: navigator.userAgent
      };
      
      setErrors(prev => [newError, ...prev]);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const newError: ErrorDetail = {
        id: Date.now().toString(),
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date(),
        page: window.location.pathname,
        severity: 'warning',
        status: 'active',
        userAgent: navigator.userAgent
      };
      
      setErrors(prev => [newError, ...prev]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const resolveError = (errorId: string) => {
    setErrors(prev => 
      prev.map(error => 
        error.id === errorId 
          ? { ...error, status: 'resolved' as const }
          : error
      )
    );
  };

  const acknowledgeError = (errorId: string) => {
    setErrors(prev => 
      prev.map(error => 
        error.id === errorId 
          ? { ...error, status: 'acknowledged' as const }
          : error
      )
    );
  };

  const getActiveErrorCount = () => {
    return errors.filter(error => error.status === 'active').length;
  };

  const getCriticalErrorCount = () => {
    return errors.filter(error => error.status === 'active' && error.severity === 'critical').length;
  };

  return {
    errors,
    resolveError,
    acknowledgeError,
    getActiveErrorCount,
    getCriticalErrorCount
  };
};
