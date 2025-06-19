
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
  Clock,
  ExternalLink,
  Settings
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
        {/* API Key Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">Setup Required</h4>
              <p className="text-sm text-blue-700 mb-2">
                You need a Hospitable API key to sync contacts. Get yours from your Hospitable account settings.
              </p>
              <a 
                href="https://app.hospitable.com/settings/integrations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Get API Key from Hospitable <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

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
            {lastSyncResult.stats.errors && lastSyncResult.stats.errors > 0 && (
              <div className="col-span-full text-center pt-2 border-t border-green-300">
                <div className="text-lg font-bold text-red-600">
                  {lastSyncResult.stats.errors} Error{lastSyncResult.stats.errors !== 1 ? 's' : ''}
                </div>
                <div className="text-sm text-red-500">Some contacts couldn't be processed</div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {lastSyncResult && !lastSyncResult.success && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Sync Failed:</strong> {lastSyncResult.error || 'Unknown error occurred'}
              
              {lastSyncResult.troubleshooting && (
                <div className="mt-3 space-y-2">
                  <div>
                    <strong>Common Issues:</strong>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      {lastSyncResult.troubleshooting.commonIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Next Steps:</strong>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      {lastSyncResult.troubleshooting.nextSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
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
