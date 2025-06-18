
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, BarChart3, Users, Zap } from 'lucide-react';

const AdminWelcomeSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Card className="bg-gradient-to-r from-slate-100 to-gray-100 border border-gray-200">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Here's what's happening with your vacation rental business today.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <EnhancedButton
              onClick={() => handleNavigation('/admin/settings')}
              variant="secondary"
              icon={<Settings className="h-4 w-4" />}
            >
              Settings
            </EnhancedButton>
            
            <EnhancedButton
              onClick={() => handleNavigation('/admin/analytics')}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              icon={<BarChart3 className="h-4 w-4" />}
            >
              Analytics
            </EnhancedButton>
            
            <EnhancedButton
              onClick={() => handleNavigation('/admin/users')}
              variant="ghost"
              className="text-gray-700 hover:bg-gray-200/50"
              icon={<Users className="h-4 w-4" />}
            >
              Users
            </EnhancedButton>
          </div>
        </div>
        
        <div className="mt-6 flex items-center space-x-2 text-gray-500">
          <Zap className="h-4 w-4" />
          <span className="text-sm">
            System is running smoothly • Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminWelcomeSection;
