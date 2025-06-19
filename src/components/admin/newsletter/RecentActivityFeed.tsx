
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Mail, MousePointer, TrendingUp } from 'lucide-react';

interface RecentActivityItem {
  id: string;
  event_type: string;
  subscriber_email: string;
  created_at: string;
  campaign_id: string;
}

interface RecentActivityFeedProps {
  recentActivity: RecentActivityItem[];
  loading?: boolean;
}

const RecentActivityFeed = ({ recentActivity, loading = false }: RecentActivityFeedProps) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'opened':
        return <Mail className="h-4 w-4 text-green-600" />;
      case 'clicked':
        return <MousePointer className="h-4 w-4 text-blue-600" />;
      case 'sent':
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'opened':
        return <Badge className="bg-green-100 text-green-800">Opened</Badge>;
      case 'clicked':
        return <Badge className="bg-blue-100 text-blue-800">Clicked</Badge>;
      case 'sent':
        return <Badge className="bg-gray-100 text-gray-800">Sent</Badge>;
      case 'bounced':
        return <Badge className="bg-red-100 text-red-800">Bounced</Badge>;
      case 'unsubscribed':
        return <Badge className="bg-orange-100 text-orange-800">Unsubscribed</Badge>;
      default:
        return <Badge>{eventType}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest newsletter engagement events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
            <p className="text-sm">Activity will appear here when users engage with your newsletters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {getEventIcon(activity.event_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getEventBadge(activity.event_type)}
                    <span className="text-sm text-gray-500 truncate">
                      {activity.subscriber_email}
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
