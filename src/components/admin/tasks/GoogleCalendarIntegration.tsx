
import React, { useState } from 'react';
import { useGoogleCalendarIntegration } from '@/hooks/useGoogleCalendarIntegration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Settings, Download, Upload, Link, Unlink } from 'lucide-react';

const GoogleCalendarIntegration = () => {
  const {
    isConnected,
    calendars,
    events,
    syncSettings,
    loading,
    initiateGoogleAuth,
    importEvents,
    exportTask,
    updateSyncSettings,
    disconnect,
  } = useGoogleCalendarIntegration();

  const [selectedCalendar, setSelectedCalendar] = useState('');

  const handleCalendarSync = async (calendarId: string, action: 'import' | 'export') => {
    if (action === 'import') {
      await importEvents(calendarId);
    }
  };

  const handleSyncSettingsUpdate = async (calendarId: string, updates: any) => {
    await updateSyncSettings({
      google_calendar_id: calendarId,
      calendar_name: calendars.find(c => c.id === calendarId)?.summary || '',
      ...updates,
    });
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Connect your Google Calendar to sync tasks and events between Moxie and Google Calendar.
          </p>
          <Button onClick={initiateGoogleAuth} disabled={loading} className="w-full">
            <Link className="h-4 w-4 mr-2" />
            Connect Google Calendar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            Connected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Select value={selectedCalendar} onValueChange={setSelectedCalendar}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select calendar" />
            </SelectTrigger>
            <SelectContent>
              {calendars.map((calendar) => (
                <SelectItem key={calendar.id} value={calendar.id}>
                  {calendar.summary}
                  {calendar.primary && <Badge className="ml-2">Primary</Badge>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={() => selectedCalendar && handleCalendarSync(selectedCalendar, 'import')}
            disabled={!selectedCalendar || loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Import Events
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Sync Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Google Calendar Sync Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {calendars.map((calendar) => {
                  const settings = syncSettings.find(s => s.google_calendar_id === calendar.id);
                  return (
                    <div key={calendar.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{calendar.summary}</h4>
                          {calendar.primary && <Badge className="mt-1">Primary Calendar</Badge>}
                        </div>
                        <Switch
                          checked={settings?.is_enabled || false}
                          onCheckedChange={(enabled) =>
                            handleSyncSettingsUpdate(calendar.id, { is_enabled: enabled })
                          }
                        />
                      </div>
                      
                      {settings?.is_enabled && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-sm font-medium">Sync Direction</label>
                            <Select
                              value={settings.sync_direction}
                              onValueChange={(direction) =>
                                handleSyncSettingsUpdate(calendar.id, { sync_direction: direction })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="import">Import Only</SelectItem>
                                <SelectItem value="export">Export Only</SelectItem>
                                <SelectItem value="both">Both Ways</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCalendarSync(calendar.id, 'import')}
                              disabled={loading}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Sync Now
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Imported Events Summary */}
        {events.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Imported Events</h4>
            <p className="text-sm text-gray-600 mb-3">
              {events.length} events imported from Google Calendar
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{event.title}</span>
                  <span className="text-gray-500">
                    {event.start_time && new Date(event.start_time).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {events.length > 5 && (
                <p className="text-xs text-gray-500">+{events.length - 5} more events</p>
              )}
            </div>
          </div>
        )}

        {/* Disconnect */}
        <div className="pt-4 border-t">
          <Button variant="outline" onClick={disconnect} className="text-red-600 hover:text-red-700">
            <Unlink className="h-4 w-4 mr-2" />
            Disconnect Google Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarIntegration;
