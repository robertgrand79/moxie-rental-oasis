import React from 'react';
import SettingsSidebar from './SettingsSidebar';
import SettingsMobileNav from './SettingsMobileNav';

interface SettingsSidebarLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingsSidebarLayout: React.FC<SettingsSidebarLayoutProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="flex h-full">
      {/* Desktop Sidebar */}
      <SettingsSidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 space-y-6">
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <SettingsMobileNav />
          </div>
          
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebarLayout;
