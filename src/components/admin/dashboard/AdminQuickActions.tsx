
import React from 'react';
import { Plus, Users, Settings, FileText, Calendar, Camera, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useNavigate } from 'react-router-dom';

const AdminQuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Add Property',
      description: 'Create a new vacation rental listing',
      icon: <Plus className="h-4 w-4" />,
      action: () => navigate('/admin/properties?action=create'),
      variant: 'gradient' as const,
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <Users className="h-4 w-4" />,
      action: () => navigate('/admin/users'),
      variant: 'default' as const,
    },
    {
      title: 'Site Settings',
      description: 'Configure website settings',
      icon: <Settings className="h-4 w-4" />,
      action: () => navigate('/admin/settings'),
      variant: 'secondary' as const,
    },
    {
      title: 'Add Blog Post',
      description: 'Create new blog content',
      icon: <FileText className="h-4 w-4" />,
      action: () => navigate('/admin/blog?action=create'),
      variant: 'outline' as const,
    },
    {
      title: 'Add Event',
      description: 'Create a new Eugene event',
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigate('/admin/events?action=create'),
      variant: 'default' as const,
    },
    {
      title: 'Add Gallery Item',
      description: 'Upload to lifestyle gallery',
      icon: <Camera className="h-4 w-4" />,
      action: () => navigate('/admin/lifestyle?action=create'),
      variant: 'secondary' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common administrative tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <EnhancedButton
              key={index}
              onClick={action.action}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-center text-center space-y-2"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                {action.icon}
              </div>
              <div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs opacity-80">{action.description}</div>
              </div>
            </EnhancedButton>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminQuickActions;
