import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Users, Settings, AlertTriangle, TrendingUp } from 'lucide-react';
import { usePlatformAIUsage } from '@/hooks/usePlatformAIUsage';
import AIMetricsOverview from '@/components/admin/platform/ai/AIMetricsOverview';
import TenantUsageTable from '@/components/admin/platform/ai/TenantUsageTable';
import AIUsageTrendsChart from '@/components/admin/platform/ai/AIUsageTrendsChart';
import TierLimitsSettings from '@/components/admin/platform/ai/TierLimitsSettings';
import AbusePatternsList from '@/components/admin/platform/ai/AbusePatternsList';

const PlatformAIPage = () => {
  const { abusePatterns, loadingAbuse } = usePlatformAIUsage();
  
  const highSeverityCount = abusePatterns?.filter(p => p.severity === 'high').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6" />
          AI Management
        </h1>
        <p className="text-muted-foreground">
          Monitor AI usage across tenants, manage limits, and detect abuse patterns
        </p>
      </div>

      <AIMetricsOverview />

      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tenants" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tenant Usage
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="abuse" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Abuse Detection
            {highSeverityCount > 0 && (
              <span className="ml-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5">
                {highSeverityCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Tier Limits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants">
          <TenantUsageTable />
        </TabsContent>

        <TabsContent value="trends">
          <AIUsageTrendsChart />
        </TabsContent>

        <TabsContent value="abuse">
          <AbusePatternsList />
        </TabsContent>

        <TabsContent value="settings">
          <TierLimitsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformAIPage;
