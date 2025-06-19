
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const NewsletterAnalyticsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Newsletter Analytics</CardTitle>
        <CardDescription>
          Detailed performance metrics for your newsletter campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4" />
          <p>Detailed analytics dashboard coming soon</p>
          <p className="text-sm">Email tracking for opens, clicks, and conversions will be available in a future update</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterAnalyticsTab;
