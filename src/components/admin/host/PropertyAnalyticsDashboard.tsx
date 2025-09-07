import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, DollarSign, Users, Home, TrendingUp, AlertCircle } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface PropertyAnalytics {
  property_id: string;
  property_title: string;
  total_revenue: number;
  booking_count: number;
  occupancy_rate: number;
  average_daily_rate: number;
  cleaning_costs: number;
  maintenance_costs: number;
  net_revenue: number;
}

interface ReservationData {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  booking_status: string;
  cleaning_status: string;
  properties: {
    title: string;
  };
}

const PropertyAnalyticsDashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const { properties = [] } = useProperties();

  // Fetch property analytics
  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['property-analytics', selectedProperty],
    queryFn: async () => {
      let query = supabase
        .from('property_reservations')
        .select(`
          id,
          property_id,
          total_amount,
          booking_status,
          check_in_date,
          check_out_date,
          properties:properties!inner(title)
        `);

      if (selectedProperty !== 'all') {
        query = query.eq('property_id', selectedProperty);
      }

      const { data, error } = await query.eq('booking_status', 'confirmed');

      if (error) throw error;
      if (!data) return [];

      // Calculate analytics per property
      const propertyStats: Record<string, PropertyAnalytics> = {};

      data.forEach((reservation: any) => {
        const propertyId = reservation.property_id;
        
        if (!propertyStats[propertyId]) {
          propertyStats[propertyId] = {
            property_id: propertyId,
            property_title: reservation.properties?.title || 'Unknown Property',
            total_revenue: 0,
            booking_count: 0,
            occupancy_rate: 0,
            average_daily_rate: 0,
            cleaning_costs: 0,
            maintenance_costs: 0,
            net_revenue: 0,
          };
        }

        propertyStats[propertyId].total_revenue += reservation.total_amount;
        propertyStats[propertyId].booking_count += 1;
        
        // Calculate days
        const checkIn = new Date(reservation.check_in_date);
        const checkOut = new Date(reservation.check_out_date);
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        
        if (days > 0) {
          propertyStats[propertyId].average_daily_rate = 
            propertyStats[propertyId].total_revenue / 
            (propertyStats[propertyId].booking_count * days);
        }
      });

      return Object.values(propertyStats);
    },
  });

  // Fetch recent reservations
  const { data: recentReservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['recent-reservations', selectedProperty],
    queryFn: async () => {
      let query = supabase
        .from('property_reservations')
        .select(`
          *,
          properties:properties!inner(title)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (selectedProperty !== 'all') {
        query = query.eq('property_id', selectedProperty);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (!data) return [];
      
      return data.map((item: any) => ({
        ...item,
        properties: item.properties || { title: 'Unknown Property' }
      })) as ReservationData[];
    },
  });

  const totalRevenue = analytics.reduce((sum, prop) => sum + prop.total_revenue, 0);
  const totalBookings = analytics.reduce((sum, prop) => sum + prop.booking_count, 0);
  const averageOccupancy = analytics.length > 0 
    ? analytics.reduce((sum, prop) => sum + prop.occupancy_rate, 0) / analytics.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Analytics</h1>
          <p className="text-muted-foreground">Track performance and manage your properties</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Confirmed reservations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageOccupancy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.length}</div>
            <p className="text-xs text-muted-foreground">Active properties</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Performance</CardTitle>
              <CardDescription>Revenue and booking metrics by property</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
              ) : analytics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No booking data available</div>
              ) : (
                <div className="space-y-4">
                  {analytics.map((property) => (
                    <div key={property.property_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{property.property_title}</h3>
                        <Badge variant="outline">{property.booking_count} bookings</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-medium">${property.total_revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ADR</p>
                          <p className="font-medium">${property.average_daily_rate.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Occupancy</p>
                          <p className="font-medium">{property.occupancy_rate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Net Revenue</p>
                          <p className="font-medium">${(property.total_revenue - property.cleaning_costs - property.maintenance_costs).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reservations</CardTitle>
              <CardDescription>Latest booking activity</CardDescription>
            </CardHeader>
            <CardContent>
              {reservationsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading reservations...</div>
              ) : recentReservations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No reservations found</div>
              ) : (
                <div className="space-y-4">
                  {recentReservations.map((reservation) => (
                    <div key={reservation.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{reservation.guest_name}</p>
                            <Badge variant={reservation.booking_status === 'confirmed' ? 'default' : 'secondary'}>
                              {reservation.booking_status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{reservation.properties.title}</p>
                          <p className="text-sm">
                            {format(new Date(reservation.check_in_date), 'MMM dd')} - {format(new Date(reservation.check_out_date), 'MMM dd')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${reservation.total_amount}</p>
                          <Badge 
                            variant={reservation.cleaning_status === 'completed' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            Cleaning: {reservation.cleaning_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Integration</CardTitle>
              <CardDescription>Work orders and cleaning status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Maintenance requests are automatically integrated with your existing work order system
                </p>
                <Button variant="outline">
                  View Work Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyAnalyticsDashboard;