import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, User, Building2, Ticket, AlertCircle, ArrowRight, MessageSquare, Mail } from 'lucide-react';
import { usePlatformNotifications, PlatformNotification } from '@/hooks/usePlatformNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'new_user':
      return <User className="h-4 w-4 text-blue-500" />;
    case 'new_organization':
      return <Building2 className="h-4 w-4 text-green-500" />;
    case 'new_ticket':
      return <Ticket className="h-4 w-4 text-orange-500" />;
    case 'new_feedback':
      return <MessageSquare className="h-4 w-4 text-purple-500" />;
    case 'new_email':
      return <Mail className="h-4 w-4 text-cyan-500" />;
    case 'system_alert':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

const getPriorityBadge = (priority: string) => {
  if (priority === 'urgent') {
    return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
  }
  if (priority === 'high') {
    return <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">High</Badge>;
  }
  return null;
};

const ActivityItem: React.FC<{
  notification: PlatformNotification;
  onClick: () => void;
}> = ({ notification, onClick }) => (
  <div
    className={cn(
      'flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors',
      !notification.is_read && 'bg-accent/30'
    )}
    onClick={onClick}
  >
    <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-full bg-muted">
      {getActivityIcon(notification.notification_type)}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className={cn('text-sm truncate', !notification.is_read && 'font-medium')}>
          {notification.title}
        </p>
        {getPriorityBadge(notification.priority)}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">
        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
      </p>
    </div>
    {!notification.is_read && (
      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
    )}
  </div>
);

const RecentActivityWidget: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading } = usePlatformNotifications({ limit: 5 });

  const handleActivityClick = (notification: PlatformNotification) => {
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Activity className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <ActivityItem
                key={notification.id}
                notification={notification}
                onClick={() => handleActivityClick(notification)}
              />
            ))}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-xs"
          onClick={() => navigate('/admin/platform/notifications')}
        >
          View all activity
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;
