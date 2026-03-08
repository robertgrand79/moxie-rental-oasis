import React, { useState } from 'react';
import { PLATFORM_CONFIG } from '@/config/platform';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, ExternalLink, RefreshCw, Plus, AlertCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Property } from '@/types/property';

interface CalendarSyncManagerProps {
  property: Property;
}

interface ExternalCalendar {
  id: string;
  platform: string;
  calendar_url: string;
  sync_enabled: boolean;
  sync_status: string;
  last_sync_at: string;
  sync_errors: string[];
}

const CalendarSyncManager = ({ property }: CalendarSyncManagerProps) => {
  const [newCalendarUrl, setNewCalendarUrl] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch external calendars for this property
  const { data: calendars = [], isLoading } = useQuery({
    queryKey: ['external-calendars', property.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_calendars')
        .select('*')
        .eq('property_id', property.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExternalCalendar[];
    }
  });

  // Add new calendar sync
  const addCalendarMutation = useMutation({
    mutationFn: async ({ platform, calendarUrl }: { platform: string; calendarUrl: string }) => {
      console.log('🔄 Starting calendar sync request...', { 
        propertyId: property.id, 
        platform, 
        calendarUrl: calendarUrl.substring(0, 50) + '...' 
      });

      try {
        // Call the edge function to handle calendar sync
        const { data, error } = await supabase.functions.invoke('calendar-sync', {
          body: {
            platform,
            calendarUrl,
            propertyId: property.id
          }
        });

        if (error) {
          console.error('❌ Edge function error:', error);
          throw new Error(error.message || 'Failed to sync calendar');
        }

        if (!data.success) {
          console.error('❌ Calendar sync failed:', data.error);
          throw new Error(data.error || 'Calendar sync failed');
        }

        console.log('✅ Calendar sync successful:', data);
        return data;

      } catch (fetchError: any) {
        console.error('🚨 Error details:', {
          message: fetchError.message,
          name: fetchError.name,
          stack: fetchError.stack
        });
        
        throw fetchError;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Calendar sync successful:', data);
      queryClient.invalidateQueries({ queryKey: ['external-calendars', property.id] });
      queryClient.invalidateQueries({ queryKey: ['availability', property.id] });
      queryClient.invalidateQueries({ queryKey: ['all-availability-blocks'] });
      setNewCalendarUrl('');
      setSelectedPlatform('');
      toast({
        title: 'Calendar Sync Added',
        description: data?.message || 'Calendar sync configured successfully'
      });
    },
    onError: (error: any) => {
      console.error('❌ Calendar sync mutation error:', error);
      toast({
        title: 'Calendar Sync Error',
        description: error.message || 'Failed to add calendar sync. Please check the calendar URL and try again.',
        variant: 'destructive'
      });
    }
  });

  // Manually trigger sync
  const syncCalendarMutation = useMutation({
    mutationFn: async (calendar: ExternalCalendar) => {
      console.log('🔄 Manually syncing calendar...', calendar.platform);

      try {
        // Call the edge function to handle calendar sync
        const { data, error } = await supabase.functions.invoke('calendar-sync', {
          body: {
            platform: calendar.platform,
            calendarUrl: calendar.calendar_url,
            propertyId: property.id
          }
        });

        if (error) {
          console.error('❌ Edge function error:', error);
          throw new Error(error.message || 'Failed to sync calendar');
        }

        if (!data.success) {
          console.error('❌ Calendar sync failed:', data.error);
          throw new Error(data.error || 'Calendar sync failed');
        }

        return data;

      } catch (error: any) {
        // Update with error status
        await supabase
          .from('external_calendars')
          .update({
            sync_status: 'failed',
            sync_errors: [error.message]
          })
          .eq('id', calendar.id);

        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['external-calendars', property.id] });
      queryClient.invalidateQueries({ queryKey: ['availability', property.id] });
      queryClient.invalidateQueries({ queryKey: ['all-availability-blocks'] });
      toast({
        title: 'Sync Complete',
        description: data?.message || 'Calendar synced successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Sync Error',
        description: error.message || 'Failed to sync calendar',
        variant: 'destructive'
      });
    }
  });

  // Delete calendar
  const deleteCalendarMutation = useMutation({
    mutationFn: async (calendarId: string) => {
      const { error } = await supabase
        .from('external_calendars')
        .delete()
        .eq('id', calendarId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-calendars', property.id] });
      queryClient.invalidateQueries({ queryKey: ['availability', property.id] });
      queryClient.invalidateQueries({ queryKey: ['all-availability-blocks'] });
      toast({ title: 'Calendar Removed', description: 'Calendar sync has been removed' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to remove calendar', description: error.message, variant: 'destructive' });
    }
  });

  const handleAddCalendar = () => {
    console.log('🚀 Add calendar button clicked', { selectedPlatform, calendarUrl: newCalendarUrl?.substring(0, 50) + '...' });
    
    if (!selectedPlatform || !newCalendarUrl) {
      console.warn('⚠️ Missing required fields', { selectedPlatform, hasCalendarUrl: !!newCalendarUrl });
      toast({
        title: 'Missing Information',
        description: 'Please select a platform and enter a calendar URL',
        variant: 'destructive'
      });
      return;
    }

    // Validate URL format
    try {
      new URL(newCalendarUrl);
    } catch (urlError) {
      console.error('❌ Invalid URL format:', newCalendarUrl);
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid calendar URL',
        variant: 'destructive'
      });
      return;
    }

    console.log('✅ Starting calendar sync mutation...');
    addCalendarMutation.mutate({
      platform: selectedPlatform,
      calendarUrl: newCalendarUrl
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'synced':
        return 'default';
      case 'syncing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Sync
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Sync
        </CardTitle>
        <CardDescription>
          Sync availability from Airbnb, VRBO, and other platforms using iCal calendar URLs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add New Calendar */}
        <div className="space-y-4">
          <h4 className="font-medium">Add New Calendar</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="vrbo">VRBO</SelectItem>
                  <SelectItem value="booking_com">Booking.com</SelectItem>
                  <SelectItem value="demo">🧪 Demo Mode (Test)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="calendar-url">iCal Calendar URL</Label>
              <div className="flex gap-2">
                <Input
                  id="calendar-url"
                  placeholder={selectedPlatform === 'demo' ? 'Demo mode - any text works for testing' : 'https://www.airbnb.com/calendar/ical/...'}
                  value={newCalendarUrl}
                  onChange={(e) => setNewCalendarUrl(e.target.value)}
                />
                <Button 
                  onClick={handleAddCalendar}
                  disabled={addCalendarMutation.isPending}
                >
                  {addCalendarMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-4">
            {/* Platform-specific instructions based on selection */}
            {selectedPlatform === 'vrbo' && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded">
                <p className="text-purple-800 dark:text-purple-200 text-sm font-medium mb-2">🏠 VRBO Steps:</p>
                <ol className="list-decimal list-inside text-purple-700 dark:text-purple-300 text-xs space-y-1">
                  <li>Log into your <strong>VRBO Owner Dashboard</strong> at vrbo.com</li>
                  <li>Go to <strong>Calendar</strong> → <strong>Import/Export</strong></li>
                  <li>Click <strong>"Export Calendar"</strong></li>
                  <li>Copy the iCal URL (starts with <code className="bg-purple-100 dark:bg-purple-900 px-1 rounded">https://www.vrbo.com/icalendar/...</code>)</li>
                  <li>Paste it here and click the + button</li>
                </ol>
              </div>
            )}

            {selectedPlatform === 'airbnb' && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                <p className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-2">🏡 Airbnb Steps:</p>
                <ol className="list-decimal list-inside text-blue-700 dark:text-blue-300 text-xs space-y-1">
                  <li>Go to your <strong>Airbnb Host Dashboard</strong></li>
                  <li>Select the specific listing you want to sync</li>
                  <li>Go to <strong>Calendar</strong> → <strong>Sync calendars</strong></li>
                  <li>Click <strong>"Export Calendar"</strong> and copy the URL</li>
                  <li>⚠️ Ensure the listing is <strong>active and accepting bookings</strong></li>
                </ol>
              </div>
            )}

            {selectedPlatform === 'booking_com' && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded">
                <p className="text-indigo-800 dark:text-indigo-200 text-sm font-medium mb-2">🌐 Booking.com Steps:</p>
                <ol className="list-decimal list-inside text-indigo-700 dark:text-indigo-300 text-xs space-y-1">
                  <li>Log into your <strong>Booking.com Extranet</strong></li>
                  <li>Go to <strong>Rates & Availability</strong> → <strong>Calendar Sync</strong></li>
                  <li>Find <strong>"Export your calendar"</strong></li>
                  <li>Copy the iCal link provided</li>
                </ol>
              </div>
            )}

            {!selectedPlatform && (
              <p className="text-muted-foreground text-xs">Select a platform above to see setup instructions.</p>
            )}

            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
              <p className="text-green-800 dark:text-green-200 text-sm font-medium mb-2">✅ Test Your URL First:</p>
              <ol className="list-decimal list-inside text-green-700 dark:text-green-300 text-xs space-y-1">
                <li>Copy the calendar export URL from your platform</li>
                <li>Paste it in a new browser tab</li>
                <li>It should download a .ics file — if so, the URL is valid</li>
                <li>Then paste it here and click the + button</li>
              </ol>
            </div>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-2">
                📤 Your Calendar Export URL (Give this to Airbnb/VRBO/Hospitable):
              </p>
              <div className="bg-white dark:bg-gray-900 p-2 rounded border font-mono text-xs break-all mb-2">
                {(() => {
                  const token = (property as any).calendar_export_token;
                  if (token) {
                    return `https://joiovubyokikqjytxtuv.supabase.co/functions/v1/calendar-export?feed=${property.id}_${token}`;
                  }
                  return `https://joiovubyokikqjytxtuv.supabase.co/functions/v1/calendar-export?property_id=${property.id}`;
                })()}
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                ⚠️ Copy the full URL exactly as shown.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const token = (property as any).calendar_export_token;
                    const url = token
                      ? `${PLATFORM_CONFIG.API_BASE_URL}/functions/v1/calendar-export?feed=${property.id}_${token}`
                      : `${PLATFORM_CONFIG.API_BASE_URL}/functions/v1/calendar-export?property_id=${property.id}`;
                    navigator.clipboard.writeText(url);
                    toast({ title: 'Copied!', description: 'Calendar export URL copied to clipboard' });
                  }}
                >
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const token = (property as any).calendar_export_token;
                    const url = token
                      ? `https://joiovubyokikqjytxtuv.supabase.co/functions/v1/calendar-export?feed=${property.id}_${token}`
                      : `https://joiovubyokikqjytxtuv.supabase.co/functions/v1/calendar-export?property_id=${property.id}`;
                    window.open(url, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Test URL
                </Button>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-xs mt-2">
                This secure URL provides your bookings in iCal format. Guest PII is never exposed.
                Copy and paste it in Airbnb/VRBO's calendar import settings to prevent double bookings.
              </p>
            </div>
          </div>
        </div>

        {calendars.length > 0 && (
          <>
            <Separator />
            
            {/* Existing Calendars */}
            <div className="space-y-4">
              <h4 className="font-medium">Connected Calendars</h4>
              
              <div className="space-y-3">
                {calendars.map((calendar) => (
                  <div key={calendar.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {calendar.platform}
                        </Badge>
                        
                        <div className="flex items-center gap-2">
                          {getStatusIcon(calendar.sync_status)}
                          <Badge variant={getStatusVariant(calendar.sync_status)}>
                            {calendar.sync_status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncCalendarMutation.mutate(calendar)}
                          disabled={syncCalendarMutation.isPending}
                        >
                          {syncCalendarMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          Sync Now
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(calendar.calendar_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Calendar</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this {calendar.platform} calendar sync? This will stop syncing availability from this calendar.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCalendarMutation.mutate(calendar.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    {calendar.last_sync_at && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Last synced: {new Date(calendar.last_sync_at).toLocaleString()}
                      </p>
                    )}
                    
                    {calendar.sync_errors && calendar.sync_errors.length > 0 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Sync Errors:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {calendar.sync_errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarSyncManager;
