
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  settings: Array<{
    name: string;
    description: string;
    status: string;
    key: string;
  }>;
}

interface SettingsCategoryGridProps {
  filteredCategories: SettingsCategory[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const SettingsCategoryGrid = ({ 
  filteredCategories, 
  activeCategory, 
  setActiveCategory 
}: SettingsCategoryGridProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Settings Categories</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCategories.map((category) => {
          const IconComponent = category.icon;
          const needsSetupCount = category.settings.filter(s => s.status === 'needs-setup').length;
          
          return (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className={cn(
                "h-auto p-4 text-left justify-start group transition-all duration-200",
                activeCategory === category.id 
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" 
                  : "hover:border-primary/50 hover:bg-primary/5"
              )}
              onClick={() => setActiveCategory(category.id)}
            >
              <div className="w-full min-w-0">
                {/* Header with icon and badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={cn(
                    "p-2 rounded-lg flex-shrink-0 transition-colors",
                    activeCategory === category.id ? "bg-primary-foreground/20" : category.color
                  )}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  {needsSetupCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="text-xs px-2 py-0.5 h-auto flex-shrink-0"
                    >
                      {needsSetupCount}
                    </Badge>
                  )}
                </div>
                
                {/* Title */}
                <h4 className="font-semibold text-sm leading-tight mb-1">
                  {category.title}
                </h4>
                
                {/* Description */}
                <p className="text-xs opacity-75 leading-relaxed line-clamp-2">
                  {category.description}
                </p>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsCategoryGrid;
