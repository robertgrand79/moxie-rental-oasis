
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Users } from 'lucide-react';

interface NewsletterOverviewProps {
  subscriberCount: number | null;
}

const NewsletterOverview = ({ subscriberCount }: NewsletterOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Newsletter Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-blue-600" />
            <span className="text-sm text-gray-600">Active Subscribers: </span>
            <span className="font-semibold">{subscriberCount ?? 'Loading...'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterOverview;
