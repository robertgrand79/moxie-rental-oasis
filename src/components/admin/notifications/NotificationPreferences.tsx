import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Globe, AlertCircle, Check, X, Download, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotificationPreferences, NOTIFICATION_TYPES } from '@/hooks/useNotificationPreferences';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

const SEND_TIMES = [
  { value: '6:00', hour: 6, minute: 0, label: '6:00 AM' },
  { value: '6:30', hour: 6, minute: 30, label: '6:30 AM' },
  { value: '7:00', hour: 7, minute: 0, label: '7:00 AM' },
  { value: '7:30', hour: 7, minute: 30, label: '7:30 AM' },
  { value: '8:00', hour: 8, minute: 0, label: '8:00 AM' },
  { value: '8:30', hour: 8, minute: 30, label: '8:30 AM' },
  { value: '9:00', hour: 9, minute: 0, label: '9:00 AM' },
  { value: '9:30', hour: 9, minute: 30, label: '9:30 AM' },
  { value: '10:00', hour: 10, minute: 0, label: '10:00 AM' },
];

const NotificationPreferences: React.FC = () => {
  const { 
    preferences, 
    isLoading, 
    getPreference, 
    updatePreference, 
    initializePreferences,
    isUpdating 
  } = useNotificationPreferences();

  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    permission: pushPermission,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  } = usePushNotifications();

  const [digestTimezone, setDigestTimezone] = useState('America/Los_Angeles');
  const [digestSendHour, setDigestSendHour] = useState(7);
  const [digestSendMinute, setDigestSendMinute] = useState(30);
  const [isSavingDigest, setIsSavingDigest] = useState(false);

  // Load user's current digest settings
  useEffect(() => {
    const loadDigestSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('digest_timezone, digest_send_hour, digest_send_minute')
        .eq('id', user.id)
        .single();

      if (profile) {
        setDigestTimezone((profile as any).digest_timezone || 'America/Los_Angeles');
        setDigestSendHour((profile as any).digest_send_hour ?? 7);
        setDigestSendMinute((profile as any).digest_send_minute ?? 30);
      }
    };
    loadDigestSettings();
  }, []);

  const handleSaveDigestSettings = useCallback(async (tz: string, hour: number, minute: number) => {
    setIsSavingDigest(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          digest_timezone: tz, 
          digest_send_hour: hour, 
          digest_send_minute: minute 
        } as any)
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: 'Digest schedule updated', description: `Daily digest will be sent at the selected time.` });
    } catch (err) {
      console.error('Failed to save digest settings:', err);
      toast({ title: 'Failed to save', description: 'Could not update digest schedule.', variant: 'destructive' });
    } finally {
      setIsSavingDigest(false);
    }
  }, []);

  const handleTimezoneChange = (value: string) => {
    setDigestTimezone(value);
    handleSaveDigestSettings(value, digestSendHour, digestSendMinute);
  };

  const handleTimeChange = (value: string) => {
    const time = SEND_TIMES.find(t => t.value === value);
    if (time) {
      setDigestSendHour(time.hour);
      setDigestSendMinute(time.minute);
      handleSaveDigestSettings(digestTimezone, time.hour, time.minute);
    }
  };

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

  const currentTimeValue = `${digestSendHour}:${digestSendMinute === 0 ? '00' : String(digestSendMinute).padStart(2, '0')}`;

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
        {/* Daily Digest Schedule */}
        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Daily Digest Schedule</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Choose when you'd like to receive your daily recap email
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Send Time</label>
              <Select value={currentTimeValue} onValueChange={handleTimeChange} disabled={isSavingDigest}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEND_TIMES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Timezone</label>
              <Select value={digestTimezone} onValueChange={handleTimezoneChange} disabled={isSavingDigest}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

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
        
        {/* Browser Push Notifications Section */}
        <div className="mt-6 p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Browser Push Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Receive notifications even when the browser is closed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!pushSupported ? (
                <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                  <Download className="h-3 w-3" />
                  Available When Installed
                </Badge>
              ) : pushPermission === 'denied' ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Blocked
                </Badge>
              ) : pushSubscribed ? (
                <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                  <Check className="h-3 w-3" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="outline">Disabled</Badge>
              )}
              
              {pushSupported && pushPermission !== 'denied' && (
                <Button
                  variant={pushSubscribed ? "outline" : "default"}
                  size="sm"
                  onClick={() => pushSubscribed ? unsubscribePush() : subscribePush()}
                  disabled={pushLoading}
                >
                  {pushLoading ? 'Loading...' : pushSubscribed ? 'Disable' : 'Enable'}
                </Button>
              )}
            </div>
          </div>
          
          {pushPermission === 'denied' && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md text-sm">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <p className="text-muted-foreground">
                Push notifications are blocked in your browser settings. To enable them, click the lock icon in your browser's address bar and allow notifications.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Channel Descriptions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><strong>In-App:</strong> See notifications in the bell icon on your dashboard</li>
            <li><strong>Instant Email:</strong> Receive an email immediately when the event occurs</li>
            <li><strong>Daily Digest:</strong> Get a summary in your daily recap email</li>
            <li><strong>SMS:</strong> Receive a text message (requires phone number)</li>
            <li><strong>Browser Push:</strong> Desktop/mobile notifications even when browser is closed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;