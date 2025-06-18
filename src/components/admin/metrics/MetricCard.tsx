
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const statusColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <Card 
      className={`border-l-4 ${statusColors[status]} ${
        clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {title}
          {isDemo && <Badge variant="secondary" className="text-xs">Demo</Badge>}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center gap-2">
          {value}
          {trend && (
            <TrendingUp className={`h-4 w-4 ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500 rotate-180' : 
              'text-gray-500'
            }`} />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {description}
          {clickable && (
            <span className="ml-2 text-blue-600 font-medium">Click to view details</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
