
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award } from 'lucide-react';

interface TopPerformer {
  id: string;
  subject: string;
  open_rate: number;
  click_rate: number;
}

interface TopPerformersTableProps {
  topPerformers: TopPerformer[];
  loading?: boolean;
}

const TopPerformersTable = ({ topPerformers, loading = false }: TopPerformersTableProps) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRatingBadge = (rate: number) => {
    if (rate >= 30) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (rate >= 20) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (rate >= 10) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Below Average', color: 'bg-red-100 text-red-800' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-600" />
          Top Performing Campaigns
        </CardTitle>
        <CardDescription>
          Campaigns with highest open rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topPerformers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No campaign data available yet</p>
            <p className="text-sm">Send some newsletters to see top performers</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topPerformers.map((campaign, index) => {
              const openRating = getRatingBadge(campaign.open_rate);
              const clickRating = getRatingBadge(campaign.click_rate);
              
              return (
                <div 
                  key={campaign.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        #{index + 1}
                      </span>
                      <h3 className="font-medium text-gray-900 truncate">
                        {campaign.subject}
                      </h3>
                    </div>
                    
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Open Rate:</span>
                        <span className="font-medium text-green-600">
                          {campaign.open_rate.toFixed(1)}%
                        </span>
                        <Badge className={`text-xs ${openRating.color}`}>
                          {openRating.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Click Rate:</span>
                        <span className="font-medium text-blue-600">
                          {campaign.click_rate.toFixed(1)}%
                        </span>
                        <Badge className={`text-xs ${clickRating.color}`}>
                          {clickRating.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopPerformersTable;
