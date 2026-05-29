import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { Bell, Check, Archive, Search, Filter, Trash2 } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useNotifications, AdminNotification } from '@/hooks/useNotifications';
import NotificationItem from '@/components/admin/notifications/NotificationItem';
import { ScrollArea } from '@/components/ui/scroll-area';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    archiveNotification,
    unreadCount
  } = useNotifications();
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    // Category filter
    if (activeFilter === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (activeFilter !== 'all') {
      filtered = filtered.filter(n => n.category === activeFilter);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        (n.title?.toLowerCase() || '').includes(query) ||
        (n.message?.toLowerCase() || '').includes(query)
      );
    }
    
    return filtered;
  }, [notifications, activeFilter, searchQuery]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: AdminNotification[] } = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Earlier': []
    };

    filteredNotifications.forEach(notification => {
      const date = new Date(notification.created_at);
      if (isToday(date)) {
        groups['Today'].push(notification);
      } else if (isYesterday(date)) {
        groups['Yesterday'].push(notification);
      } else if (isThisWeek(date)) {
        groups['This Week'].push(notification);
      } else {
        groups['Earlier'].push(notification);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkMarkRead = () => {
    selectedIds.forEach(id => markAsRead(id));
    setSelectedIds(new Set());
  };

  const handleBulkArchive = () => {
    selectedIds.forEach(id => archiveNotification(id));
    setSelectedIds(new Set());
  };

  return (
    <AdminPageWrapper 
      title="Notifications" 
      description="View and manage your notifications"
    >
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-0">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {unreadCount} unread
            </Badge>
            <Badge variant="outline" className="text-sm">
              {notifications.length} total
            </Badge>
          </div>
          <Button 
            variant="outline" 
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0}
            className="w-full sm:w-auto h-11 sm:h-9 text-sm"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 md:border bg-transparent md:bg-card shadow-none md:shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 md:h-9 text-base md:text-sm"
                />
              </div>
              
              {/* Filter Tabs */}
              <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full md:w-auto">
                <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 md:mx-0 md:px-0">
                  <TabsList className="inline-flex w-max min-w-full md:min-w-0 justify-start">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="communications">Messages</TabsTrigger>
                    <TabsTrigger value="operations">Operations</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <Card className="bg-muted/50 border-x-0 md:border-x rounded-none md:rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleBulkMarkRead} className="h-10 md:h-8">
                    <Check className="h-4 w-4 mr-2" />
                    Mark read
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkArchive} className="h-10 md:h-8">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <Card className="border-0 md:border bg-transparent md:bg-card shadow-none md:shadow-sm">
          <CardHeader className="px-4 md:px-6 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              {filteredNotifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedIds.size === filteredNotifications.length && filteredNotifications.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="h-5 w-5 md:h-4 md:w-4"
                  />
                  <span className="text-sm text-muted-foreground select-none">Select all</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-0 md:px-6 pb-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No notifications</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'No notifications match your search' : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] px-4 md:px-0">
                <div className="space-y-6">
                  {Object.entries(groupedNotifications).map(([group, items]) => 
                    items.length > 0 && (
                      <div key={group}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2 md:px-0">
                          {group}
                        </h3>
                        <div className="space-y-2">
                          {items.map(notification => (
                            <div key={notification.id} className="flex items-start gap-1">
                              <div className="pt-2 flex items-center justify-center min-h-[44px] min-w-[44px]">
                                <Checkbox
                                  checked={selectedIds.has(notification.id)}
                                  onCheckedChange={() => handleSelectOne(notification.id)}
                                  className="h-5 w-5"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <NotificationItem
                                  notification={notification}
                                  onMarkAsRead={markAsRead}
                                  onArchive={archiveNotification}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  );
};

export default NotificationsPage;
