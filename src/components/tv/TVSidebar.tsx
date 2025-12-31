import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface TVSidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TVSidebarProps {
  items: TVSidebarItem[];
  activeItem: string;
  onItemSelect: (id: string) => void;
  className?: string;
}

/**
 * TVSidebar - Vertical navigation for TV interface
 * 
 * Optimized for:
 * - D-pad up/down navigation
 * - Large icons and text
 * - Clear active state
 */
const TVSidebar: React.FC<TVSidebarProps> = ({
  items,
  activeItem,
  onItemSelect,
  className
}) => {
  return (
    <nav 
      className={cn(
        "flex flex-col gap-2 p-4",
        "bg-card/50 backdrop-blur-sm rounded-2xl",
        "border border-border/50",
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onItemSelect(item.id)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl",
              "text-left transition-all duration-200",
              "focus:outline-none focus:ring-4 focus:ring-primary/50",
              "focus:scale-105 focus:shadow-lg",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "bg-transparent hover:bg-muted/50 text-foreground"
            )}
          >
            <Icon className={cn(
              "h-8 w-8 shrink-0",
              isActive ? "text-primary-foreground" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xl font-medium",
              isActive ? "text-primary-foreground" : "text-foreground"
            )}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default TVSidebar;
