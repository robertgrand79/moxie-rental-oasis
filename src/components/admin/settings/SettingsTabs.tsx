
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette, BarChart3, Wand2, Code, FileText } from 'lucide-react';

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
  return (
    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
      {filteredTabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <TabsTrigger 
            key={tab.id}
            value={tab.id} 
            className="flex flex-col items-center space-y-1 rounded-xl p-4 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            <IconComponent className="h-4 w-4" />
            <div className="text-center">
              <div className="text-xs font-medium">{tab.label}</div>
              <div className="text-xs opacity-70 hidden lg:block">{tab.description}</div>
            </div>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
};

export default SettingsTabs;
