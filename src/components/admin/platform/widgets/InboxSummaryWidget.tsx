import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Inbox, Ticket, MessageSquare, ArrowRight, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface InboxItem {
  id: string;
  type: string;
  subject: string;
  ticket_number: string | null;
  status: string;
  priority: string | null;
  created_at: string;
}

const InboxSummaryWidget: React.FC = () => {
  const navigate = useNavigate();

  const { data: inboxStats, isLoading } = useQuery({
    queryKey: ['platform-inbox-summary'],
    queryFn: async () => {
      // Get open tickets count
      const { count: openTickets } = await supabase
        .from('platform_inbox')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'support')
        .eq('status', 'open');
      
      // Get unread feedback count
      const { count: unreadFeedback } = await supabase
        .from('platform_inbox')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'feedback')
        .eq('is_read', false);
      
      // Get recent items
      const { data } = await supabase
        .from('platform_inbox')
        .select('*')
        .or('status.eq.open,is_read.eq.false')
        .order('created_at', { ascending: false })
        .limit(3);

      const recentItems: InboxItem[] = (data || []).map((item) => ({
        id: item.id,
        type: item.type,
        subject: item.subject || '',
        ticket_number: item.ticket_number,
        status: item.status,
        priority: item.priority,
        created_at: item.created_at,
      }));

      return {
        openTickets: openTickets || 0,
        unreadFeedback: unreadFeedback || 0,
        recentItems,
      };
    },
  });

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Platform Inbox
          </CardTitle>
          {inboxStats && (inboxStats.openTickets > 0 || inboxStats.unreadFeedback > 0) && (
            <Badge variant="destructive" className="text-xs">
              {inboxStats.openTickets + inboxStats.unreadFeedback} pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
                <div className="p-1.5 rounded-full bg-orange-100">
                  <Ticket className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{inboxStats?.openTickets || 0}</p>
                  <p className="text-xs text-muted-foreground">Open Tickets</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
                <div className="p-1.5 rounded-full bg-blue-100">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{inboxStats?.unreadFeedback || 0}</p>
                  <p className="text-xs text-muted-foreground">New Feedback</p>
                </div>
              </div>
            </div>

            {/* Recent Items */}
            {inboxStats?.recentItems && inboxStats.recentItems.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recent Items
                </p>
                {inboxStats.recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/platform/inbox?id=${item.id}`)}
                  >
                    {item.type === 'support' ? (
                      <Ticket className={cn('h-4 w-4 mt-0.5', getPriorityColor(item.priority))} />
                    ) : (
                      <MessageSquare className="h-4 w-4 mt-0.5 text-blue-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{item.subject}</p>
                        {item.priority === 'urgent' && (
                          <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {item.ticket_number && (
                          <span className="font-mono">{item.ticket_number}</span>
                        )}
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                <Inbox className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Inbox is clear!</p>
              </div>
            )}
          </>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-xs"
          onClick={() => navigate('/admin/platform/inbox')}
        >
          Open Inbox
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default InboxSummaryWidget;
