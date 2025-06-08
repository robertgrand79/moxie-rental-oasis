
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  X, 
  Clock, 
  Globe, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

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

  const activeErrors = errors.filter(error => error.status === 'active');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Active Errors ({activeErrors.length})
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {activeErrors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium">No active errors!</p>
                <p className="text-sm">Your site is running smoothly.</p>
              </div>
            ) : (
              activeErrors.map((error) => (
                <div key={error.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
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
                        <h4 className="font-medium text-gray-900 break-words">
                          {error.message}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAcknowledgeError(error.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onResolveError(error.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                  
                  {error.stack && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        View Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDetailsModal;
