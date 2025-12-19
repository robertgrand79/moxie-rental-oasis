import React from 'react';
import { Bell } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import NotificationPreferences from '@/components/admin/notifications/NotificationPreferences';

const NotificationsSettingsPage = () => {
  return (
    <SettingsSidebarLayout 
      title="Notifications" 
      description="Configure notification preferences"
      icon={Bell}
    >
      <NotificationPreferences />
    </SettingsSidebarLayout>
  );
};

export default NotificationsSettingsPage;
