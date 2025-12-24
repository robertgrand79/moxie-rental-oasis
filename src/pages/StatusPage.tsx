import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Wrench,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

interface SystemStatus {
  id: string;
  service_name: string;
  status: string;
  description: string | null;
  last_checked_at: string | null;
}

interface SystemIncident {
  id: string;
  title: string;
  severity: string;
  status: string;
  affected_services: string[] | null;
  description: string;
  started_at: string;
  resolved_at: string | null;
}

const StatusPage: React.FC = () => {
  const { data: services, isLoading: servicesLoading, refetch } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_status')
        .select('*')
        .order('service_name');
      if (error) throw error;
      return data as SystemStatus[];
    },
  });

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ['system-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_incidents')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as SystemIncident[];
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'partial_outage':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'major_outage':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'partial_outage':
        return 'bg-orange-500';
      case 'major_outage':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-blue-500';
      default:
        return 'bg-muted';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      sev1: 'bg-red-500 text-white',
      sev2: 'bg-orange-500 text-white',
      sev3: 'bg-yellow-500 text-black',
      sev4: 'bg-blue-500 text-white',
    };
    const labels = {
      sev1: 'Critical',
      sev2: 'Major',
      sev3: 'Minor',
      sev4: 'Low',
    };
    return (
      <Badge className={colors[severity as keyof typeof colors] || 'bg-muted'}>
        {labels[severity as keyof typeof labels] || severity}
      </Badge>
    );
  };

  const getIncidentStatusBadge = (status: string) => {
    const colors = {
      investigating: 'bg-yellow-500 text-black',
      identified: 'bg-orange-500 text-white',
      monitoring: 'bg-blue-500 text-white',
      resolved: 'bg-green-500 text-white',
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-muted'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const allOperational = services?.every((s) => s.status === 'operational');
  const activeIncidents = incidents?.filter((i) => i.status !== 'resolved') || [];

  return (
    <>
      <Helmet>
        <title>System Status | StayMoxie</title>
        <meta name="description" content="Check the current status of StayMoxie services and view incident history." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">System Status</h1>
              <p className="text-muted-foreground mt-1">
                Current status of StayMoxie services
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Overall Status Banner */}
          <Card className={`mb-8 ${allOperational ? 'border-green-500/50' : 'border-yellow-500/50'}`}>
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                {allOperational ? (
                  <>
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-green-600">All Systems Operational</h2>
                      <p className="text-muted-foreground">All services are running normally</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-yellow-600">Some Systems Degraded</h2>
                      <p className="text-muted-foreground">Some services may be experiencing issues</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Incidents */}
          {activeIncidents.length > 0 && (
            <Card className="mb-8 border-yellow-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Incidents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeIncidents.map((incident) => (
                  <div key={incident.id} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{incident.title}</h3>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(incident.severity)}
                        {getIncidentStatusBadge(incident.status)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                    {incident.affected_services && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {incident.affected_services.map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Started {formatDistanceToNow(new Date(incident.started_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Service Status List */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>Current status of individual services</CardDescription>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {services?.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <p className="font-medium">{service.service_name}</p>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(service.status)}`} />
                        <span className="text-sm capitalize">{service.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incident History */}
          <Card>
            <CardHeader>
              <CardTitle>Incident History</CardTitle>
              <CardDescription>Past incidents and their resolutions</CardDescription>
            </CardHeader>
            <CardContent>
              {incidentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : incidents && incidents.length > 0 ? (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{incident.title}</h3>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(incident.severity)}
                          {getIncidentStatusBadge(incident.status)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Started: {format(new Date(incident.started_at), 'MMM d, yyyy h:mm a')}</span>
                        {incident.resolved_at && (
                          <span>Resolved: {format(new Date(incident.resolved_at), 'MMM d, yyyy h:mm a')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No incidents recorded</p>
              )}
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground mt-8">
            <p>Subscribe for updates or contact support for assistance</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatusPage;
