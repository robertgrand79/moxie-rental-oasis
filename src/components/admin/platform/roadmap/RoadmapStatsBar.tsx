import React from 'react';
import { Lightbulb, Target, Clock, CheckCircle, Pause } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { RoadmapStats } from '@/hooks/usePlatformRoadmap';

interface RoadmapStatsBarProps {
  stats: RoadmapStats;
}

export const RoadmapStatsBar: React.FC<RoadmapStatsBarProps> = ({ stats }) => {
  const statusCards = [
    { key: 'idea', label: 'Ideas', icon: Lightbulb, color: 'text-purple-500' },
    { key: 'planned', label: 'Planned', icon: Target, color: 'text-blue-500' },
    { key: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-yellow-500' },
    { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-green-500' },
    { key: 'on-hold', label: 'On Hold', icon: Pause, color: 'text-muted-foreground' },
  ] as const;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statusCards.map(({ key, label, icon: Icon, color }) => (
        <Card key={key}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.byStatus[key]}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
