import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingReports } from '@/components/admin/reports/BookingReports';
import { RevenueReports } from '@/components/admin/reports/RevenueReports';
import { OccupancyReports } from '@/components/admin/reports/OccupancyReports';
import { GuestReports } from '@/components/admin/reports/GuestReports';
import { TaxReportExport } from '@/components/admin/reports/TaxReportExport';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { CalendarDays, DollarSign, TrendingUp, Users, Receipt } from 'lucide-react';

const AdminReportsPage = () => {
  const { organization } = useCurrentOrganization();

  return (
    <AdminPageWrapper
      title="Reports & Analytics"
      description="View detailed reports and export data for your vacation rental business"
    >
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Revenue</span>
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Occupancy</span>
          </TabsTrigger>
          <TabsTrigger value="guests" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Guests</span>
          </TabsTrigger>
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Taxes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <BookingReports />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueReports />
        </TabsContent>

        <TabsContent value="occupancy">
          <OccupancyReports />
        </TabsContent>

        <TabsContent value="guests">
          <GuestReports />
        </TabsContent>

        <TabsContent value="taxes">
          {organization?.id && <TaxReportExport organizationId={organization.id} />}
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  );
};

export default AdminReportsPage;
