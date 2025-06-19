
import React from 'react';
import { Mail, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NewsletterStatsCardsProps {
  sentCampaigns: number;
  avgRecipients: number;
  subscriberCount: number | null;
}

const NewsletterStatsCards = ({ sentCampaigns, avgRecipients, subscriberCount }: NewsletterStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sentCampaigns}</div>
          <p className="text-xs text-muted-foreground">
            Newsletter campaigns
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Recipients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgRecipients}</div>
          <p className="text-xs text-muted-foreground">
            Per campaign
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subscriberCount || 0}</div>
          <p className="text-xs text-muted-foreground">
            Active subscribers
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterStatsCards;
