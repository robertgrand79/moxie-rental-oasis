import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  User, 
  Building2, 
  Ticket, 
  AlertCircle, 
  CheckCircle, 
  Search,
  Bell,
  Archive,
  RefreshCw,
  Trash2,
  Loader2
} from 'lucide-react';
import { usePlatformNotifications, PlatformNotification } from '@/hooks/usePlatformNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'new_user':
      return <User className="h-5 w-5 text-blue-500" />;
    case 'new_organization':
      return <Building2 className="h-5 w-5 text-green-500" />;
    case 'new_ticket':
      return <Ticket className="h-5 w-5 text-orange-500" />;
    case 'system_alert':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Activity className="h-5 w-5 text-muted-foreground" />;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return <Badge variant="destructive">Urgent</Badge>;
    case 'high':
      return <Badge variant="outline" className="border-orange-500 text-orange-500">High</Badge>;
    case 'normal':
      return <Badge variant="secondary">Normal</Badge>;
    case 'low':
      return <Badge variant="outline">Low</Badge>;
    default:
      return null;
  }
};

const NotificationItem: React.FC<{
  notification: PlatformNotification;
  onMarkAsRead: () => void;
  onArchive: () => void;
  onClick: () => void;
}> = ({ notification, onMarkAsRead, onArchive, onClick }) => (
  <Card 
    className={cn(
      'cursor-pointer transition-all hover:shadow-md',
      !notification.is_read && 'border-l-4 border-l-primary bg-accent/30'
    )}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 rounded-full bg-muted">
          {getActivityIcon(notification.notification_type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className={cn('font-medium truncate', !notification.is_read && 'font-semibold')}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getPriorityBadge(notification.priority)}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">{notification.category}</Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {!notification.is_read && (
            <Button variant="ghost" size="icon" onClick={onMarkAsRead} title="Mark as read">
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onArchive} title="Archive">
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function PlatformNotificationsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    archiveNotification 
  } = usePlatformNotifications({ limit: 100, includeRead: true });

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = !searchTerm || 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'unread') return matchesSearch && !n.is_read;
    if (activeTab === 'urgent') return matchesSearch && (n.priority === 'urgent' || n.priority === 'high');
    return matchesSearch;
  });

  const handleNotificationClick = (notification: PlatformNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Platform Activity
          </h1>
          <p className="text-muted-foreground">
            View and manage all platform notifications and activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={() => markAllAsRead()}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
                <TabsTrigger value="urgent">Urgent</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">
                {activeTab === 'unread' 
                  ? "You're all caught up!" 
                  : 'Activity will appear here as it happens'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onArchive={() => archiveNotification(notification.id)}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
