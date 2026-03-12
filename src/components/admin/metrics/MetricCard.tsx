
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  status?: 'good' | 'warning' | 'error';
  trend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
  clickable?: boolean;
  isDemo?: boolean;
}

const MetricCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  status = 'good', 
  trend, 
  onClick, 
  clickable = false,
  isDemo = false
}: MetricCardProps) => {
  const trendColors = {
    up: 'bg-green-500/10 text-green-700 dark:text-green-400',
    down: 'bg-red-500/10 text-red-700 dark:text-red-400',
    stable: 'bg-muted text-muted-foreground',
  };

  const statusAccent = {
    good: 'border-l-green-500/40',
    warning: 'border-l-amber-500/40',
    error: 'border-l-red-500/40',
  };

  return (
    <Card 
      className={`border-border/30 bg-gradient-to-br from-background to-muted/20 border-l-2 ${statusAccent[status]} ${
        clickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : 'transition-all duration-200'
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-2">
          {title}
          {isDemo && (
            <span className="rounded-full px-2 py-0.5 text-[10px] bg-muted text-muted-foreground font-medium normal-case tracking-normal">
              Demo
            </span>
          )}
        </CardTitle>
        <div className="text-muted-foreground/60">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-semibold tracking-tight text-foreground">{value}</span>
          {trend && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${trendColors[trend]}`}>
              <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} strokeWidth={1.5} />
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {description}
          {clickable && (
            <span className="ml-2 text-primary font-medium">View details →</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
