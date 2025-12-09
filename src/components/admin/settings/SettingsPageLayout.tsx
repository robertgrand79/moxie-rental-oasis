import React from 'react';
import SettingsNavTabs from './SettingsNavTabs';

interface SettingsPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingsPageLayout: React.FC<SettingsPageLayoutProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Tab Navigation */}
      <SettingsNavTabs />

      {/* Content */}
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
};

export default SettingsPageLayout;
