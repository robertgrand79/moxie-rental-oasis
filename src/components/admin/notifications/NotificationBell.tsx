import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import NotificationPanel from './NotificationPanel';

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  } = useNotifications();

  const triggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 flex items-center justify-center',
            'min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground',
            'text-[10px] font-medium px-1'
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );

  const panel = (
    <NotificationPanel
      notifications={notifications}
      isLoading={isLoading}
      unreadCount={unreadCount}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onArchive={archiveNotification}
      onClose={() => setOpen(false)}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {triggerButton}
        </SheetTrigger>
        <SheetContent 
          side="right" 
          className="w-[min(24rem,100vw)] p-0 sm:max-w-sm"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          {panel}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        alignOffset={-8}
        collisionPadding={16}
        className="p-0 shadow-lg bg-popover overflow-hidden z-50 w-[min(22rem,calc(100vw-3rem))]"
      >
        {panel}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
