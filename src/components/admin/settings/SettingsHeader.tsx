
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Settings, Search } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

interface SettingsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  children?: React.ReactNode;
}

const SettingsHeader = ({ searchQuery, setSearchQuery, children }: SettingsHeaderProps) => {
  return (
    <AdminPageWrapper 
      title="Site Settings"
      description="Configure your website's appearance, content, and functionality"
      actions={
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          <Settings className="h-3 w-3 mr-1" />
          Configuration
        </Badge>
      }
    >
      <div className="p-6 max-w-6xl mx-auto">
        {/* Search and Quick Access */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>
        
        {/* Render children (the Tabs component) */}
        {children}
      </div>
    </AdminPageWrapper>
  );
};

export default SettingsHeader;
