import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types/property';
import { useReservations, useDynamicPricing, useSyncPriceLabs } from '@/hooks/useBookingData';
import { RefreshCw, Calendar, DollarSign, Users, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SyncStatusDashboardProps {
  property: Property;
}

const SyncStatusDashboard = ({ property }: SyncStatusDashboardProps) => {
  const { data: reservations, isLoading: reservationsLoading } = useReservations(property.id);
  const { data: pricing, isLoading: pricingLoading } = useDynamicPricing(property.id);
  const { mutate: syncPriceLabs, isPending: syncing } = useSyncPriceLabs();

  const handleSyncPriceLabs = () => {
    syncPriceLabs();
  };

  const activeReservations = reservations?.filter(r => 
    ['confirmed', 'active'].includes(r.booking_status)
  ) || [];

  const upcomingReservations = reservations?.filter(r => {
    const checkIn = new Date(r.check_in_date);
    const now = new Date();
    return checkIn > now && r.booking_status === 'confirmed';
  }) || [];

  const currentPricing = pricing?.find(p => 
    p.date === format(new Date(), 'yyyy-MM-dd')
  );

  const integrationStatus = {
    pricelabs: !!currentPricing,
    airbnb: !!property.airbnb_listing_url
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReservations.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingReservations.length} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentPricing?.final_price || property.price_per_night || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentPricing ? `${currentPricing.pricing_source} pricing` : 'Base price'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeReservations.reduce((sum, r) => sum + (r.guest_count || 1), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current occupancy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Integration Status
          </CardTitle>
          <CardDescription>
            Monitor the health of your booking platform integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${integrationStatus.pricelabs ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="font-medium">PriceLabs</span>
              </div>
              <Badge variant={integrationStatus.pricelabs ? "default" : "secondary"}>
                {integrationStatus.pricelabs ? "Synced" : "No Data"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${integrationStatus.airbnb ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="font-medium">Airbnb</span>
              </div>
              <Badge variant={integrationStatus.airbnb ? "default" : "secondary"}>
                {integrationStatus.airbnb ? "Linked" : "Not Linked"}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSyncPriceLabs}
              disabled={syncing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sync PriceLabs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {reservationsLoading || pricingLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading activity...
            </div>
          ) : (
            <div className="space-y-3">
              {reservations?.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{reservation.guest_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(reservation.check_in_date), 'MMM d')} - {format(new Date(reservation.check_out_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {reservation.booking_status}
                  </Badge>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncStatusDashboard;
