import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Calendar, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ChevronDown,
  Copy,
  Building2,
  Link2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ExternalCalendar {
  id: string;
  property_id: string;
  platform: string;
  calendar_url: string;
  sync_enabled: boolean;
  sync_status: string;
  last_sync_at: string;
  sync_errors: string[];
}

interface PropertyWithCalendars {
  id: string;
  title: string;
  location: string;
  calendars: ExternalCalendar[];
}

const AdminCalendarSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncingAll, setSyncingAll] = useState(false);

  // Fetch all properties with their external calendars
  const { data: propertiesWithCalendars = [], isLoading } = useQuery({
    queryKey: ['all-calendar-sync'],
    queryFn: async () => {
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, title, location')
        .order('title');
      
      if (propError) throw propError;

      const { data: calendars, error: calError } = await supabase
        .from('external_calendars')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (calError) throw calError;

      return (properties || []).map(prop => ({
        ...prop,
        calendars: (calendars || []).filter(cal => cal.property_id === prop.id)
      })) as PropertyWithCalendars[];
    }
  });

  // Sync single calendar
  const syncCalendarMutation = useMutation({
    mutationFn: async (calendar: ExternalCalendar) => {
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: {
          platform: calendar.platform,
          calendarUrl: calendar.calendar_url,
          propertyId: calendar.property_id
        }
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-calendar-sync'] });
      toast({ title: 'Calendar synced successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Sync failed', description: error.message, variant: 'destructive' });
    }
  });

  // Sync all calendars
  const handleSyncAll = async () => {
    setSyncingAll(true);
    const allCalendars = propertiesWithCalendars.flatMap(p => p.calendars);
    let successCount = 0;
    let errorCount = 0;

    for (const calendar of allCalendars) {
      try {
        await supabase.functions.invoke('calendar-sync', {
          body: {
            platform: calendar.platform,
            calendarUrl: calendar.calendar_url,
            propertyId: calendar.property_id
          }
        });
        successCount++;
      } catch {
        errorCount++;
      }
    }

    queryClient.invalidateQueries({ queryKey: ['all-calendar-sync'] });
    setSyncingAll(false);
    toast({
      title: 'Bulk Sync Complete',
      description: `${successCount} synced, ${errorCount} failed`
    });
  };

  const copyExportUrl = (propertyId: string) => {
    const url = `https://joiovubyokikqjytxtuv.supabase.co/functions/v1/calendar-export?property_id=${propertyId}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: 'Export URL copied to clipboard' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const totalCalendars = propertiesWithCalendars.reduce((sum, p) => sum + p.calendars.length, 0);
  const syncedCalendars = propertiesWithCalendars.reduce(
    (sum, p) => sum + p.calendars.filter(c => c.sync_status === 'synced').length, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar Sync</h1>
          <p className="text-muted-foreground">
            Manage external calendar integrations for all properties
          </p>
        </div>
        <Button onClick={handleSyncAll} disabled={syncingAll || totalCalendars === 0}>
          {syncingAll ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Sync All Calendars
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{propertiesWithCalendars.length}</div>
            <p className="text-sm text-muted-foreground">Total Properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCalendars}</div>
            <p className="text-sm text-muted-foreground">Connected Calendars</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{syncedCalendars}</div>
            <p className="text-sm text-muted-foreground">Successfully Synced</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{totalCalendars - syncedCalendars}</div>
            <p className="text-sm text-muted-foreground">Needs Attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList>
          <TabsTrigger value="properties">By Property</TabsTrigger>
          <TabsTrigger value="instructions">Setup Instructions</TabsTrigger>
          <TabsTrigger value="export">Export URLs</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          {isLoading ? (
            <Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>
          ) : (
            propertiesWithCalendars.map(property => (
              <Card key={property.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">{property.title}</CardTitle>
                        <CardDescription>{property.location}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={property.calendars.length > 0 ? 'default' : 'outline'}>
                      {property.calendars.length} calendar{property.calendars.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                {property.calendars.length > 0 && (
                  <CardContent className="space-y-3">
                    {property.calendars.map(calendar => (
                      <div key={calendar.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(calendar.sync_status)}
                          <Badge variant="outline" className="capitalize">{calendar.platform}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {calendar.last_sync_at 
                              ? `Last sync: ${new Date(calendar.last_sync_at).toLocaleString()}`
                              : 'Never synced'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncCalendarMutation.mutate(calendar)}
                            disabled={syncCalendarMutation.isPending}
                          >
                            <RefreshCw className={`h-4 w-4 ${syncCalendarMutation.isPending ? 'animate-spin' : ''}`} />
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
                    ))}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          {/* VRBO Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏠</span> VRBO / Homeaway
              </CardTitle>
              <CardDescription>How to get your VRBO iCal calendar URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3 text-sm">
                <li>Log into your <strong>VRBO Owner Dashboard</strong> at vrbo.com</li>
                <li>Go to <strong>Calendar</strong> → <strong>Import/Export</strong></li>
                <li>Click <strong>"Export Calendar"</strong></li>
                <li>Copy the iCal URL (starts with <code className="bg-muted px-1 rounded">https://www.vrbo.com/icalendar/...</code>)</li>
                <li>Paste this URL when adding a new calendar sync</li>
              </ol>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>💡 Tip:</strong> If VRBO shows multiple listings, make sure to export the calendar for each listing separately.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Airbnb Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏡</span> Airbnb
              </CardTitle>
              <CardDescription>How to get your Airbnb iCal calendar URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3 text-sm">
                <li>Log into your <strong>Airbnb Host Dashboard</strong></li>
                <li>Select the specific listing you want to sync</li>
                <li>Go to <strong>Calendar</strong> → <strong>Sync calendars</strong></li>
                <li>Click <strong>"Export Calendar"</strong> and copy the URL</li>
                <li>The URL should start with <code className="bg-muted px-1 rounded">https://www.airbnb.com/calendar/ical/...</code></li>
              </ol>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>⚠️ Important:</strong> Make sure the listing is active. If the URL returns a 404 error, regenerate a new export URL from Airbnb.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Booking.com Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🌐</span> Booking.com
              </CardTitle>
              <CardDescription>How to get your Booking.com iCal calendar URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3 text-sm">
                <li>Log into your <strong>Booking.com Extranet</strong></li>
                <li>Go to <strong>Rates & Availability</strong> → <strong>Calendar Sync</strong></li>
                <li>Find <strong>"Export your calendar"</strong></li>
                <li>Copy the iCal link provided</li>
              </ol>
            </CardContent>
          </Card>

          {/* Import Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Importing Your Calendar to OTAs
              </CardTitle>
              <CardDescription>How to send your bookings back to Airbnb, VRBO, etc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To prevent double bookings, you should also import your calendar into each platform. Use the Export URLs tab to get links for each property.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">For Airbnb:</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground ml-4">
                  <li>Go to Calendar → Sync calendars → Import calendar</li>
                  <li>Paste your export URL and give it a name</li>
                </ol>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">For VRBO:</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground ml-4">
                  <li>Go to Calendar → Import/Export → Import</li>
                  <li>Paste your export URL</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Export URLs</CardTitle>
              <CardDescription>
                Share these URLs with Airbnb, VRBO, and other platforms to sync your bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {propertiesWithCalendars.map(property => (
                <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{property.title}</p>
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      https://joiovubyokikqjytxtuv.supabase.co/functions/v1/calendar-export?property_id={property.id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyExportUrl(property.id)}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(`https://joiovubyokikqjytxtuv.supabase.co/functions/v1/calendar-export?property_id=${property.id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCalendarSync;
