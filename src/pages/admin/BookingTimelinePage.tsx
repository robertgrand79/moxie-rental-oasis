import React, { useState } from 'react';
import { UnifiedCalendarView } from '@/components/booking/UnifiedCalendarView';
import { MonthlyGridCalendar } from '@/components/booking/MonthlyGridCalendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  CalendarDays, 
  LayoutGrid, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Copy,
  Building2,
  Link2,
  Plus,
  Trash2,
  Upload,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { PriceLabsSettings } from '@/components/admin/settings/PriceLabsSettings';
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
import { usePropertyFetch } from '@/hooks/usePropertyFetch';

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

const PLATFORM_OPTIONS = [
  { value: 'vrbo', label: 'VRBO / Homeaway', icon: '🏠' },
  { value: 'airbnb', label: 'Airbnb', icon: '🏡' },
  { value: 'booking', label: 'Booking.com', icon: '🌐' },
  { value: 'other', label: 'Other iCal', icon: '📅' },
];

const getPlatformInstructions = (platform: string) => {
  switch (platform) {
    case 'vrbo':
      return {
        title: 'VRBO Calendar URL',
        steps: [
          'Log into your VRBO Owner Dashboard at vrbo.com',
          'Go to Calendar → Import/Export',
          'Click "Export Calendar"',
          'Copy the iCal URL (starts with https://www.vrbo.com/icalendar/...)',
        ],
        tip: 'If VRBO shows multiple listings, export each listing\'s calendar separately.',
      };
    case 'airbnb':
      return {
        title: 'Airbnb Calendar URL',
        steps: [
          'Log into your Airbnb Host Dashboard',
          'Select the specific listing',
          'Go to Calendar → Sync calendars',
          'Click "Export Calendar" and copy the URL',
        ],
        tip: 'Make sure the listing is active. Regenerate the URL if you get 404 errors.',
      };
    case 'booking':
      return {
        title: 'Booking.com Calendar URL',
        steps: [
          'Log into your Booking.com Extranet',
          'Go to Rates & Availability → Calendar Sync',
          'Find "Export your calendar"',
          'Copy the iCal link provided',
        ],
        tip: 'Calendar sync may take a few minutes to appear after enabling.',
      };
    default:
      return {
        title: 'iCal Calendar URL',
        steps: ['Paste any valid iCal/ICS calendar URL'],
        tip: 'URL should end in .ics or contain /ical/',
      };
  }
};

const BookingTimelinePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncingAll, setSyncingAll] = useState(false);
  
  // Form state for adding new calendars
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [newCalendarUrl, setNewCalendarUrl] = useState('');

  const handleAddBooking = (propertyId: string, date: string) => {
    console.log('Add booking for property:', propertyId, 'on date:', date);
  };

  // Get organization-scoped properties
  const { properties: orgProperties = [], loading: propertiesLoading } = usePropertyFetch();
  const propertyIds = orgProperties.map(p => p.id);

  // Fetch external calendars for organization properties
  const { data: propertiesWithCalendars = [], isLoading: calendarsLoading } = useQuery({
    queryKey: ['all-calendar-sync', propertyIds],
    queryFn: async () => {
      if (propertyIds.length === 0) return [];

      const { data: calendars, error: calError } = await supabase
        .from('external_calendars')
        .select('*')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false });
      
      if (calError) throw calError;

      return orgProperties.map(prop => ({
        id: prop.id,
        title: prop.title,
        location: prop.location || '',
        calendars: (calendars || []).filter(cal => cal.property_id === prop.id)
      })) as PropertyWithCalendars[];
    },
    enabled: propertyIds.length > 0
  });

  const isLoading = propertiesLoading || calendarsLoading;

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
      queryClient.invalidateQueries({ queryKey: ['all-availability-blocks'] });
      toast({ title: 'Calendar synced successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Sync failed', description: error.message, variant: 'destructive' });
    }
  });

  // Add new calendar
  const addCalendarMutation = useMutation({
    mutationFn: async ({ propertyId, platform, calendarUrl }: { propertyId: string; platform: string; calendarUrl: string }) => {
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: { platform, calendarUrl, propertyId }
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-calendar-sync'] });
      queryClient.invalidateQueries({ queryKey: ['all-availability-blocks'] });
      setSelectedPropertyId('');
      setSelectedPlatform('');
      setNewCalendarUrl('');
      toast({ title: 'Calendar Added', description: 'Calendar sync configured successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to add calendar', description: error.message, variant: 'destructive' });
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
      queryClient.invalidateQueries({ queryKey: ['all-calendar-sync'] });
      queryClient.invalidateQueries({ queryKey: ['all-availability-blocks'] });
      toast({ title: 'Calendar Removed', description: 'Calendar sync has been removed' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to remove calendar', description: error.message, variant: 'destructive' });
    }
  });

  const handleAddCalendar = () => {
    if (!selectedPropertyId || !selectedPlatform || !newCalendarUrl) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    addCalendarMutation.mutate({ propertyId: selectedPropertyId, platform: selectedPlatform, calendarUrl: newCalendarUrl });
  };

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
    queryClient.invalidateQueries({ queryKey: ['all-availability-blocks'] });
    setSyncingAll(false);
    toast({
      title: 'Bulk Sync Complete',
      description: `${successCount} synced, ${errorCount} failed`
    });
  };

  const copyExportUrl = (propertyId: string) => {
    const url = `${PLATFORM_CONFIG.API_BASE_URL}/functions/v1/calendar-export?property_id=${propertyId}`;
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
          <h1 className="text-3xl font-bold">Calendar Management</h1>
          <p className="text-muted-foreground">
            View bookings, manage pricing, and sync external calendars
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
      
        <Tabs defaultValue="calendar" className="w-full min-w-0">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Monthly
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="sync" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Upload className="h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="mt-6 w-full min-w-0 overflow-x-hidden">
          <UnifiedCalendarView />
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-6">
          <MonthlyGridCalendar />
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <PriceLabsSettings />
        </TabsContent>

        <TabsContent value="sync" className="mt-6 space-y-4">
          {/* Add New Calendar Form */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Calendar
              </CardTitle>
              <CardDescription>Connect an external calendar from VRBO, Airbnb, or Booking.com</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Property</Label>
                  <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property..." />
                    </SelectTrigger>
                    <SelectContent>
                      {propertiesWithCalendars.map(property => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORM_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <span>{opt.icon}</span>
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Calendar URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://..."
                      value={newCalendarUrl}
                      onChange={(e) => setNewCalendarUrl(e.target.value)}
                    />
                    <Button 
                      onClick={handleAddCalendar} 
                      disabled={addCalendarMutation.isPending || !selectedPropertyId || !selectedPlatform || !newCalendarUrl}
                    >
                      {addCalendarMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Context-aware instructions */}
              {selectedPlatform && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="font-medium text-sm mb-2">{getPlatformInstructions(selectedPlatform).title}</p>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    {getPlatformInstructions(selectedPlatform).steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    💡 {getPlatformInstructions(selectedPlatform).tip}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Calendars List */}
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
                    ))}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="export" className="mt-6 space-y-4">
          {/* Export URLs */}
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
                      {PLATFORM_CONFIG.API_BASE_URL}/functions/v1/calendar-export?property_id={property.id}
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
                      onClick={() => window.open(`${PLATFORM_CONFIG.API_BASE_URL}/functions/v1/calendar-export?property_id=${property.id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Platform Setup Instructions
              </CardTitle>
              <CardDescription>How to get calendar URLs from each platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* VRBO */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="text-xl">🏠</span> VRBO / Homeaway
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Log into your VRBO Owner Dashboard at vrbo.com</li>
                  <li>Go to Calendar → Import/Export</li>
                  <li>Click "Export Calendar"</li>
                  <li>Copy the iCal URL</li>
                </ol>
              </div>

              {/* Airbnb */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="text-xl">🏡</span> Airbnb
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Log into your Airbnb Host Dashboard</li>
                  <li>Select the specific listing</li>
                  <li>Go to Calendar → Sync calendars</li>
                  <li>Click "Export Calendar" and copy the URL</li>
                </ol>
              </div>

              {/* Booking.com */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="text-xl">🌐</span> Booking.com
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Log into your Booking.com Extranet</li>
                  <li>Go to Rates & Availability → Calendar Sync</li>
                  <li>Find "Export your calendar"</li>
                  <li>Copy the iCal link provided</li>
                </ol>
              </div>

              {/* Import Instructions */}
              <div className="p-4 bg-muted/50 rounded-lg border mt-4">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Link2 className="h-4 w-4" />
                  Importing Your Calendar to OTAs
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  To prevent double bookings, import your export URL into each platform:
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Airbnb:</strong> Calendar → Sync calendars → Import calendar</p>
                  <p><strong>VRBO:</strong> Calendar → Import/Export → Import</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingTimelinePage;
