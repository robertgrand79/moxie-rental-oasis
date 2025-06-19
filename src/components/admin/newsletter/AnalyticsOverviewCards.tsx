
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Mail, MousePointer, BarChart3 } from 'lucide-react';

interface AnalyticsOverviewCardsProps {
  totalCampaigns: number;
  totalSent: number;
  averageOpenRate: number;
  averageClickRate: number;
  loading?: boolean;
}

const AnalyticsOverviewCards = ({
  totalCampaigns,
  totalSent,
  averageOpenRate,
  averageClickRate,
  loading = false,
}: AnalyticsOverviewCardsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCampaigns}</div>
          <p className="text-xs text-muted-foreground">
            Newsletters sent
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Emails delivered
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {averageOpenRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Across all campaigns
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Click Rate</CardTitle>
          <MousePointer className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {averageClickRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Link engagement
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsOverviewCards;
