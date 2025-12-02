import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Send, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduledMessage {
  id: string;
  reservation_id: string;
  scheduled_for: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  message_templates?: { name: string; subject: string } | null;
  property_reservations?: { 
    guest_name: string; 
    check_in_date: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { 
    label: 'Pending', 
    icon: <Clock className="h-3.5 w-3.5" />, 
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
  },
  sent: { 
    label: 'Sent', 
    icon: <CheckCircle className="h-3.5 w-3.5" />, 
    className: 'bg-green-500/10 text-green-600 border-green-500/20' 
  },
  failed: { 
    label: 'Failed', 
    icon: <XCircle className="h-3.5 w-3.5" />, 
    className: 'bg-red-500/10 text-red-600 border-red-500/20' 
  },
  cancelled: { 
    label: 'Cancelled', 
    icon: <XCircle className="h-3.5 w-3.5" />, 
    className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' 
  },
};

const ScheduledQueueTab = () => {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['scheduled-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .select(`
          *,
          message_templates(name, subject),
          property_reservations(guest_name, check_in_date)
        `)
        .order('scheduled_for', { ascending: true })
        .limit(50);
      
      if (error) throw error;
      return data as ScheduledMessage[];
    },
  });

  const pendingMessages = messages?.filter(m => m.status === 'pending') || [];
  const sentMessages = messages?.filter(m => m.status === 'sent') || [];
  const failedMessages = messages?.filter(m => m.status === 'failed') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderMessageCard = (message: ScheduledMessage) => {
    const statusConfig = STATUS_CONFIG[message.status] || STATUS_CONFIG.pending;

    return (
      <Card key={message.id} className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {message.property_reservations?.guest_name || 'Unknown Guest'}
                </span>
                <Badge variant="outline" className={statusConfig.className}>
                  {statusConfig.icon}
                  <span className="ml-1">{statusConfig.label}</span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {message.message_templates?.name || 'Unknown Template'}
              </p>
              <p className="text-xs text-muted-foreground">
                Check-in: {message.property_reservations?.check_in_date || 'N/A'}
              </p>
            </div>
            <div className="text-right text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(message.scheduled_for), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(message.scheduled_for), 'h:mm a')}
              </div>
            </div>
          </div>
          {message.error_message && (
            <p className="text-xs text-destructive mt-2 p-2 bg-destructive/10 rounded">
              {message.error_message}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Scheduled Queue</h3>
        <p className="text-sm text-muted-foreground">
          View and manage upcoming automated messages
        </p>
      </div>

      {/* Pending Messages */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base">Pending</CardTitle>
            <Badge variant="secondary">{pendingMessages.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pendingMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Send className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No pending messages</p>
              <p className="text-sm">Messages will appear here when rules trigger</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMessages.map(renderMessageCard)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sent Messages */}
      {sentMessages.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">Recently Sent</CardTitle>
              <Badge variant="secondary">{sentMessages.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentMessages.slice(0, 10).map(renderMessageCard)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Messages */}
      {failedMessages.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-base">Failed</CardTitle>
              <Badge variant="secondary">{failedMessages.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failedMessages.map(renderMessageCard)}
            </div>
          </CardContent>
        </Card>
      )}

      {!messages?.length && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Send className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">No scheduled messages yet</h4>
            <p className="text-sm text-muted-foreground max-w-md">
              When messaging rules are triggered by bookings, scheduled messages will appear here.
              Create rules in the "Messaging Rules" tab to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduledQueueTab;
