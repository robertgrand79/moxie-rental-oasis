import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Search, 
  Building2,
  Clock,
  Download,
  RefreshCw,
  CheckCircle,
  Circle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface ImpersonationSession {
  id: string;
  admin_user_id: string;
  target_organization_id: string;
  target_user_id: string | null;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
  user_agent: string | null;
  ip_address: string | null;
  actions_taken: Record<string, unknown> | null;
  organization?: {
    name: string;
    slug: string;
  };
  admin_profile?: {
    email: string;
    full_name: string | null;
  };
}

const ImpersonationSessionsLog = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['impersonation-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_impersonation_sessions')
        .select(`
          *,
          organization:organizations(name, slug)
        `)
        .order('started_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Fetch admin profiles separately
      const adminIds = [...new Set((data || []).map(s => s.admin_user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', adminIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, { email: p.email, full_name: p.full_name }]) || []);
      
      return (data || []).map(session => ({
        ...session,
        admin_profile: profileMap.get(session.admin_user_id) || null
      })) as ImpersonationSession[];
    },
  });

  const filteredSessions = sessions.filter((session) => 
    session.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.organization?.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.admin_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSessions = filteredSessions.filter(s => s.is_active);
  const completedSessions = filteredSessions.filter(s => !s.is_active);

  const calculateDuration = (start: string, end: string | null): string => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Less than a minute';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const exportSessions = () => {
    const csv = [
      ['Started At', 'Ended At', 'Duration', 'Admin Email', 'Organization', 'Status', 'IP Address'].join(','),
      ...filteredSessions.map((session) => [
        session.started_at,
        session.ended_at || '',
        calculateDuration(session.started_at, session.ended_at),
        session.admin_profile?.email || 'Unknown',
        session.organization?.name || 'Unknown',
        session.is_active ? 'Active' : 'Completed',
        session.ip_address || ''
      ].map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impersonation-sessions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Impersonation Sessions
            </CardTitle>
            <CardDescription>
              Track when platform admins access tenant organizations
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportSessions}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by admin email or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <span className="text-muted-foreground">
            Total: <strong>{filteredSessions.length}</strong>
          </span>
          <span className="text-green-600">
            Active: <strong>{activeSessions.length}</strong>
          </span>
          <span className="text-muted-foreground">
            Completed: <strong>{completedSessions.length}</strong>
          </span>
        </div>

        {/* Sessions List */}
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No impersonation sessions found. Sessions will appear here when platform admins access tenant organizations.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSessions.map((session) => (
                <div 
                  key={session.id} 
                  className={`flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 ${
                    session.is_active ? 'border-green-200 bg-green-50/50' : ''
                  }`}
                >
                  <div className={`mt-1 p-2 rounded-full ${
                    session.is_active ? 'bg-green-100 text-green-600' : 'bg-muted'
                  }`}>
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={session.is_active ? 'default' : 'secondary'} className="flex items-center gap-1">
                        {session.is_active ? (
                          <>
                            <Circle className="h-2 w-2 fill-current animate-pulse" />
                            Active
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </>
                        )}
                      </Badge>
                      <span className="font-medium text-sm">
                        {session.organization?.name || 'Unknown Organization'}
                      </span>
                      {session.organization?.slug && (
                        <span className="text-xs text-muted-foreground">
                          ({session.organization.slug})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>by {session.admin_profile?.email || 'Unknown admin'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.is_active 
                          ? `Started ${formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}`
                          : `Duration: ${calculateDuration(session.started_at, session.ended_at)}`
                        }
                      </span>
                      <span>•</span>
                      <span>{format(new Date(session.started_at), 'MMM d, yyyy h:mm a')}</span>
                      {session.ip_address && (
                        <>
                          <span>•</span>
                          <span>IP: {session.ip_address}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ImpersonationSessionsLog;
