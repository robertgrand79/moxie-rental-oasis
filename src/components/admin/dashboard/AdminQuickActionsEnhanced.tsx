import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TrendingUp, Building2, BookOpen, Calendar, Settings, BarChart3, Mail, FileText, Loader2 } from 'lucide-react';

const AdminQuickActionsEnhanced = () => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleActionClick = (actionName: string) => {
    setLoadingAction(actionName);
    // Clear loading state after navigation
    setTimeout(() => setLoadingAction(null), 1000);
  };

  const actions = [
    {
      key: 'add-property',
      icon: Building2,
      label: 'Add New Property',
      path: '/admin/properties?action=add'
    },
    {
      key: 'write-post',
      icon: BookOpen,
      label: 'Write Blog Post',
      path: '/admin/blog-posts?action=add'
    },
    {
      key: 'create-page',
      icon: FileText,
      label: 'Create Page',
      path: '/admin/pages?action=add'
    },
    {
      key: 'create-event',
      icon: Calendar,
      label: 'Create Event',
      path: '/admin/eugene-events?action=add'
    },
    {
      key: 'newsletter',
      icon: Mail,
      label: 'Send Newsletter',
      path: '/admin/newsletter'
    },
    {
      key: 'settings',
      icon: Settings,
      label: 'Update Site Settings',
      path: '/admin/settings'
    },
    {
      key: 'analytics',
      icon: BarChart3,
      label: 'View Analytics',
      path: '/admin/analytics'
    }
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-xl border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const IconComponent = action.icon;
          const isLoading = loadingAction === action.key;
          
          return (
            <Button 
              key={action.key}
              asChild={!isLoading} 
              className="w-full justify-start" 
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {action.label}
                </div>
              ) : (
                <Link 
                  to={action.path}
                  onClick={() => handleActionClick(action.key)}
                  className="flex items-center w-full"
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {action.label}
                </Link>
              )}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AdminQuickActionsEnhanced;
