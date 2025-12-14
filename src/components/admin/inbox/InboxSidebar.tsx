import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Inbox, 
  Mail, 
  Clock, 
  CheckCircle, 
  Star, 
  Search,
  AlarmClock
} from 'lucide-react';
import { InboxFilter } from '@/hooks/useGuestInbox';
import { cn } from '@/lib/utils';

interface InboxSidebarProps {
  filter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
  unreadCount: number;
  snoozedCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const filterOptions: { value: InboxFilter; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All Messages', icon: <Inbox className="h-4 w-4" /> },
  { value: 'unread', label: 'Unread', icon: <Mail className="h-4 w-4" /> },
  { value: 'awaiting_reply', label: 'Awaiting Reply', icon: <Clock className="h-4 w-4" /> },
  { value: 'snoozed', label: 'Snoozed', icon: <AlarmClock className="h-4 w-4" /> },
  { value: 'resolved', label: 'Resolved', icon: <CheckCircle className="h-4 w-4" /> },
  { value: 'starred', label: 'Starred', icon: <Star className="h-4 w-4" /> },
];

const InboxSidebar: React.FC<InboxSidebarProps> = ({
  filter,
  onFilterChange,
  unreadCount,
  snoozedCount,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="w-56 border-r bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Inbox className="h-5 w-5" />
          Guest Inbox
        </h2>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* Filter buttons */}
      <nav className="flex-1 p-2 space-y-1">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-2',
              filter === option.value && 'bg-secondary'
            )}
            onClick={() => onFilterChange(option.value)}
          >
            {option.icon}
            <span className="flex-1 text-left">{option.label}</span>
            {option.value === 'unread' && unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
            {option.value === 'snoozed' && snoozedCount > 0 && (
              <Badge variant="outline" className="ml-auto h-5 px-1.5 text-xs">
                {snoozedCount}
              </Badge>
            )}
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default InboxSidebar;
