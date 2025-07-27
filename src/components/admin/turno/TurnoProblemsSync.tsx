import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTurnoSync } from '@/hooks/useTurnoSync';
import { RefreshCw, RotateCw, ArrowLeftRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TurnoPropertyTestButton } from './TurnoPropertyTestButton';
import { TurnoSyncHistory } from './TurnoSyncHistory';

interface TurnoProblemsSync {
  onSyncComplete?: () => void;
}

const TurnoProblemsSync = ({ onSyncComplete }: TurnoProblemsSync) => {
  const { 
    syncStatus, 
    syncWorkOrderToTurno, 
    syncProblemsFromTurno, 
    importProblemsAsWorkOrders, 
    performFullSync 
  } = useTurnoSync();

  const handleSyncProblems = async () => {
    try {
      await syncProblemsFromTurno(false); // Don't create work orders, just sync problems
      onSyncComplete?.();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleImportAllProblems = async () => {
    try {
      await importProblemsAsWorkOrders();
      onSyncComplete?.();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleFullSync = async () => {
    try {
      await performFullSync();
      onSyncComplete?.();
    } catch (error) {
      console.error('Full sync failed:', error);
    }
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    try {
      return formatDistanceToNow(new Date(timestamp)) + ' ago';
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Sync Management
        </CardTitle>
          <CardDescription>
            Manage synchronization between Turno and your problems database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="actions">Sync Actions</TabsTrigger>
              <TabsTrigger value="history">Sync History</TabsTrigger>
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
                          {syncStatus.conflicts || 0}
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
                        <p className="text-sm font-medium">Pending Sync</p>
                        <p className="text-2xl font-bold text-primary">
                          {syncStatus.pendingSync || 0}
                        </p>
                      </div>
                      <RefreshCw className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sync Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {syncStatus.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Syncing in progress...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>System ready for sync</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Testing & Setup</CardTitle>
                  <CardDescription>
                    Test your Turno API credentials and fetch properties for mapping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TurnoPropertyTestButton />
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sync Recent Problems</CardTitle>
                    <CardDescription>
                      Fetch problems updated in the last 7 days from Turno
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleSyncProblems}
                      disabled={syncStatus.isLoading}
                      className="w-full flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
                      Sync Problems (7 days)
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Import All Problems</CardTitle>
                    <CardDescription>
                      Import all problems from Turno as work orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleImportAllProblems}
                      disabled={syncStatus.isLoading}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <RotateCw className={`h-4 w-4 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
                      Import All Problems
                    </Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Full Bidirectional Sync</CardTitle>
                    <CardDescription>
                      Sync all problems from Turno and push work order status updates back to Turno
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleFullSync}
                      disabled={syncStatus.isLoading}
                      variant="default"
                      className="w-full flex items-center gap-2"
                    >
                      <ArrowLeftRight className={`h-4 w-4 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
                      Full Bidirectional Sync
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sync History</CardTitle>
                  <CardDescription>
                    Recent synchronization activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TurnoSyncHistory />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TurnoProblemsSync;