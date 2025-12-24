import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Settings, 
  Filter,
  CalendarCheck,
  MessageSquare,
  Wrench,
  CreditCard,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationItem from './NotificationItem';
import { AdminNotification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

interface NotificationPanelProps {
  notifications: AdminNotification[];
  isLoading: boolean;
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onArchive: (id: string) => void;
  onClose: () => void;
}

type FilterTab = 'all' | 'unread' | 'urgent';
type CategoryFilter = 'bookings' | 'communications' | 'operations' | 'payments' | 'system';

const CATEGORY_CONFIG: Record<CategoryFilter, { label: string; icon: React.ElementType; color: string }> = {
  bookings: { label: 'Bookings', icon: CalendarCheck, color: 'text-primary' },
  communications: { label: 'Messages', icon: MessageSquare, color: 'text-primary' },
  operations: { label: 'Operations', icon: Wrench, color: 'text-accent-foreground' },
  payments: { label: 'Payments', icon: CreditCard, color: 'text-secondary-foreground' },
  system: { label: 'System', icon: AlertTriangle, color: 'text-muted-foreground' },
};

interface GroupedNotifications {
  label: string;
  notifications: AdminNotification[];
}

interface TypeGroup {
  type: string;
  notifications: AdminNotification[];
  isExpanded: boolean;
}

const GROUPING_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function groupByType(notifications: AdminNotification[]): TypeGroup[] {
  if (notifications.length <= 1) {
    return notifications.map(n => ({
      type: n.notification_type,
      notifications: [n],
      isExpanded: true,
    }));
  }

  const groups: TypeGroup[] = [];
  let currentGroup: AdminNotification[] = [];
  let currentType = '';
  let groupStartTime = 0;

  for (const notification of notifications) {
    const notifTime = new Date(notification.created_at).getTime();
    
    if (
      notification.notification_type === currentType &&
      groupStartTime - notifTime <= GROUPING_WINDOW_MS
    ) {
      currentGroup.push(notification);
    } else {
      if (currentGroup.length > 0) {
        groups.push({
          type: currentType,
          notifications: currentGroup,
          isExpanded: currentGroup.length === 1,
        });
      }
      currentGroup = [notification];
      currentType = notification.notification_type;
      groupStartTime = notifTime;
    }
  }

  if (currentGroup.length > 0) {
    groups.push({
      type: currentType,
      notifications: currentGroup,
      isExpanded: currentGroup.length === 1,
    });
  }

  return groups;
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
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [categoryFilters, setCategoryFilters] = useState<Set<CategoryFilter>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Count notifications by priority
  const urgentCount = useMemo(() => 
    notifications.filter(n => !n.is_read && (n.priority === 'urgent' || n.priority === 'high')).length,
    [notifications]
  );

  // Filter notifications based on active tab and category filters
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply tab filter
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (activeTab === 'urgent') {
      filtered = filtered.filter(n => n.priority === 'urgent' || n.priority === 'high');
    }

    // Apply category filters
    if (categoryFilters.size > 0) {
      filtered = filtered.filter(n => categoryFilters.has(n.category as CategoryFilter));
    }

    return filtered;
  }, [notifications, activeTab, categoryFilters]);

  // Group notifications by time period
  const groupedNotifications = useMemo((): GroupedNotifications[] => {
    const today: AdminNotification[] = [];
    const yesterday: AdminNotification[] = [];
    const thisWeek: AdminNotification[] = [];
    const older: AdminNotification[] = [];

    filteredNotifications.forEach(notification => {
      const date = new Date(notification.created_at);
      if (isToday(date)) {
        today.push(notification);
      } else if (isYesterday(date)) {
        yesterday.push(notification);
      } else if (isThisWeek(date)) {
        thisWeek.push(notification);
      } else {
        older.push(notification);
      }
    });

    const groups: GroupedNotifications[] = [];
    if (today.length > 0) groups.push({ label: 'Today', notifications: today });
    if (yesterday.length > 0) groups.push({ label: 'Yesterday', notifications: yesterday });
    if (thisWeek.length > 0) groups.push({ label: 'This Week', notifications: thisWeek });
    if (older.length > 0) groups.push({ label: 'Earlier', notifications: older });

    return groups;
  }, [filteredNotifications]);

  const toggleCategoryFilter = (category: CategoryFilter) => {
    setCategoryFilters(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {urgentCount > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
              {urgentCount} urgent
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs whitespace-nowrap"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)} className="w-auto">
          <TabsList className="h-7 p-0.5 bg-muted/50">
            <TabsTrigger value="all" className="text-xs h-6 px-2">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs h-6 px-2">
              Unread
              {unreadCount > 0 && (
                <span className="ml-1 text-[10px] bg-primary/20 text-primary px-1 rounded">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="urgent" className="text-xs h-6 px-2">
              Urgent
              {urgentCount > 0 && (
                <span className="ml-1 text-[10px] bg-destructive/20 text-destructive px-1 rounded">
                  {urgentCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Category Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              <Filter className="h-3 w-3" />
              {categoryFilters.size > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {categoryFilters.size}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {(Object.keys(CATEGORY_CONFIG) as CategoryFilter[]).map((category) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              return (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={categoryFilters.has(category)}
                  onCheckedChange={() => toggleCategoryFilter(category)}
                  className="text-xs"
                >
                  <Icon className={cn("h-3 w-3 mr-2", config.color)} />
                  {config.label}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notification List */}
      <ScrollArea className="max-h-[350px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Bell className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              {activeTab === 'unread' ? 'No unread notifications' : 
               activeTab === 'urgent' ? 'No urgent notifications' :
               categoryFilters.size > 0 ? 'No matching notifications' :
               'No notifications'}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {activeTab === 'all' && categoryFilters.size === 0 
                ? "You're all caught up!" 
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div>
            {groupedNotifications.map((group) => (
              <div key={group.label}>
                {/* Group Header */}
                <div className="sticky top-0 z-10 px-3 py-1.5 bg-muted/50 backdrop-blur-sm border-b">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
                {/* Group Items */}
                {group.notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onArchive={onArchive}
                    onClose={onClose}
                  />
                ))}
              </div>
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
          to="/admin/settings/notifications"
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
