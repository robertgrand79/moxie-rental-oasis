import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Shield,
  Bug
} from 'lucide-react';
import { useSiteMetricsEdgeCases } from '@/hooks/useSiteMetricsEdgeCases';

const SiteMetricsEdgeCaseMonitor: React.FC = () => {
  const { 
    edgeCaseStatuses, 
    checkEdgeCases, 
    hasActiveEdgeCases, 
    hasCriticalEdgeCases 
  } = useSiteMetricsEdgeCases();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (detected: boolean, handled: boolean) => {
    if (!detected) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    } else if (handled) {
      return <Shield className="h-4 w-4 text-blue-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getOverallStatus = () => {
    if (hasCriticalEdgeCases) return { status: 'critical', color: 'text-red-600', message: 'Critical issues detected' };
    if (hasActiveEdgeCases) return { status: 'warning', color: 'text-yellow-600', message: 'Some issues detected' };
    return { status: 'healthy', color: 'text-green-600', message: 'All systems normal' };
  };

  const overallStatus = getOverallStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Edge Case Monitor
            <Badge className={getSeverityColor(overallStatus.status)}>
              {overallStatus.status.toUpperCase()}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkEdgeCases}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className={overallStatus.color}>
            <strong>{overallStatus.message}</strong>
            {hasActiveEdgeCases && (
              <span className="block text-sm text-muted-foreground mt-1">
                Some edge cases have been detected and handled automatically.
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Edge Case List */}
        <div className="space-y-3">
          {edgeCaseStatuses.map((status, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(status.detected, status.handled)}
                <div>
                  <div className="font-medium">{status.name}</div>
                  <div className="text-sm text-muted-foreground">{status.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(status.severity)}>
                  {status.severity.toUpperCase()}
                </Badge>
                {status.detected && !status.handled && (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    ACTIVE
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {edgeCaseStatuses.filter(s => !s.detected).length}
            </div>
            <div className="text-sm text-muted-foreground">Normal</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {edgeCaseStatuses.filter(s => s.detected && s.handled).length}
            </div>
            <div className="text-sm text-muted-foreground">Handled</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {edgeCaseStatuses.filter(s => s.detected && !s.handled).length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {edgeCaseStatuses.filter(s => s.detected && s.severity === 'critical').length}
            </div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground">
          <p>
            Edge cases are automatically detected and handled when possible. 
            Critical issues may require manual intervention.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteMetricsEdgeCaseMonitor;