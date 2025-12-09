import React from 'react';
import { LucideIcon, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsTileProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  badge?: string;
  badgeVariant?: 'complete' | 'partial' | 'needs-setup';
}

const SettingsTile = ({
  title,
  description,
  icon: Icon,
  onClick,
  badge,
  badgeVariant
}: SettingsTileProps) => {
  const getBadgeStyles = () => {
    switch (badgeVariant) {
      case 'complete':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'partial':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'needs-setup':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getBadgeIcon = () => {
    switch (badgeVariant) {
      case 'complete':
        return <Check className="h-3 w-3 mr-1" />;
      case 'needs-setup':
        return <AlertCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start p-6 rounded-lg border bg-card text-card-foreground",
        "hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "text-left w-full group"
      )}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        {badge && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium flex items-center",
            getBadgeStyles()
          )}>
            {getBadgeIcon()}
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-base mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
    </button>
  );
};

export default SettingsTile;
