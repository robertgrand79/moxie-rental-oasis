
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface SettingsTabsProps {
  tabs: Tab[];
  filteredTabs: Tab[];
}

const SettingsTabs = ({ filteredTabs }: SettingsTabsProps) => {
  console.log('SettingsTabs rendering with filteredTabs:', filteredTabs);

  return (
    <div className="w-full overflow-x-auto">
      <TabsList className="inline-flex h-12 items-center justify-start rounded-xl bg-white/60 backdrop-blur-sm p-1 shadow-sm border min-w-full overflow-x-auto">
        {filteredTabs.map((tab) => {
          console.log('Rendering tab:', tab.id, tab.label);
          const IconComponent = tab.icon;
          return (
            <Tooltip key={tab.id}>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value={tab.id} 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-100 data-[state=active]:hover:bg-blue-600 min-w-fit"
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="text-center">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{tab.description}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TabsList>
    </div>
  );
};

export default SettingsTabs;
