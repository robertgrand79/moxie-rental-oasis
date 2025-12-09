import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/admin/settings')}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Settings
      </Button>

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
