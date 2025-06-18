
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

interface SystemHealth {
  databaseHealth: 'healthy' | 'degraded' | 'down';
  storageHealth: 'healthy' | 'degraded' | 'down';
  responseTime: number;
}

interface SystemStatusCardProps {
  systemHealth: SystemHealth | null;
}

const SystemStatusCard = ({ systemHealth }: SystemStatusCardProps) => {
  const getHealthStatus = (health: string) => {
    switch (health) {
      case 'healthy': return 'good';
      case 'degraded': return 'warning';
      case 'down': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          System Status
        </CardTitle>
        <CardDescription>
          Real-time health of site components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex justify-between items-center p-3 rounded-lg ${
          getHealthStatus(systemHealth?.databaseHealth || 'healthy') === 'good' ? 'bg-green-50' : 'bg-yellow-50'
        }`}>
          <div>
            <p className="font-medium">Database</p>
            <p className="text-sm text-gray-600">Supabase connection</p>
          </div>
          <Badge className={
            getHealthStatus(systemHealth?.databaseHealth || 'healthy') === 'good' ? 'bg-green-600' : 'bg-yellow-600'
          }>
            {systemHealth?.databaseHealth || 'Checking...'}
          </Badge>
        </div>
        
        <div className={`flex justify-between items-center p-3 rounded-lg ${
          getHealthStatus(systemHealth?.storageHealth || 'healthy') === 'good' ? 'bg-green-50' : 'bg-yellow-50'
        }`}>
          <div>
            <p className="font-medium">File Storage</p>
            <p className="text-sm text-gray-600">Image & document storage</p>
          </div>
          <Badge className={
            getHealthStatus(systemHealth?.storageHealth || 'healthy') === 'good' ? 'bg-green-600' : 'bg-yellow-600'
          }>
            {systemHealth?.storageHealth || 'Checking...'}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <div>
            <p className="font-medium">Response Time</p>
            <p className="text-sm text-gray-600">Average API response</p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {systemHealth?.responseTime || 0}ms
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusCard;
