import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { format, subDays, startOfDay, eachDayOfInterval, subWeeks, startOfWeek, eachWeekOfInterval } from 'date-fns';

interface DailyUsage {
  date: string;
  count: number;
}

interface UsageByType {
  type: string;
  count: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b'];

export function AIUsageCharts() {
  const { organization } = useCurrentOrganization();

  // Fetch daily usage for the past 7 days
  const { data: dailyUsage, isLoading: dailyLoading } = useQuery({
    queryKey: ['ai-daily-usage', organization?.id],
    queryFn: async (): Promise<DailyUsage[]> => {
      if (!organization?.id) return [];

      const startDate = startOfDay(subDays(new Date(), 6));
      
      const { data, error } = await supabase
        .from('ai_usage')
        .select('window_start, request_count')
        .eq('organization_id', organization.id)
        .gte('window_start', startDate.toISOString())
        .order('window_start', { ascending: true });

      if (error) {
        console.error('Failed to fetch daily usage:', error);
        return [];
      }

      // Group by day
      const usageByDay = new Map<string, number>();
      
      // Initialize all days with 0
      const days = eachDayOfInterval({
        start: startDate,
        end: new Date()
      });
      
      days.forEach(day => {
        usageByDay.set(format(day, 'yyyy-MM-dd'), 0);
      });

      // Sum up usage per day
      data?.forEach(record => {
        const day = format(new Date(record.window_start), 'yyyy-MM-dd');
        usageByDay.set(day, (usageByDay.get(day) || 0) + record.request_count);
      });

      return Array.from(usageByDay.entries()).map(([date, count]) => ({
        date: format(new Date(date), 'EEE'),
        count
      }));
    },
    enabled: !!organization?.id,
    staleTime: 60000,
  });

  // Fetch weekly usage for the past 4 weeks
  const { data: weeklyUsage, isLoading: weeklyLoading } = useQuery({
    queryKey: ['ai-weekly-usage', organization?.id],
    queryFn: async (): Promise<DailyUsage[]> => {
      if (!organization?.id) return [];

      const startDate = startOfWeek(subWeeks(new Date(), 3));
      
      const { data, error } = await supabase
        .from('ai_usage')
        .select('window_start, request_count')
        .eq('organization_id', organization.id)
        .gte('window_start', startDate.toISOString())
        .order('window_start', { ascending: true });

      if (error) {
        console.error('Failed to fetch weekly usage:', error);
        return [];
      }

      // Group by week
      const usageByWeek = new Map<string, number>();
      
      const weeks = eachWeekOfInterval({
        start: startDate,
        end: new Date()
      });
      
      weeks.forEach(week => {
        usageByWeek.set(format(week, 'yyyy-MM-dd'), 0);
      });

      data?.forEach(record => {
        const weekStart = format(startOfWeek(new Date(record.window_start)), 'yyyy-MM-dd');
        usageByWeek.set(weekStart, (usageByWeek.get(weekStart) || 0) + record.request_count);
      });

      return Array.from(usageByWeek.entries()).map(([date, count]) => ({
        date: format(new Date(date), 'MMM d'),
        count
      }));
    },
    enabled: !!organization?.id,
    staleTime: 60000,
  });

  // Calculate usage by type (mock data for now - would need to track operation_type in ai_usage)
  const usageByType: UsageByType[] = [
    { type: 'Chat', count: 65 },
    { type: 'Content Gen', count: 25 },
    { type: 'Summarize', count: 10 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg shadow-lg px-3 py-2">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} requests
          </p>
        </div>
      );
    }
    return null;
  };

  const isLoading = dailyLoading || weeklyLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage History</CardTitle>
        <CardDescription>
          Track your AI usage patterns over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="by-type">By Type</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    >
                      {dailyUsage?.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === (dailyUsage?.length || 0) - 1 
                            ? 'hsl(var(--primary))' 
                            : 'hsl(var(--muted-foreground) / 0.3)'
                          } 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Last 7 days of AI requests
            </p>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    >
                      {weeklyUsage?.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === (weeklyUsage?.length || 0) - 1 
                            ? 'hsl(var(--primary))' 
                            : 'hsl(var(--muted-foreground) / 0.3)'
                          } 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Last 4 weeks of AI requests
            </p>
          </TabsContent>

          <TabsContent value="by-type" className="space-y-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usageByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="type"
                    label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {usageByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Breakdown by request type
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default AIUsageCharts;
