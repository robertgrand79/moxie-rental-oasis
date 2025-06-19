
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface CampaignPerformance {
  id: string;
  subject: string;
  sent_at: string;
  recipient_count: number;
  open_rate: number;
  click_rate: number;
  total_opens: number;
  total_clicks: number;
}

interface AnalyticsChartsProps {
  campaignPerformance: CampaignPerformance[];
  loading?: boolean;
}

const AnalyticsCharts = ({ campaignPerformance, loading = false }: AnalyticsChartsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Prepare data for charts - last 10 campaigns
  const chartData = campaignPerformance
    .slice(0, 10)
    .reverse()
    .map((campaign, index) => ({
      name: `Campaign ${index + 1}`,
      subject: campaign.subject.length > 30 
        ? campaign.subject.substring(0, 30) + '...' 
        : campaign.subject,
      openRate: campaign.open_rate || 0,
      clickRate: campaign.click_rate || 0,
      recipients: campaign.recipient_count || 0,
      opens: campaign.total_opens || 0,
      clicks: campaign.total_clicks || 0,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Open & Click Rates</CardTitle>
          <CardDescription>
            Performance trends across recent campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(label, payload) => {
                  const data = payload?.[0]?.payload;
                  return data?.subject || label;
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name === 'openRate' ? 'Open Rate' : 'Click Rate'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="openRate" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="clickRate" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Volume</CardTitle>
          <CardDescription>
            Recipients and engagement by campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label, payload) => {
                  const data = payload?.[0]?.payload;
                  return data?.subject || label;
                }}
                formatter={(value: number, name: string) => {
                  const labels = {
                    recipients: 'Recipients',
                    opens: 'Opens',
                    clicks: 'Clicks'
                  };
                  return [value.toLocaleString(), labels[name as keyof typeof labels] || name];
                }}
              />
              <Bar dataKey="recipients" fill="#e5e7eb" name="recipients" />
              <Bar dataKey="opens" fill="#10b981" name="opens" />
              <Bar dataKey="clicks" fill="#3b82f6" name="clicks" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;
