import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import NotificationItem from './NotificationItem';
import { AdminNotification } from '@/hooks/useNotifications';

interface NotificationPanelProps {
  notifications: AdminNotification[];
  isLoading: boolean;
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onArchive: (id: string) => void;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isLoading,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onArchive,
  onClose,
}) => {
  return (
    <div className="w-96 sm:w-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Notifications</h3>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <ScrollArea className="max-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Bell className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onArchive={onArchive}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <Separator />
      <div className="p-2 flex items-center justify-between">
        <Link
          to="/admin/notifications"
          onClick={onClose}
          className="text-xs text-primary hover:underline"
        >
          View all notifications
        </Link>
        <Link
          to="/admin/settings/team"
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <Settings className="h-3 w-3" />
          Preferences
        </Link>
      </div>
    </div>
  );
};

export default NotificationPanel;
