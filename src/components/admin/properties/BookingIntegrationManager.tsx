import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Property } from '@/types/property';
import { Calendar, DollarSign, Settings, Activity, RefreshCw, ExternalLink } from 'lucide-react';
import { ReservationList } from '@/components/booking/ReservationList';
import { PricingCalendar } from '@/components/booking/PricingCalendar';
import IntegrationSettings from './IntegrationSettings';
import SyncStatusDashboard from './SyncStatusDashboard';

interface BookingIntegrationManagerProps {
  property: Property;
}

const BookingIntegrationManager = ({ property }: BookingIntegrationManagerProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const hasIntegrations = !!(property.hospitable_booking_url || property.airbnb_listing_url);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Booking Management
            </CardTitle>
            <CardDescription>
              Manage reservations, pricing, and integrations for {property.title}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={hasIntegrations ? "default" : "secondary"}>
              {hasIntegrations ? "Integrated" : "Setup Required"}
            </Badge>
            {property.hospitable_booking_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(property.hospitable_booking_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Widget
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reservations
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SyncStatusDashboard property={property} />
          </TabsContent>

          <TabsContent value="reservations" className="space-y-6">
            <ReservationList propertyId={property.id} />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <PricingCalendar propertyId={property.id} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <IntegrationSettings property={property} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BookingIntegrationManager;