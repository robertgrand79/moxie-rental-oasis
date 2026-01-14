import React, { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle, ExternalLink, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActiveAnnouncements, ActiveAnnouncement } from '@/hooks/useActiveAnnouncements';
import { cn } from '@/lib/utils';

const styleConfig = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    icon: Info,
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-200',
    icon: AlertTriangle,
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950/50',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/50',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    icon: AlertCircle,
  },
};

const DISMISSED_KEY = 'dismissed_announcements';

function getDismissedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
}

function dismissAnnouncement(id: string) {
  const dismissed = getDismissedIds();
  if (!dismissed.includes(id)) {
    dismissed.push(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
  }
}

export function PlatformAnnouncementBanner() {
  const { data: announcements, isLoading } = useActiveAnnouncements();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    setDismissedIds(getDismissedIds());
  }, []);

  if (isLoading || !announcements) return null;

  // Filter out dismissed announcements and only show banners
  const visibleBanners = announcements.filter(
    (a) => a.announcement_type === 'banner' && !dismissedIds.includes(a.id)
  );

  // Also show high priority announcements as banners
  const urgentAnnouncements = announcements.filter(
    (a) => 
      a.announcement_type === 'announcement' && 
      (a.priority === 'high' || a.priority === 'urgent') &&
      !dismissedIds.includes(a.id)
  );

  const allBanners = [...visibleBanners, ...urgentAnnouncements];

  if (allBanners.length === 0) return null;

  const handleDismiss = (id: string) => {
    dismissAnnouncement(id);
    setDismissedIds([...dismissedIds, id]);
  };

  return (
    <div className="space-y-2 mb-4">
      {allBanners.map((announcement) => (
        <AnnouncementBannerItem
          key={announcement.id}
          announcement={announcement}
          onDismiss={() => handleDismiss(announcement.id)}
        />
      ))}
    </div>
  );
}

function AnnouncementBannerItem({
  announcement,
  onDismiss,
}: {
  announcement: ActiveAnnouncement;
  onDismiss: () => void;
}) {
  const style = styleConfig[announcement.banner_style] || styleConfig.info;
  const Icon = announcement.announcement_type === 'announcement' ? Megaphone : style.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border',
        style.bg,
        style.border
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', style.text)} />
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm', style.text)}>{announcement.title}</p>
        <p className={cn('text-sm mt-0.5 opacity-90', style.text)}>{announcement.content}</p>
        {announcement.cta_text && announcement.cta_url && (
          <a
            href={announcement.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1 text-sm font-medium mt-2 hover:underline',
              style.text
            )}
          >
            {announcement.cta_text}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-6 w-6 flex-shrink-0', style.text, 'hover:bg-transparent hover:opacity-70')}
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default PlatformAnnouncementBanner;
