
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Hotel, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  UserPlus,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useHospitableSync } from '@/hooks/useHospitableSync';

const HospitableSyncCard = () => {
  const { syncHospitableContacts, isLoading, lastSyncResult } = useHospitableSync();

  const handleSync = async () => {
    await syncHospitableContacts();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hotel className="h-5 w-5 text-blue-600" />
          Hospitable Integration
        </CardTitle>
        <CardDescription>
          Sync guest contact information from your Hospitable bookings to grow your newsletter audience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Button */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSync} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Syncing Contacts...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Sync Hospitable Contacts
              </>
            )}
          </Button>
          
          {lastSyncResult && (
            <Badge variant={lastSyncResult.success ? "default" : "destructive"}>
              {lastSyncResult.success ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {lastSyncResult.success ? 'Last sync successful' : 'Last sync failed'}
            </Badge>
          )}
        </div>

        {/* Sync Results */}
        {lastSyncResult && lastSyncResult.success && lastSyncResult.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {lastSyncResult.stats.totalBookings}
              </div>
              <div className="text-sm text-green-600">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700 flex items-center justify-center gap-1">
                <UserPlus className="h-5 w-5" />
                {lastSyncResult.stats.newSubscribers}
              </div>
              <div className="text-sm text-blue-600">New Contacts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700 flex items-center justify-center gap-1">
                <RefreshCw className="h-5 w-5" />
                {lastSyncResult.stats.updatedSubscribers}
              </div>
              <div className="text-sm text-orange-600">Updated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 flex items-center justify-center gap-1">
                <Users className="h-5 w-5" />
                {lastSyncResult.stats.skippedContacts}
              </div>
              <div className="text-sm text-gray-600">Skipped</div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {lastSyncResult && !lastSyncResult.success && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Sync Failed:</strong> {lastSyncResult.error || 'Unknown error occurred'}
            </AlertDescription>
          </Alert>
        )}

        {/* Information */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Syncs guest contact info from your Hospitable bookings</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Automatically opts guests into email newsletters (they can unsubscribe anytime)</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Merges with existing contacts and updates missing information</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HospitableSyncCard;
