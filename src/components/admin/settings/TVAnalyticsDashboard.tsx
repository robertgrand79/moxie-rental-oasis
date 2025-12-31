import React from 'react';
import { Tv, Users, Wifi, WifiOff, Activity, BarChart3, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import useTVAnalytics, { AuditLogEntry } from '@/hooks/useTVAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TVAnalyticsDashboard: React.FC = () => {
  const { organization } = useCurrentOrganization();
  const { data: analytics, isLoading, error } = useTVAnalytics(organization?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load analytics data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          icon={Tv}
          label="Total Devices"
          value={analytics.totalDevices}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <SummaryCard
          icon={Users}
          label="Paired"
          value={analytics.pairedDevices}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <SummaryCard
          icon={Wifi}
          label="Online"
          value={analytics.onlineDevices}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <SummaryCard
          icon={WifiOff}
          label="Offline"
          value={analytics.offlineDevices}
          color="text-muted-foreground"
          bgColor="bg-muted"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Active Devices
            </CardTitle>
            <CardDescription>
              Devices seen in the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailyActiveDevices}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Active Devices"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Devices by Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tv className="h-5 w-5" />
              Devices by Property
            </CardTitle>
            <CardDescription>
              Distribution across properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {analytics.devicesByProperty.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No devices registered yet
                  </p>
                ) : (
                  analytics.devicesByProperty.map((property) => (
                    <div 
                      key={property.property_id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium text-sm">{property.property_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {property.total} device{property.total !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {property.paired} paired
                        </Badge>
                        <Badge 
                          variant={property.online > 0 ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {property.online} online
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest TV device events and pairing activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            {analytics.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No activity recorded yet
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.recentActivity.map((entry) => (
                  <ActivityLogEntry key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

// Summary Card Component
const SummaryCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}> = ({ icon: Icon, label, value, color, bgColor }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-full", bgColor)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Activity Log Entry Component
const ActivityLogEntry: React.FC<{ entry: AuditLogEntry }> = ({ entry }) => {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'paired':
        return <Badge className="bg-green-100 text-green-700">Paired</Badge>;
      case 'unpaired':
        return <Badge variant="secondary">Unpaired</Badge>;
      case 'registered':
        return <Badge className="bg-blue-100 text-blue-700">Registered</Badge>;
      case 'code_regenerated':
        return <Badge variant="outline">New Code</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-background">
          <Tv className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{entry.device_name}</p>
          <p className="text-xs text-muted-foreground">{entry.property_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        {getActionBadge(entry.action)}
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

export default TVAnalyticsDashboard;
