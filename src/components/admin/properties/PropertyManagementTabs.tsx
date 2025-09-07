import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Property } from '@/types/property';
import { Building, Calendar, DollarSign, Settings } from 'lucide-react';
import BookingIntegrationManager from './BookingIntegrationManager';
import CalendarSyncManager from './CalendarSyncManager';

interface PropertyManagementTabsProps {
  property: Property;
}

const PropertyManagementTabs = ({ property }: PropertyManagementTabsProps) => {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Property Details
        </TabsTrigger>
        <TabsTrigger value="booking" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Booking Management
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-6">
        <div className="text-center py-8 text-muted-foreground">
          Property details and editing interface will appear here
        </div>
      </TabsContent>

      <TabsContent value="booking" className="space-y-6">
        <CalendarSyncManager property={property} />
        <BookingIntegrationManager property={property} />
      </TabsContent>
    </Tabs>
  );
};

export default PropertyManagementTabs;