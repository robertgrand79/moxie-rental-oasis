
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
                "h-auto p-4 text-center justify-center group transition-all duration-200 relative min-h-[100px]",
                activeCategory === category.id 
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" 
                  : "hover:border-primary/50 hover:bg-primary/5"
              )}
              onClick={() => setActiveCategory(category.id)}
            >
              <div className="w-full flex flex-col items-center space-y-2">
                {/* Badge positioned absolutely in top-right corner */}
                {needsSetupCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 text-xs px-2 py-0.5 h-auto min-w-[20px] flex items-center justify-center"
                  >
                    {needsSetupCount}
                  </Badge>
                )}
                
                {/* Centered Icon */}
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  activeCategory === category.id ? "bg-primary-foreground/20" : category.color
                )}>
                  <IconComponent className="h-5 w-5" />
                </div>
                
                {/* Centered Title - responsive text sizing and overflow handling */}
                <h4 className="font-medium text-xs sm:text-sm leading-tight text-center px-1 break-words hyphens-auto">
                  {category.title}
                </h4>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsCategoryGrid;
