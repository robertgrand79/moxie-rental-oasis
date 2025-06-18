
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface RealTimeActivityCardProps {
  realTimeVisitors: number;
  pageViews: number;
  sessions: number;
}

const RealTimeActivityCard = ({ realTimeVisitors, pageViews, sessions }: RealTimeActivityCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Real-time Activity
        </CardTitle>
        <CardDescription>
          Current visitors and live activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <div>
            <p className="font-medium">Active Visitors</p>
            <p className="text-sm text-gray-600">Currently browsing</p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
            {realTimeVisitors}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <div>
            <p className="font-medium">Page Views</p>
            <p className="text-sm text-gray-600">Today's total</p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {pageViews}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
          <div>
            <p className="font-medium">Sessions</p>
            <p className="text-sm text-gray-600">Active sessions</p>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {sessions}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeActivityCard;
