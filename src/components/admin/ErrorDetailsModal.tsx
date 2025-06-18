
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  X, 
  Clock, 
  Globe, 
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { formatErrorForUser } from '@/utils/errorMessages';
import { toast } from '@/hooks/use-toast';

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
  context?: Record<string, any>;
}

interface ErrorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: ErrorDetail[];
  onResolveError: (errorId: string) => void;
  onAcknowledgeError: (errorId: string) => void;
}

const ErrorDetailsModal = ({ 
  isOpen, 
  onClose, 
  errors, 
  onResolveError, 
  onAcknowledgeError 
}: ErrorDetailsModalProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'acknowledged': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'info': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleCopyErrorDetails = (error: ErrorDetail) => {
    const errorDetails = {
      id: error.id,
      message: error.message,
      timestamp: error.timestamp.toISOString(),
      page: error.page,
      severity: error.severity,
      userAgent: error.userAgent,
      stack: error.stack,
      context: error.context
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    toast({
      title: 'Error details copied',
      description: 'Error information has been copied to your clipboard.',
    });
  };

  const handleResolveWithFeedback = (errorId: string) => {
    onResolveError(errorId);
    toast({
      title: 'Error resolved',
      description: 'The error has been marked as resolved.',
    });
  };

  const handleAcknowledgeWithFeedback = (errorId: string) => {
    onAcknowledgeError(errorId);
    toast({
      title: 'Error acknowledged',
      description: 'The error has been acknowledged and will be reviewed.',
    });
  };

  const activeErrors = errors.filter(error => error.status === 'active');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Error Management ({activeErrors.length} active)
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4">
            {activeErrors.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <p className="text-xl font-medium">No active errors!</p>
                <p className="text-sm">Your system is running smoothly.</p>
              </div>
            ) : (
              activeErrors.map((error) => {
                const formattedError = formatErrorForUser(error.message);
                
                return (
                  <div key={error.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-1 rounded ${getSeverityColor(error.severity)}`}>
                          {getSeverityIcon(error.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getSeverityColor(error.severity)}>
                              {error.severity}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(error.status)}>
                              {error.status}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-gray-900 break-words mb-2">
                            {formattedError.userMessage}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {error.timestamp.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {error.page}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <EnhancedButton
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyErrorDetails(error)}
                          icon={<Copy className="h-3 w-3" />}
                        >
                          Copy
                        </EnhancedButton>
                        <EnhancedButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledgeWithFeedback(error.id)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Acknowledge
                        </EnhancedButton>
                        <EnhancedButton
                          size="sm"
                          onClick={() => handleResolveWithFeedback(error.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Resolve
                        </EnhancedButton>
                      </div>
                    </div>

                    {formattedError.suggestions.length > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-medium">Suggested solutions:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {formattedError.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {error.stack && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
                          <ExternalLink className="h-3 w-3" />
                          Technical Details
                        </summary>
                        <div className="mt-2 space-y-2">
                          <div className="text-xs bg-gray-50 p-3 rounded border">
                            <p className="font-medium mb-1">Technical Error:</p>
                            <p className="text-red-600">{formattedError.technicalDetails}</p>
                          </div>
                          <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre-wrap max-h-32">
                            {error.stack}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDetailsModal;
