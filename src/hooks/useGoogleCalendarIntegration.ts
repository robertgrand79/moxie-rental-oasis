
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  accessRole: string;
}

interface GoogleCalendarEvent {
  id: string;
  google_event_id: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  location?: string;
}

interface SyncSettings {
  id: string;
  google_calendar_id: string;
  calendar_name: string;
  is_enabled: boolean;
  sync_direction: 'import' | 'export' | 'both';
  sync_task_types: string[];
}

export const useGoogleCalendarIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [syncSettings, setSyncSettings] = useState<SyncSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkConnection = async () => {
    try {
      const { data: tokenData } = await supabase
        .from('google_calendar_tokens')
        .select('*')
        .single();

      setIsConnected(!!tokenData);
      return !!tokenData;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  };

  const initiateGoogleAuth = () => {
    const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // This should be set in environment variables
    const redirectUri = `${window.location.origin}/admin/task-management`;
    const scope = 'https://www.googleapis.com/auth/calendar';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;

    window.location.href = authUrl;
  };

  const handleAuthCallback = async (code: string) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('google-calendar-auth', {
        body: {
          action: 'exchange_code',
          code,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setIsConnected(true);
      await loadCalendars();
      
      toast({
        title: 'Success',
        description: 'Google Calendar connected successfully',
      });
    } catch (error) {
      console.error('Auth callback error:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCalendars = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'list_calendars',
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setCalendars(response.data.calendars || []);
    } catch (error) {
      console.error('Load calendars error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Google Calendars',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const importEvents = async (calendarId: string) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'import_events',
          calendar_id: calendarId,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      await loadEvents();
      
      toast({
        title: 'Success',
        description: `Imported ${response.data.imported} events`,
      });
    } catch (error) {
      console.error('Import events error:', error);
      toast({
        title: 'Error',
        description: 'Failed to import calendar events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportTask = async (task: any, calendarId: string) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'export_task',
          calendar_id: calendarId,
          task_data: task,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: 'Success',
        description: 'Task exported to Google Calendar',
      });
    } catch (error) {
      console.error('Export task error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export task to Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('google_calendar_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Load events error:', error);
    }
  };

  const loadSyncSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('google_calendar_sync_settings')
        .select('*');

      if (error) throw error;
      
      // Cast the sync_direction to ensure type safety
      const typedData = (data || []).map(item => ({
        ...item,
        sync_direction: item.sync_direction as 'import' | 'export' | 'both'
      }));
      
      setSyncSettings(typedData);
    } catch (error) {
      console.error('Load sync settings error:', error);
    }
  };

  const updateSyncSettings = async (settings: Partial<SyncSettings> & { 
    google_calendar_id: string;
    calendar_name: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure all required fields are present
      const syncData = {
        user_id: user.id,
        google_calendar_id: settings.google_calendar_id,
        calendar_name: settings.calendar_name,
        is_enabled: settings.is_enabled ?? true,
        sync_direction: settings.sync_direction ?? 'both' as const,
        sync_task_types: settings.sync_task_types ?? [],
      };

      const { error } = await supabase
        .from('google_calendar_sync_settings')
        .upsert(syncData, { onConflict: 'user_id,google_calendar_id' });

      if (error) throw error;
      
      await loadSyncSettings();
      toast({
        title: 'Success',
        description: 'Sync settings updated',
      });
    } catch (error) {
      console.error('Update sync settings error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sync settings',
        variant: 'destructive',
      });
    }
  };

  const disconnect = async () => {
    try {
      const { error } = await supabase
        .from('google_calendar_tokens')
        .delete()
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      setIsConnected(false);
      setCalendars([]);
      setEvents([]);
      setSyncSettings([]);
      
      toast({
        title: 'Success',
        description: 'Google Calendar disconnected',
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect Google Calendar',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check for auth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      loadCalendars();
      loadEvents();
      loadSyncSettings();
    }
  }, [isConnected]);

  return {
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
    checkConnection,
  };
};
