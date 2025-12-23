import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarCheck, 
  MessageSquare, 
  Wrench, 
  CreditCard, 
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  X,
  Clock,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminNotification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: AdminNotification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onClose?: () => void;
  expanded?: boolean;
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
    case 'system':
      return AlertTriangle;
    default:
      return Bell;
  }
};

const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'bookings':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'communications':
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400';
    case 'operations':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'payments':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'system':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getPriorityStyles = (priority: string, isRead: boolean) => {
  if (isRead) return '';
  
  switch (priority) {
    case 'urgent':
      return 'border-l-4 border-l-destructive bg-destructive/5';
    case 'high':
      return 'border-l-4 border-l-amber-500 bg-amber-500/5';
    default:
      return '';
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onArchive,
  onClose,
  expanded = false,
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

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 border-b last:border-b-0 cursor-pointer transition-all duration-200',
        'hover:bg-muted/50 group',
        !notification.is_read && 'bg-primary/[0.03]',
        getPriorityStyles(notification.priority, notification.is_read)
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105',
        getCategoryStyles(notification.category)
      )}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn(
                'text-sm truncate',
                !notification.is_read && 'font-semibold'
              )}>
                {notification.title}
              </p>
              {!notification.is_read && (
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <p className={cn(
              'text-xs text-muted-foreground mt-0.5',
              expanded ? 'whitespace-normal' : 'truncate'
            )}>
              {notification.message}
            </p>
          </div>
          
          {/* Priority Badge */}
          {(notification.priority === 'urgent' || notification.priority === 'high') && !notification.is_read && (
            <Badge 
              variant={notification.priority === 'urgent' ? 'destructive' : 'outline'}
              className={cn(
                'flex-shrink-0 text-[10px] px-1.5 py-0 h-4',
                notification.priority === 'high' && 'border-amber-500 text-amber-600 dark:text-amber-400'
              )}
            >
              {notification.priority === 'urgent' ? (
                <>
                  <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                  Urgent
                </>
              ) : 'High'}
            </Badge>
          )}
        </div>
        
        {/* Timestamp */}
        <div className="flex items-center gap-1 mt-1.5">
          <Clock className="w-3 h-3 text-muted-foreground/50" />
          <p className="text-[11px] text-muted-foreground/60">
            {timeAgo}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div 
        className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" 
        onClick={(e) => e.stopPropagation()}
      >
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            onClick={() => onMarkAsRead(notification.id)}
            title="Mark as read"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onArchive(notification.id)}
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NotificationItem;
