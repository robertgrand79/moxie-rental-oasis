
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, MessageSquare, TrendingUp, Phone, Globe } from 'lucide-react';

interface MultiChannelStatsCardsProps {
  stats: {
    totalSubscribers: number;
    emailSubscribers: number;
    smsSubscribers: number;
    bothChannels: number;
    contactSources: Record<string, number>;
  };
  loading?: boolean;
}

const MultiChannelStatsCards = ({ stats, loading = false }: MultiChannelStatsCardsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

  const emailPercentage = stats.totalSubscribers > 0 
    ? ((stats.emailSubscribers / stats.totalSubscribers) * 100).toFixed(1)
    : '0';
    
  const smsPercentage = stats.totalSubscribers > 0 
    ? ((stats.smsSubscribers / stats.totalSubscribers) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              All newsletter contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.emailSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              {emailPercentage}% of total contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Subscribers</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.smsSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              {smsPercentage}% of total contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multi-Channel</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.bothChannels}</div>
            <p className="text-xs text-muted-foreground">
              Email + SMS subscribers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Contact Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.contactSources).map(([source, count]) => (
              <Badge key={source} variant="outline" className="flex items-center gap-2">
                {source === 'newsletter' && <Mail className="h-3 w-3" />}
                {source === 'contact_form' && <MessageSquare className="h-3 w-3" />}
                {source === 'chat' && <Phone className="h-3 w-3" />}
                <span className="capitalize">{source.replace('_', ' ')}</span>
                <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-full text-xs">
                  {count}
                </span>
              </Badge>
            ))}
            {Object.keys(stats.contactSources).length === 0 && (
              <p className="text-sm text-gray-500">No contact sources data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiChannelStatsCards;
