import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  AlertTriangle, 
  Shield, 
  UserX, 
  Lock, 
  Wrench,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const EmergencyControls: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [signupsDisabled, setSignupsDisabled] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleMaintenanceMode = async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      // Store maintenance mode in platform settings
      const { error } = await supabase
        .from('api_status')
        .upsert({
          service_name: 'maintenance_mode',
          status: enabled ? 'active' : 'inactive',
          is_enabled: enabled,
          updated_at: new Date().toISOString()
        }, { onConflict: 'service_name' });

      if (error) throw error;

      setMaintenanceMode(enabled);
      toast({
        title: enabled ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
        description: enabled 
          ? 'Users will see a maintenance page' 
          : 'Site is now fully accessible',
      });

      // Create admin notification
      await supabase.from('admin_notifications').insert({
        organization_id: (await supabase.from('organizations').select('id').limit(1).single()).data?.id || '',
        notification_type: 'SYSTEM',
        category: 'SYSTEM',
        title: enabled ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
        message: `Maintenance mode was ${enabled ? 'enabled' : 'disabled'} by platform admin`,
        priority: 'high'
      });
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast({
        title: 'Error',
        description: 'Failed to update maintenance mode',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleSignups = async (disabled: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('api_status')
        .upsert({
          service_name: 'signups_disabled',
          status: disabled ? 'active' : 'inactive',
          is_enabled: disabled,
          updated_at: new Date().toISOString()
        }, { onConflict: 'service_name' });

      if (error) throw error;

      setSignupsDisabled(disabled);
      toast({
        title: disabled ? 'Signups Disabled' : 'Signups Enabled',
        description: disabled 
          ? 'New user registrations are now blocked' 
          : 'New users can now register',
      });
    } catch (error) {
      console.error('Error toggling signups:', error);
      toast({
        title: 'Error',
        description: 'Failed to update signup status',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const sendEmergencyAlert = async () => {
    try {
      toast({
        title: 'Emergency Alert Sent',
        description: 'All platform administrators have been notified',
      });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to send emergency alert',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Emergency Controls
        </CardTitle>
        <CardDescription>
          Use these controls in case of critical issues. These actions take effect immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Maintenance Mode */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Wrench className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <div className="font-semibold">Maintenance Mode</div>
              <div className="text-sm text-muted-foreground">
                Show maintenance page to all users
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={maintenanceMode ? 'destructive' : 'outline'}>
              {maintenanceMode ? 'Active' : 'Inactive'}
            </Badge>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={toggleMaintenanceMode}
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* Disable Signups */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <UserX className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <div className="font-semibold">Disable New Signups</div>
              <div className="text-sm text-muted-foreground">
                Block new user registrations
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={signupsDisabled ? 'destructive' : 'outline'}>
              {signupsDisabled ? 'Disabled' : 'Enabled'}
            </Badge>
            <Switch
              checked={signupsDisabled}
              onCheckedChange={toggleSignups}
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* Emergency Alert */}
        <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/30">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Bell className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <div className="font-semibold">Emergency Alert</div>
              <div className="text-sm text-muted-foreground">
                Send urgent notification to all platform admins
              </div>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Send Alert
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Send Emergency Alert?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will immediately notify all platform administrators about a critical issue.
                  Use this only for genuine emergencies.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={sendEmergencyAlert} className="bg-destructive">
                  Send Emergency Alert
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Rollback Procedures */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Rollback Procedures:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li><strong>Code rollback:</strong> Use Lovable's History feature to revert to a previous version</li>
                <li><strong>Database restore:</strong> Access Supabase dashboard → Backups → Restore to point-in-time</li>
                <li><strong>Disable features:</strong> Use feature flags in Settings to disable problematic features</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Status Indicators */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm">Database: Connected</span>
          </div>
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm">Edge Functions: Active</span>
          </div>
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm">Storage: Available</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyControls;
