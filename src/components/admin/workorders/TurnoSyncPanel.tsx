import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RotateCw, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  Settings,
  Activity
} from 'lucide-react';
import { useTurnoSync } from '@/hooks/useTurnoSync';
import { useToast } from '@/hooks/use-toast';

const TurnoSyncPanel = () => {
  const { 
    syncStatus, 
    syncProblemsFromTurno, 
    importProblemsAsWorkOrders,
    performFullSync, 
    checkSyncConflicts 
  } = useTurnoSync();
  const { toast } = useToast();
  const [conflictedWorkOrders, setConflictedWorkOrders] = useState<any[]>([]);

  useEffect(() => {
    loadConflicts();
  }, []);

  const loadConflicts = async () => {
    const conflicts = await checkSyncConflicts();
    setConflictedWorkOrders(conflicts);
  };

  const handleSyncProblems = async () => {
    await syncProblemsFromTurno(false);
    await loadConflicts();
  };

  const handleImportProblems = async () => {
    await importProblemsAsWorkOrders();
    await loadConflicts();
  };

  const handleFullSync = async () => {
    await performFullSync();
    await loadConflicts();
  };

  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RotateCw className="h-5 w-5" />
              Turno Sync Control
            </CardTitle>
            <CardDescription>
              Manage two-way synchronization between work orders and Turno problems
            </CardDescription>
          </div>
          <Badge variant={syncStatus.conflicts > 0 ? 'destructive' : 'default'}>
            {syncStatus.conflicts} conflicts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
            <TabsTrigger value="logs">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Last Sync</p>
                      <p className="text-2xl font-bold">
                        {formatLastSync(syncStatus.lastSyncAt)}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Conflicts</p>
                      <p className="text-2xl font-bold text-destructive">
                        {syncStatus.conflicts}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-2xl font-bold">
                        {syncStatus.isLoading ? 'Syncing' : 'Ready'}
                      </p>
                    </div>
                    <CheckCircle className={`h-8 w-8 ${syncStatus.isLoading ? 'text-yellow-500' : 'text-green-500'}`} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleSyncProblems}
                disabled={syncStatus.isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
                Sync from Turno
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleImportProblems}
                disabled={syncStatus.isLoading}
                className="flex items-center gap-2"
              >
                <RotateCw className={`h-4 w-4 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
                Import as Work Orders
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleFullSync}
                disabled={syncStatus.isLoading}
                className="flex items-center gap-2"
              >
                <RotateCw className={`h-4 w-4 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
                Full Bidirectional Sync
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-4">
            {conflictedWorkOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Conflicts</h3>
                <p>All work orders are synchronized with Turno.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conflictedWorkOrders.map((wo) => (
                  <Card key={wo.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{wo.work_order_number}</h4>
                          <p className="text-sm text-muted-foreground">{wo.title}</p>
                          <p className="text-sm text-destructive mt-1">
                            {wo.sync_conflict_reason}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Activity Logs</h3>
              <p>Sync activity logs will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TurnoSyncPanel;