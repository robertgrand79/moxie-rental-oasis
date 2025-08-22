import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cpu, 
  MemoryStick, 
  Network, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Activity
} from 'lucide-react';

const SystemDiagnosticsDashboard = () => {
  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPU Usage</p>
                <p className="text-2xl font-bold">45%</p>
              </div>
              <Cpu className="h-8 w-8 text-blue-600" />
            </div>
            <Badge className="mt-2 bg-green-100 text-green-800">Normal</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Memory</p>
                <p className="text-2xl font-bold">68%</p>
              </div>
              <MemoryStick className="h-8 w-8 text-green-600" />
            </div>
            <Badge className="mt-2 bg-green-100 text-green-800">Healthy</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network</p>
                <p className="text-2xl font-bold">Fast</p>
              </div>
              <Network className="h-8 w-8 text-green-600" />
            </div>
            <Badge className="mt-2 bg-green-100 text-green-800">Online</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage</p>
                <p className="text-2xl font-bold">34%</p>
              </div>
              <HardDrive className="h-8 w-8 text-blue-600" />
            </div>
            <Badge className="mt-2 bg-green-100 text-green-800">Available</Badge>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Application Server</p>
                  <p className="text-sm text-muted-foreground">All services running normally</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Database Connection</p>
                  <p className="text-sm text-muted-foreground">Supabase connection stable</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">External APIs</p>
                  <p className="text-sm text-muted-foreground">Some services may have delays</p>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">CDN & Assets</p>
                  <p className="text-sm text-muted-foreground">Content delivery optimized</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Optimal</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              System diagnostics and performance monitoring are actively being developed. 
              This dashboard will provide real-time system health monitoring, memory leak detection, 
              and performance optimization recommendations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemDiagnosticsDashboard;