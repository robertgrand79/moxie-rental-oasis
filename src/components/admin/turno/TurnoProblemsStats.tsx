import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, XCircle, Link, AlertCircle } from 'lucide-react';
import type { TurnoProblemsStats } from '@/types/turnoProblems';
import { formatDistanceToNow } from 'date-fns';

interface TurnoProblemsStatsProps {
  stats: TurnoProblemsStats | null;
}

const TurnoProblemsStats = ({ stats }: TurnoProblemsStatsProps) => {
  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Problems',
      value: stats.total,
      icon: AlertTriangle,
      description: 'All problems from Turno',
    },
    {
      title: 'Open',
      value: stats.open,
      icon: AlertCircle,
      description: 'Problems requiring attention',
      variant: 'destructive' as const,
    },
    {
      title: 'In Progress',
      value: stats.in_progress,
      icon: Clock,
      description: 'Problems being worked on',
      variant: 'default' as const,
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle,
      description: 'Problems that have been fixed',
      variant: 'secondary' as const,
    },
  ];

  const additionalStats = [
    {
      title: 'Linked to Work Orders',
      value: stats.linked_to_work_orders,
      icon: Link,
      description: 'Problems converted to work orders',
    },
    {
      title: 'Sync Conflicts',
      value: stats.sync_conflicts,
      icon: XCircle,
      description: 'Problems with sync issues',
      variant: stats.sync_conflicts > 0 ? 'destructive' as const : 'secondary' as const,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.variant && (
                  <Badge variant={stat.variant} className="text-xs">
                    {stat.title.toLowerCase()}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {additionalStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.variant && (
                  <Badge variant={stat.variant} className="text-xs">
                    {stat.variant === 'destructive' ? 'needs attention' : 'good'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last Sync Info */}
      {stats.last_sync_at && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Last Sync</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(parseInt(stats.last_sync_at)))} ago
                </p>
              </div>
              <Badge variant="outline">
                {new Date(parseInt(stats.last_sync_at)).toLocaleString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TurnoProblemsStats;