import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, RefreshCw, Users, Home, CreditCard, Eye } from 'lucide-react';

interface FunnelStep {
  step_name: string;
  step_number: number;
  count: number;
  completed: number;
  dropped: number;
}

interface ConversionFunnelChartProps {
  showAllTenants?: boolean;
}

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({ showAllTenants = false }) => {
  const { organization } = useCurrentOrganization();
  const organizationId = organization?.id;

  const { data: funnelData, isLoading, refetch } = useQuery({
    queryKey: ['conversion-funnels', organizationId, showAllTenants],
    queryFn: async () => {
      let query = supabase
        .from('conversion_funnels')
        .select('funnel_name, step_name, step_number, completed_at, dropped_at');

      if (!showAllTenants && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Process data into funnel structure
      const funnels: Record<string, FunnelStep[]> = {};
      
      data?.forEach((row) => {
        if (!funnels[row.funnel_name]) {
          funnels[row.funnel_name] = [];
        }
        
        let step = funnels[row.funnel_name].find(s => s.step_number === row.step_number);
        if (!step) {
          step = {
            step_name: row.step_name,
            step_number: row.step_number,
            count: 0,
            completed: 0,
            dropped: 0
          };
          funnels[row.funnel_name].push(step);
        }
        
        step.count++;
        if (row.completed_at) step.completed++;
        if (row.dropped_at) step.dropped++;
      });

      // Sort steps by step_number
      Object.keys(funnels).forEach(name => {
        funnels[name].sort((a, b) => a.step_number - b.step_number);
      });

      return funnels;
    },
    enabled: showAllTenants || !!organizationId,
  });

  const calculateConversionRate = (steps: FunnelStep[]) => {
    if (!steps || steps.length < 2) return 0;
    const first = steps[0]?.count || 0;
    const last = steps[steps.length - 1]?.completed || 0;
    return first > 0 ? Math.round((last / first) * 100) : 0;
  };

  const FunnelVisualization: React.FC<{ steps: FunnelStep[]; name: string }> = ({ steps, name }) => {
    if (!steps || steps.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No data for {name} funnel yet
        </div>
      );
    }

    const maxCount = Math.max(...steps.map(s => s.count), 1);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {calculateConversionRate(steps)}% conversion
          </Badge>
          <span className="text-sm text-muted-foreground">
            {steps[0]?.count || 0} started → {steps[steps.length - 1]?.completed || 0} completed
          </span>
        </div>
        
        <div className="space-y-2">
          {steps.map((step, index) => {
            const width = (step.count / maxCount) * 100;
            const dropRate = step.count > 0 ? Math.round((step.dropped / step.count) * 100) : 0;
            
            return (
              <div key={step.step_number} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {index + 1}. {step.step_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{step.count} users</span>
                    {dropRate > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        -{dropRate}%
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/80 rounded-lg transition-all duration-500"
                    style={{ width: `${width}%` }}
                  />
                  {step.completed > 0 && (
                    <div
                      className="absolute inset-y-0 left-0 bg-green-500 rounded-lg"
                      style={{ width: `${(step.completed / maxCount) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const funnelNames = Object.keys(funnelData || {});

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Conversion Funnels
            </CardTitle>
            <CardDescription>
              Track user progression through key workflows
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading funnel data...</div>
        ) : funnelNames.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No funnel data available yet</p>
            <p className="text-sm mt-2">Funnels will appear as users progress through key workflows</p>
          </div>
        ) : (
          <Tabs defaultValue={funnelNames[0]} className="w-full">
            <TabsList className="w-full flex-wrap h-auto">
              {funnelNames.map((name) => (
                <TabsTrigger key={name} value={name} className="flex items-center gap-1">
                  {name.includes('signup') || name.includes('onboarding') ? (
                    <Users className="h-3 w-3" />
                  ) : name.includes('booking') ? (
                    <Home className="h-3 w-3" />
                  ) : name.includes('subscription') || name.includes('trial') ? (
                    <CreditCard className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                  {name.replace(/_/g, ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
            {funnelNames.map((name) => (
              <TabsContent key={name} value={name} className="mt-4">
                <FunnelVisualization steps={funnelData![name]} name={name} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversionFunnelChart;
