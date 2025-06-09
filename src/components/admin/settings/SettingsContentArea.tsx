
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';
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

interface SettingsContentAreaProps {
  activeCategory: string;
  filteredCategories: SettingsCategory[];
  onSettingClick: (settingKey: string) => void;
}

const SettingsContentArea = ({ 
  activeCategory, 
  filteredCategories, 
  onSettingClick 
}: SettingsContentAreaProps) => {
  const activeSettings = filteredCategories.find(cat => cat.id === activeCategory)?.settings || [];
  const activeCategoryObj = filteredCategories.find(cat => cat.id === activeCategory);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
        return <Badge variant="default" className="bg-green-100 text-green-700 text-xs">Configured</Badge>;
      case 'needs-setup':
        return <Badge variant="destructive" className="text-xs">Needs Setup</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
    }
  };

  if (!activeCategoryObj) {
    return null;
  }

  const IconComponent = activeCategoryObj.icon || Settings;

  return (
    <div className="space-y-6">
      {/* Active Category Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className={cn("p-3 rounded-lg", activeCategoryObj.color || "bg-gray-100")}>
          <IconComponent className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {activeCategoryObj.title}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {activeCategoryObj.description}
          </p>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="space-y-4">
        {activeSettings.map((setting, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-200 border border-gray-200">
            <CardHeader className="pb-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Title and Description */}
                <div className="col-span-12 lg:col-span-6 space-y-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {setting.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 leading-relaxed">
                    {setting.description}
                  </CardDescription>
                </div>
                
                {/* Status Badge */}
                <div className="col-span-6 lg:col-span-3 flex justify-start lg:justify-center">
                  {getStatusBadge(setting.status)}
                </div>
                
                {/* Configure Button */}
                <div className="col-span-6 lg:col-span-3 flex justify-end">
                  <Button 
                    variant={setting.status === 'needs-setup' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSettingClick(setting.key)}
                    className="w-full sm:w-auto"
                  >
                    {setting.status === 'needs-setup' ? 'Set Up' : 'Configure'}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {activeSettings.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="py-12 text-center text-gray-500">
            <p className="text-base">No settings found for this category.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsContentArea;
