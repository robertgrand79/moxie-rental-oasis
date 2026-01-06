import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlatformNavItem } from './platformNavItems';

interface PlatformSectionCardProps {
  item: PlatformNavItem;
  isStarred: boolean;
  onToggleStar: () => void;
  stats?: {
    value: string | number;
    label: string;
    trend?: 'up' | 'down' | 'neutral';
  };
  variant?: 'default' | 'compact';
}

const PlatformSectionCard = ({
  item,
  isStarred,
  onToggleStar,
  stats,
  variant = 'default',
}: PlatformSectionCardProps) => {
  const navigate = useNavigate();
  const Icon = item.icon;

  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30',
          'bg-card/50 backdrop-blur-sm'
        )}
        onClick={() => navigate(item.path)}
      >
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{item.label}</h3>
            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 relative overflow-hidden',
        'bg-gradient-to-br from-card to-card/80 backdrop-blur-sm',
        isStarred && 'ring-1 ring-amber-400/30'
      )}
      onClick={() => navigate(item.path)}
    >
      {/* Star Button */}
      <button
        className={cn(
          'absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all',
          'hover:bg-muted/80',
          isStarred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar();
        }}
      >
        <Star
          className={cn(
            'h-4 w-4 transition-colors',
            isStarred ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground hover:text-amber-400'
          )}
        />
      </button>

      <CardContent className="p-6">
        {/* Icon */}
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>

        {/* Title and Description */}
        <h3 className="font-semibold text-lg mb-1">{item.label}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {item.description}
        </p>

        {/* Stats */}
        {stats && (
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div>
              <p className="text-2xl font-bold">{stats.value}</p>
              <p className="text-xs text-muted-foreground">{stats.label}</p>
            </div>
            {stats.trend && (
              <Badge
                variant={stats.trend === 'up' ? 'default' : stats.trend === 'down' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {stats.trend === 'up' ? '↑' : stats.trend === 'down' ? '↓' : '→'}
              </Badge>
            )}
          </div>
        )}

        {/* Hover Arrow */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformSectionCard;
