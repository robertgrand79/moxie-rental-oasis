import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Settings,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { GAHealthCheck } from '@/services/analytics/types';

interface GAHealthCheckCardProps {
  healthCheck: GAHealthCheck | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const GAHealthCheckCard: React.FC<GAHealthCheckCardProps> = ({ 
  healthCheck, 
  onRefresh, 
  isRefreshing 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
      case 'not_configured':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
      case 'not_configured':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!healthCheck) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Google Analytics Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-muted-foreground">Loading health check...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Google Analytics Health
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Check
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {getStatusIcon(healthCheck.status)}
          <Badge className={getStatusColor(healthCheck.status)}>
            {healthCheck.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Status Message */}
        <Alert>
          <AlertDescription>
            {healthCheck.message}
          </AlertDescription>
        </Alert>

        {/* Technical Details */}
        {healthCheck.details && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Technical Details:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {healthCheck.details.configurationValid ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                Configuration Valid
              </div>
              <div className="flex items-center gap-2">
                {healthCheck.details.scriptLoaded ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                Script Loaded
              </div>
              <div className="flex items-center gap-2">
                {healthCheck.details.gtagAvailable ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                gtag Available
              </div>
              <div className="flex items-center gap-2">
                {healthCheck.details.testSuccessful ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                Test Successful
              </div>
            </div>
          </div>
        )}

        {/* Suggested Actions */}
        {healthCheck.suggestedActions && healthCheck.suggestedActions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Suggested Actions:</h4>
            <ul className="text-sm space-y-1">
              {healthCheck.suggestedActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Links */}
        {healthCheck.status === 'not_configured' && (
          <div className="pt-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Go to Settings
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GAHealthCheckCard;