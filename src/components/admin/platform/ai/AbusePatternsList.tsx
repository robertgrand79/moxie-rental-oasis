import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { usePlatformAIUsage } from '@/hooks/usePlatformAIUsage';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const AbusePatternsList = () => {
  const { abusePatterns, loadingAbuse } = usePlatformAIUsage();
  const navigate = useNavigate();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'medium': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      default: return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getPatternTypeBadge = (type: string) => {
    switch (type) {
      case 'high_frequency': return <Badge variant="outline">High Frequency</Badge>;
      case 'unusual_spike': return <Badge variant="outline">Unusual Spike</Badge>;
      case 'approaching_limit': return <Badge variant="outline">Near Limit</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Abuse Detection
        </CardTitle>
        <CardDescription>
          Automatically detected patterns that may indicate unusual AI usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingAbuse ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !abusePatterns || abusePatterns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No abuse patterns detected</p>
            <p className="text-sm">All tenants are within normal usage parameters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {abusePatterns.map((pattern, index) => (
              <div
                key={`${pattern.organization_id}-${pattern.pattern_type}-${index}`}
                className="flex items-start gap-4 p-4 rounded-lg border"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(pattern.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium">{pattern.organization_name}</span>
                    {getSeverityBadge(pattern.severity)}
                    {getPatternTypeBadge(pattern.pattern_type)}
                  </div>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Detected {formatDistanceToNow(new Date(pattern.detected_at), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/admin/platform/organizations?id=${pattern.organization_id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AbusePatternsList;
