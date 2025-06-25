
import React from 'react';
import { Shield, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminSetup } from '@/hooks/useAdminSetup';

const AdminAccessSetup = () => {
  const { user, isAdmin } = useAuth();
  const { setupAdminAccess, isSettingUp } = useAdminSetup();

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Authentication Required
          </CardTitle>
          <CardDescription>
            Please log in to access admin features
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Shield className="h-5 w-5" />
            Admin Access Active
          </CardTitle>
          <CardDescription>
            You have full admin permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            All backend features are now available for content management.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Setup Admin Access
        </CardTitle>
        <CardDescription>
          Configure your account with admin permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backend Access Issue Detected</AlertTitle>
          <AlertDescription>
            You need admin permissions to manage events, reviews, gallery items, and points of interest.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Click the button below to set up admin access for your account:
          </p>
          <ul className="text-xs text-gray-500 space-y-1 ml-4">
            <li>• Enable event management</li>
            <li>• Allow review creation/deletion</li>
            <li>• Fix property image loading</li>
            <li>• Enable lifestyle gallery updates</li>
            <li>• Allow points of interest management</li>
          </ul>
        </div>

        <Button 
          onClick={setupAdminAccess}
          disabled={isSettingUp}
          className="w-full"
        >
          {isSettingUp ? 'Setting up...' : 'Setup Admin Access'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminAccessSetup;
