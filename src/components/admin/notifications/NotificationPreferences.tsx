import React, { useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotificationPreferences, NOTIFICATION_TYPES } from '@/hooks/useNotificationPreferences';

const NotificationPreferences: React.FC = () => {
  const { 
    preferences, 
    isLoading, 
    getPreference, 
    updatePreference, 
    initializePreferences,
    isUpdating 
  } = useNotificationPreferences();

  // Initialize preferences on first load
  useEffect(() => {
    if (!isLoading && preferences.length < NOTIFICATION_TYPES.length) {
      initializePreferences();
    }
  }, [isLoading, preferences.length]);

  const handleToggle = (
    notificationType: string, 
    field: 'in_app' | 'email_instant' | 'email_digest' | 'sms', 
    currentValue: boolean
  ) => {
    updatePreference({ notificationType, field, value: !currentValue });
  };

  const getDefaultValue = (field: string): boolean => {
    switch (field) {
      case 'in_app': return true;
      case 'email_instant': return false;
      case 'email_digest': return true;
      case 'sms': return false;
      default: return false;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to be notified about different events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Event Type</TableHead>
                <TableHead className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Bell className="h-4 w-4" />
                    <span className="text-xs">In-App</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs">Instant Email</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs">Daily Digest</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-xs">SMS</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {NOTIFICATION_TYPES.map(({ type, label, description }) => {
                const pref = getPreference(type);
                return (
                  <TableRow key={type}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={pref?.in_app ?? getDefaultValue('in_app')}
                        onCheckedChange={() => handleToggle(type, 'in_app', pref?.in_app ?? getDefaultValue('in_app'))}
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={pref?.email_instant ?? getDefaultValue('email_instant')}
                        onCheckedChange={() => handleToggle(type, 'email_instant', pref?.email_instant ?? getDefaultValue('email_instant'))}
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={pref?.email_digest ?? getDefaultValue('email_digest')}
                        onCheckedChange={() => handleToggle(type, 'email_digest', pref?.email_digest ?? getDefaultValue('email_digest'))}
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={pref?.sms ?? getDefaultValue('sms')}
                        onCheckedChange={() => handleToggle(type, 'sms', pref?.sms ?? getDefaultValue('sms'))}
                        disabled={isUpdating}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Channel Descriptions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><strong>In-App:</strong> See notifications in the bell icon on your dashboard</li>
            <li><strong>Instant Email:</strong> Receive an email immediately when the event occurs</li>
            <li><strong>Daily Digest:</strong> Get a summary in your daily recap email</li>
            <li><strong>SMS:</strong> Receive a text message (requires phone number)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
