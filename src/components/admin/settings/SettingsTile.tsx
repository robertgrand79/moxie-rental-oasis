import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsTileProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const SettingsTile = ({
  title,
  description,
  icon: Icon,
  onClick,
  badge,
  badgeVariant = 'secondary'
}: SettingsTileProps) => {
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
            "text-xs px-2 py-0.5 rounded-full",
            badgeVariant === 'default' && "bg-primary text-primary-foreground",
            badgeVariant === 'secondary' && "bg-secondary text-secondary-foreground",
            badgeVariant === 'destructive' && "bg-destructive text-destructive-foreground",
            badgeVariant === 'outline' && "border border-border text-muted-foreground"
          )}>
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
