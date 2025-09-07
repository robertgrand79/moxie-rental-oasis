import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, ExternalLink, RefreshCw, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
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
        // Special handling for demo mode
        if (platform === 'demo') {
          console.log('🧪 Demo mode activated - simulating successful calendar sync');
          
          // Simulate a successful calendar with mock data
          const mockEventCount = 12;
          
          // Store the demo calendar sync in the database
          const { data: calendarData, error: calendarError } = await supabase
            .from('external_calendars')
            .upsert({
              property_id: property.id,
              platform: 'demo',
              calendar_url: 'demo://mock-calendar-for-testing',
              sync_enabled: true,
              sync_status: 'synced',
              last_sync_at: new Date().toISOString(),
              external_property_id: `demo-${property.id}`
            }, {
              onConflict: 'property_id,platform'
            });

          if (calendarError) {
            console.error('❌ Database error:', calendarError);
            throw new Error(`Database error: ${calendarError.message}`);
          }

          return {
            success: true,
            message: `✅ Demo calendar sync completed! Found ${mockEventCount} sample bookings. This demonstrates how calendar sync would work with a real iCal URL.`,
            events: mockEventCount
          };
        }

        // First, let's try to fetch the iCal data directly to test if it's accessible
        console.log('📥 Fetching iCal data directly...');
        const response = await fetch(calendarUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch calendar data: ${response.status} ${response.statusText}`);
        }

        const icalData = await response.text();
        console.log('✅ iCal data fetched successfully, length:', icalData.length);

        // Parse the basic events count for user feedback
        const eventCount = (icalData.match(/BEGIN:VEVENT/g) || []).length;
        console.log('📅 Found events:', eventCount);

        // Store the calendar sync information in the database
        const { data: calendarData, error: calendarError } = await supabase
          .from('external_calendars')
          .upsert({
            property_id: property.id,
            platform: platform,
            calendar_url: calendarUrl,
            sync_enabled: true,
            sync_status: 'pending',
            last_sync_at: new Date().toISOString(),
            external_property_id: `${platform}-${property.id}`
          }, {
            onConflict: 'property_id,platform'
          });

        if (calendarError) {
          console.error('❌ Database error:', calendarError);
          throw new Error(`Database error: ${calendarError.message}`);
        }

        console.log('✅ Calendar sync configured successfully');

        return {
          success: true,
          message: `Calendar sync configured successfully. Found ${eventCount} events. Sync will process in the background.`,
          events: eventCount
        };

      } catch (fetchError: any) {
        console.error('🚨 Error details:', {
          message: fetchError.message,
          name: fetchError.name,
          stack: fetchError.stack
        });
        
        // More specific error messages
        if (fetchError.message?.includes('Failed to fetch calendar data')) {
          throw new Error('Unable to access the calendar URL. Please check that the URL is correct and publicly accessible.');
        } else if (fetchError.message?.includes('NetworkError')) {
          throw new Error('Network error occurred. Please check your internet connection.');
        } else {
          throw fetchError;
        }
      }
    },
    onSuccess: (data) => {
      console.log('✅ Calendar sync successful:', data);
      queryClient.invalidateQueries({ queryKey: ['external-calendars', property.id] });
      queryClient.invalidateQueries({ queryKey: ['availability', property.id] });
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
        // Test if the calendar URL is still accessible
        const response = await fetch(calendar.calendar_url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch calendar data: ${response.status} ${response.statusText}`);
        }

        const icalData = await response.text();
        const eventCount = (icalData.match(/BEGIN:VEVENT/g) || []).length;
        
        // Update the sync status
        const { error: updateError } = await supabase
          .from('external_calendars')
          .update({
            sync_status: 'synced',
            last_sync_at: new Date().toISOString(),
            sync_errors: null
          })
          .eq('id', calendar.id);

        if (updateError) {
          throw new Error(`Failed to update sync status: ${updateError.message}`);
        }

        return {
          success: true,
          message: `Calendar synced successfully. Found ${eventCount} events.`,
          events: eventCount
        };

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
                  <SelectItem value="hospitable">Hospitable</SelectItem>
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

          <div className="text-sm text-muted-foreground">
            <p><strong>How to get calendar URLs:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Airbnb:</strong> Host Dashboard → Calendar → Export calendar → Copy the "Export calendar" link</li>
              <li><strong>VRBO:</strong> Owner Dashboard → Calendar → Calendar feeds → Copy iCal URL</li>
              <li><strong>Booking.com:</strong> Partner Hub → Calendar → Export calendar → Copy iCal link</li>
            </ul>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>⚠️ Important:</strong> The calendar URL you're using appears to return a 404 error. 
                This typically means:
              </p>
              <ul className="list-disc list-inside mt-1 text-yellow-700 text-xs space-y-1">
                <li>The URL has expired or been revoked</li>
                <li>You need to generate a new calendar export link</li>
                <li>The listing may not be active</li>
                <li>Check that you copied the complete URL including any parameters</li>
              </ul>
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 text-sm font-medium mb-2">
                📤 Your Calendar Export URL (Give this to Airbnb/VRBO):
              </p>
              <div className="bg-white p-2 rounded border font-mono text-xs break-all mb-2">
                https://joiovubyokikqjytxtuv.supabase.co/functions/v1/calendar-export?property_id={property.id}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `https://joiovubyokikqjytxtuv.supabase.co/functions/v1/calendar-export?property_id=${property.id}`;
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
                    const url = `https://joiovubyokikqjytxtuv.supabase.co/functions/v1/calendar-export?property_id=${property.id}`;
                    window.open(url, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Test URL
                </Button>
              </div>
              <p className="text-blue-700 text-xs mt-2">
                This URL provides your bookings in iCal format so Airbnb can import them and avoid double bookings.
                Use "Copy URL" to get the link, then paste it in Airbnb's calendar import settings.
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
