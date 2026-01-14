import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, AlertTriangle, Flag, Clock, CheckCircle, 
  Bell, RefreshCw, TrendingUp, Gauge, Users, Zap 
} from 'lucide-react';
import { format } from 'date-fns';
import {
  usePlatformFeatureFlags,
  usePlatformSlaDefinitions,
  usePlatformSlaBreaches,
  usePlatformPerformanceMetrics,
  useSendBreachAlert,
} from '@/hooks/usePlatformMonitoring';

const PlatformMonitoringPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  
  const { flags, updateFlag } = usePlatformFeatureFlags();
  const { definitions } = usePlatformSlaDefinitions();
  const { breaches, activeBreaches, criticalBreaches, resolveBreach } = usePlatformSlaBreaches();
  const { aggregatedMetrics } = usePlatformPerformanceMetrics(timeRange);
  const sendAlert = useSendBreachAlert();

  const handleToggleFlag = (id: string, currentState: boolean) => {
    updateFlag.mutate({ id, updates: { is_enabled: !currentState } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Monitoring</h1>
          <p className="text-muted-foreground">SLA tracking, feature flags, and performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Breaches</p>
                <p className="text-2xl font-bold">{activeBreaches.length}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${criticalBreaches.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Latency</p>
                <p className="text-2xl font-bold">{aggregatedMetrics.avgLatency.toFixed(0)}ms</p>
              </div>
              <Gauge className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{aggregatedMetrics.errorRate.toFixed(2)}%</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{aggregatedMetrics.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sla" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sla"><Clock className="h-4 w-4 mr-2" />SLA Tracking</TabsTrigger>
          <TabsTrigger value="flags"><Flag className="h-4 w-4 mr-2" />Feature Flags</TabsTrigger>
          <TabsTrigger value="performance"><TrendingUp className="h-4 w-4 mr-2" />Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="sla" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">SLA Definitions</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {definitions.map((sla) => (
                    <div key={sla.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{sla.sla_name}</p>
                        <p className="text-sm text-muted-foreground">Target: {sla.target_value} {sla.target_unit}</p>
                      </div>
                      <div className="flex gap-1">
                        {sla.applies_to_tiers.map((tier) => (
                          <Badge key={tier} variant="secondary" className="text-xs">{tier}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Active Breaches</CardTitle></CardHeader>
              <CardContent>
                {activeBreaches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No active breaches</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeBreaches.map((breach) => (
                      <div key={breach.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={breach.severity === 'critical' ? 'destructive' : 'secondary'}>{breach.severity}</Badge>
                          <span className="text-sm text-muted-foreground">{format(new Date(breach.breach_start), 'MMM d, h:mm a')}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => sendAlert.mutate(breach.id)} disabled={!!breach.notified_at}>
                            <Bell className="h-3 w-3 mr-1" />{breach.notified_at ? 'Notified' : 'Alert'}
                          </Button>
                          <Button size="sm" onClick={() => resolveBreach.mutate({ id: breach.id })}>
                            <CheckCircle className="h-3 w-3 mr-1" />Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flags">
          <Card>
            <CardHeader><CardTitle className="text-lg">Feature Flags</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flags.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className={`h-4 w-4 ${flag.is_enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-medium">{flag.flag_name}</span>
                        <Badge variant="outline" className="text-xs">{flag.flag_key}</Badge>
                      </div>
                      {flag.description && <p className="text-sm text-muted-foreground">{flag.description}</p>}
                    </div>
                    <Switch checked={flag.is_enabled} onCheckedChange={() => handleToggleFlag(flag.id, flag.is_enabled)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Label>Time Range:</Label>
            <Select value={timeRange} onValueChange={(v: '1h' | '24h' | '7d' | '30d') => setTimeRange(v)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6 text-center"><Gauge className="h-8 w-8 mx-auto text-primary mb-2" /><p className="text-sm text-muted-foreground">Avg Latency</p><p className="text-3xl font-bold">{aggregatedMetrics.avgLatency.toFixed(0)}ms</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><AlertTriangle className="h-8 w-8 mx-auto text-orange-500 mb-2" /><p className="text-sm text-muted-foreground">Error Rate</p><p className="text-3xl font-bold">{aggregatedMetrics.errorRate.toFixed(2)}%</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><Activity className="h-8 w-8 mx-auto text-blue-500 mb-2" /><p className="text-sm text-muted-foreground">Requests</p><p className="text-3xl font-bold">{aggregatedMetrics.totalRequests.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><Users className="h-8 w-8 mx-auto text-green-500 mb-2" /><p className="text-sm text-muted-foreground">Peak Users</p><p className="text-3xl font-bold">{aggregatedMetrics.activeUsers}</p></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformMonitoringPage;
