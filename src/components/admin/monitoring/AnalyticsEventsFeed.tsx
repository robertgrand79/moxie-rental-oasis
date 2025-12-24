import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Search, 
  RefreshCw,
  User,
  Home,
  CreditCard,
  Eye,
  Calendar,
  MessageSquare,
  UserPlus,
  Globe
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface AnalyticsEvent {
  id: string;
  event_name: string;
  properties: Record<string, unknown> | null;
  user_id: string | null;
  session_id: string | null;
  organization_id: string | null;
  created_at: string;
}

interface AnalyticsEventsFeedProps {
  showAllTenants?: boolean;
}

const AnalyticsEventsFeed: React.FC<AnalyticsEventsFeedProps> = ({ showAllTenants = false }) => {
  const { organization } = useCurrentOrganization();
  const organizationId = organization?.id;
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['analytics-events', organizationId, showAllTenants, eventFilter],
    queryFn: async () => {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!showAllTenants && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      if (eventFilter !== 'all') {
        query = query.ilike('event_name', `%${eventFilter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AnalyticsEvent[];
    },
    enabled: showAllTenants || !!organizationId,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const getEventIcon = (eventName: string) => {
    if (eventName.includes('property')) return Home;
    if (eventName.includes('booking') || eventName.includes('reservation')) return Calendar;
    if (eventName.includes('payment') || eventName.includes('subscription')) return CreditCard;
    if (eventName.includes('view') || eventName.includes('page')) return Eye;
    if (eventName.includes('chat') || eventName.includes('message')) return MessageSquare;
    if (eventName.includes('signup') || eventName.includes('register')) return UserPlus;
    if (eventName.includes('user') || eventName.includes('profile')) return User;
    return Activity;
  };

  const getEventColor = (eventName: string) => {
    if (eventName.includes('error') || eventName.includes('fail')) return 'text-destructive';
    if (eventName.includes('success') || eventName.includes('complete')) return 'text-green-600';
    if (eventName.includes('booking') || eventName.includes('payment')) return 'text-primary';
    return 'text-muted-foreground';
  };

  const filteredEvents = events?.filter(event =>
    event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const eventCategories = [
    { value: 'all', label: 'All Events' },
    { value: 'property', label: 'Property Events' },
    { value: 'booking', label: 'Booking Events' },
    { value: 'user', label: 'User Events' },
    { value: 'page', label: 'Page Views' },
    { value: 'chat', label: 'Chat Events' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Feed
              <Badge variant="outline" className="ml-2">
                {filteredEvents.length} events
              </Badge>
            </CardTitle>
            <CardDescription>
              Real-time analytics events and user actions
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter events" />
            </SelectTrigger>
            <SelectContent>
              {eventCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No events found
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredEvents.map((event) => {
                const Icon = getEventIcon(event.event_name);
                const colorClass = getEventColor(event.event_name);
                
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-muted ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {event.event_name.replace(/_/g, ' ')}
                        </span>
                        {showAllTenants && event.organization_id && (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Org
                          </Badge>
                        )}
                      </div>
                      {event.properties && Object.keys(event.properties).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {JSON.stringify(event.properties).slice(0, 100)}...
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
                        {event.user_id && (
                          <>
                            <span>•</span>
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{event.user_id.slice(0, 8)}...</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsEventsFeed;
