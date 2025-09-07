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
        const { data, error } = await supabase.functions.invoke('calendar-sync', {
          body: {
            propertyId: property.id,
            calendarUrl,
            platform
          }
        });

        console.log('📡 Function response:', { data, error });

        if (error) {
          console.error('❌ Supabase functions error:', error);
          throw new Error(error.message || 'Function call failed');
        }

        if (!data) {
          throw new Error('No response data received');
        }

        return data;
      } catch (fetchError: any) {
        console.error('🚨 Fetch error details:', {
          message: fetchError.message,
          name: fetchError.name,
          stack: fetchError.stack
        });
        
        // More specific error messages
        if (fetchError.message?.includes('Failed to fetch')) {
          throw new Error('Unable to connect to calendar sync service. Please check your connection and try again.');
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
        title: 'Success',
        description: data?.message || 'Calendar sync added successfully'
      });
    },
    onError: (error: any) => {
      console.error('❌ Calendar sync mutation error:', error);
      toast({
        title: 'Calendar Sync Error',
        description: error.message || 'Failed to add calendar sync. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Manually trigger sync
  const syncCalendarMutation = useMutation({
    mutationFn: async (calendar: ExternalCalendar) => {
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: {
          propertyId: property.id,
          calendarUrl: calendar.calendar_url,
          platform: calendar.platform
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-calendars', property.id] });
      queryClient.invalidateQueries({ queryKey: ['availability', property.id] });
      toast({
        title: 'Success',
        description: 'Calendar synced successfully'
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
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="calendar-url">iCal Calendar URL</Label>
              <div className="flex gap-2">
                <Input
                  id="calendar-url"
                  placeholder="https://www.airbnb.com/calendar/ical/..."
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
              <li><strong>Airbnb:</strong> Host Dashboard → Calendar → Export calendar</li>
              <li><strong>VRBO:</strong> Property Manager → Calendar → Calendar feeds</li>
              <li><strong>Booking.com:</strong> Extranet → Calendar → Export</li>
            </ul>
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
