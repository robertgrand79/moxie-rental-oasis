
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

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your vacation rental business today.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <EnhancedButton
              onClick={() => navigate('/admin/settings')}
              variant="secondary"
              icon={<Settings className="h-4 w-4" />}
            >
              Settings
            </EnhancedButton>
            
            <EnhancedButton
              onClick={() => navigate('/admin/analytics')}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              icon={<BarChart3 className="h-4 w-4" />}
            >
              Analytics
            </EnhancedButton>
            
            <EnhancedButton
              onClick={() => navigate('/admin/users')}
              variant="ghost"
              className="text-white hover:bg-white/20"
              icon={<Users className="h-4 w-4" />}
            >
              Users
            </EnhancedButton>
          </div>
        </div>
        
        <div className="mt-6 flex items-center space-x-2 text-blue-100">
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
