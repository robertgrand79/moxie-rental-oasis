import React from 'react';
import { LucideIcon, Plus, Search, Filter, Calendar, MessageSquare, Star, Home, FileText, Users, Settings, Inbox, Bell } from 'lucide-react';
import { EnhancedButton } from './enhanced-button';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 
  | 'properties' 
  | 'bookings' 
  | 'messages' 
  | 'reviews' 
  | 'search' 
  | 'filter' 
  | 'pages'
  | 'users'
  | 'notifications'
  | 'custom';

interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
}

const EMPTY_STATE_CONFIGS: Record<EmptyStateVariant, EmptyStateConfig> = {
  properties: {
    icon: Home,
    title: 'No Properties Yet',
    description: 'Start building your portfolio by adding your first property. You can add photos, descriptions, amenities, and booking details.',
    actionLabel: 'Add Your First Property',
  },
  bookings: {
    icon: Calendar,
    title: 'No Bookings Yet',
    description: 'You haven\'t received any bookings yet. Once guests start booking your properties, they\'ll appear here.',
  },
  messages: {
    icon: MessageSquare,
    title: 'No Messages Yet',
    description: 'Your inbox is empty. Messages from guests and team members will appear here.',
  },
  reviews: {
    icon: Star,
    title: 'No Reviews Yet',
    description: 'You haven\'t received any reviews yet. Reviews from your guests will show up here after their stays.',
  },
  search: {
    icon: Search,
    title: 'No Results Found',
    description: 'We couldn\'t find anything matching your search. Try adjusting your search terms or clearing filters.',
    actionLabel: 'Clear Search',
  },
  filter: {
    icon: Filter,
    title: 'No Matches Found',
    description: 'No items match your current filters. Try adjusting or clearing your filters to see more results.',
    actionLabel: 'Clear Filters',
  },
  pages: {
    icon: FileText,
    title: 'No Pages Yet',
    description: 'Create your first page to start building your website content.',
    actionLabel: 'Create Your First Page',
  },
  users: {
    icon: Users,
    title: 'No Users Yet',
    description: 'Your team is empty. Invite team members to collaborate on managing your properties.',
    actionLabel: 'Invite Team Member',
  },
  notifications: {
    icon: Bell,
    title: 'No Notifications',
    description: 'You\'re all caught up! New notifications will appear here.',
  },
  custom: {
    icon: Inbox,
    title: 'Nothing Here',
    description: 'This section is empty.',
  },
};

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIllustration?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'custom',
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  size = 'md',
  showIllustration = true,
}) => {
  const config = EMPTY_STATE_CONFIGS[variant];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;

  const sizeClasses = {
    sm: {
      container: 'py-8',
      iconWrapper: 'w-16 h-16',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm max-w-sm',
    },
    md: {
      container: 'py-12',
      iconWrapper: 'w-20 h-20',
      icon: 'h-10 w-10',
      title: 'text-xl',
      description: 'text-base max-w-md',
    },
    lg: {
      container: 'py-16',
      iconWrapper: 'w-24 h-24',
      icon: 'h-12 w-12',
      title: 'text-2xl',
      description: 'text-lg max-w-lg',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('text-center animate-fade-in', sizes.container, className)}>
      {showIllustration && (
        <div className={cn(
          'bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-primary/10',
          sizes.iconWrapper
        )}>
          <Icon className={cn('text-primary', sizes.icon)} />
        </div>
      )}
      
      <h3 className={cn('font-bold text-foreground mb-3', sizes.title)}>
        {displayTitle}
      </h3>
      
      <p className={cn('text-muted-foreground mx-auto leading-relaxed mb-6', sizes.description)}>
        {displayDescription}
      </p>
      
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {displayActionLabel && onAction && (
          <EnhancedButton 
            onClick={onAction}
            variant="gradient"
            size={size === 'sm' ? 'sm' : 'default'}
            icon={<Plus className="h-4 w-4" />}
          >
            {displayActionLabel}
          </EnhancedButton>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <EnhancedButton 
            onClick={onSecondaryAction}
            variant="outline"
            size={size === 'sm' ? 'sm' : 'default'}
          >
            {secondaryActionLabel}
          </EnhancedButton>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
