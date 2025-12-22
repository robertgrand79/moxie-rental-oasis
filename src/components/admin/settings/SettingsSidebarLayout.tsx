import React from 'react';
import { LucideIcon } from 'lucide-react';
import SettingsSidebar from './SettingsSidebar';
import SettingsMobileNav from './SettingsMobileNav';
import ModernSettingsHeader from './ModernSettingsHeader';

interface StatItem {
  label: string;
  value: string | number;
}

interface SettingsSidebarLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  stats?: StatItem[];
  headerActions?: React.ReactNode;
  iconColor?: string;
  iconBgColor?: string;
}

const SettingsSidebarLayout: React.FC<SettingsSidebarLayoutProps> = ({
  title,
  description,
  children,
  icon,
  stats,
  headerActions,
  iconColor,
  iconBgColor,
}) => {
  return (
    <div className="flex h-full">
      {/* Desktop Settings Sidebar */}
      <SettingsSidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 space-y-6">
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <SettingsMobileNav />
          </div>
          
          {/* Header - Modern or Simple */}
          {icon ? (
            <ModernSettingsHeader
              icon={icon}
              title={title}
              description={description}
              stats={stats}
              actions={headerActions}
              iconColor={iconColor}
              iconBgColor={iconBgColor}
            />
          ) : (
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
          )}

          {/* Content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebarLayout;
