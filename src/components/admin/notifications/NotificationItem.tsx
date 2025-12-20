import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarCheck, 
  MessageSquare, 
  Wrench, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AdminNotification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: AdminNotification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onClose?: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'bookings':
      return CalendarCheck;
    case 'communications':
      return MessageSquare;
    case 'operations':
      return Wrench;
    case 'payments':
      return CreditCard;
    default:
      return AlertCircle;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-destructive/10 border-destructive/30';
    case 'high':
      return 'bg-accent/20 border-accent/50';
    default:
      return 'bg-background border-border';
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onArchive,
  onClose,
}) => {
  const navigate = useNavigate();
  const Icon = getCategoryIcon(notification.category);

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      onClose?.();
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-muted/50',
        !notification.is_read && 'bg-primary/5',
        getPriorityColor(notification.priority)
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        notification.category === 'bookings' && 'bg-primary/10 text-primary',
        notification.category === 'communications' && 'bg-primary/10 text-primary',
        notification.category === 'operations' && 'bg-accent/20 text-accent-foreground',
        notification.category === 'payments' && 'bg-secondary text-secondary-foreground',
        notification.category === 'system' && 'bg-muted text-muted-foreground'
      )}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm line-clamp-2',
            !notification.is_read && 'font-medium'
          )}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onMarkAsRead(notification.id)}
            title="Mark as read"
          >
            <CheckCircle className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={() => onArchive(notification.id)}
          title="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default NotificationItem;
