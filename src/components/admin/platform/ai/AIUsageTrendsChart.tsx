import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { usePlatformAIUsage } from '@/hooks/usePlatformAIUsage';
import { format, parseISO } from 'date-fns';

const AIUsageTrendsChart = () => {
  const { usageTrends, loadingTrends } = usePlatformAIUsage();

  const chartData = usageTrends?.map(t => ({
    ...t,
    dateLabel: format(parseISO(t.date), 'MMM d'),
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform AI Usage Trends (30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingTrends ? (
          <Skeleton className="h-80 w-full" />
        ) : chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No usage data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTenants" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="total_requests"
                name="Total Requests"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorRequests)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="unique_tenants"
                name="Active Tenants"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#colorTenants)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default AIUsageTrendsChart;
