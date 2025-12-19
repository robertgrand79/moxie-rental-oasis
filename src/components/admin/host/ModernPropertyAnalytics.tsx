import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  DollarSign, 
  Users, 
  Home, 
  TrendingUp,
  RefreshCw,
  Calendar,
  Wrench,
  Search,
  LayoutGrid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RecentBookingsDrawer from './dialogs/RecentBookingsDrawer';
import MaintenanceDrawer from './dialogs/MaintenanceDrawer';

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

const ModernPropertyAnalytics = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Drawer states
  const [bookingsOpen, setBookingsOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  
  // Get organization-scoped properties
  const { properties = [], loading: propertiesLoading } = usePropertyFetch();
  const orgPropertyIds = properties.map(p => p.id);

  // Fetch property analytics scoped to organization
  const { data: analytics = [], isLoading: analyticsLoading, refetch } = useQuery({
    queryKey: ['property-analytics', selectedProperty, orgPropertyIds],
    queryFn: async () => {
      if (orgPropertyIds.length === 0) return [];

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
        `)
        .in('property_id', orgPropertyIds);

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
    enabled: orgPropertyIds.length > 0,
  });

  // Fetch recent reservations scoped to organization
  const { data: recentReservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['recent-reservations', selectedProperty, orgPropertyIds],
    queryFn: async () => {
      if (orgPropertyIds.length === 0) return [];

      let query = supabase
        .from('property_reservations')
        .select(`
          *,
          properties:properties!inner(title)
        `)
        .in('property_id', orgPropertyIds)
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
    enabled: orgPropertyIds.length > 0,
  });

  const totalRevenue = analytics.reduce((sum, prop) => sum + prop.total_revenue, 0);
  const totalBookings = analytics.reduce((sum, prop) => sum + prop.booking_count, 0);
  const averageOccupancy = analytics.length > 0 
    ? analytics.reduce((sum, prop) => sum + prop.occupancy_rate, 0) / analytics.length 
    : 0;

  // Filter analytics based on search
  const filteredAnalytics = analytics.filter(prop => 
    prop.property_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="space-y-4">
        {/* Title, Stats, and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Property Analytics</h1>
            {/* Inline Stats */}
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">${totalRevenue.toLocaleString()}</span> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-600">{totalBookings}</span> Bookings
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-600">{averageOccupancy.toFixed(1)}%</span> Occupancy
              </span>
              <span className="flex items-center gap-1.5">
                <Home className="h-4 w-4" />
                <span className="font-medium text-foreground">{analytics.length}</span> Properties
              </span>
            </div>
          </div>
          
          {/* Right side: Secondary actions */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setBookingsOpen(true)}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Recent Bookings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setMaintenanceOpen(true)}
                  >
                    <Wrench className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Maintenance</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Left side: Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Right side: View Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg p-1 bg-background">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8 w-8 p-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Performance Content */}
      {analyticsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredAnalytics.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No property data available</p>
              <p className="text-sm mt-1">
                {searchQuery ? 'Try adjusting your search criteria' : 'No confirmed bookings found'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnalytics.map((property) => (
            <Card key={property.property_id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-1">{property.property_title}</CardTitle>
                  <Badge variant="outline">{property.booking_count} bookings</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Revenue</p>
                    <p className="text-lg font-semibold text-green-600">${property.total_revenue.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">ADR</p>
                    <p className="text-lg font-semibold">${property.average_daily_rate.toFixed(0)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Occupancy</p>
                    <p className="text-lg font-semibold text-blue-600">{property.occupancy_rate.toFixed(1)}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Net Revenue</p>
                    <p className="text-lg font-semibold text-purple-600">
                      ${(property.total_revenue - property.cleaning_costs - property.maintenance_costs).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
            <CardDescription>Revenue and booking metrics by property</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAnalytics.map((property) => (
                <div key={property.property_id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{property.property_title}</h3>
                    <Badge variant="outline">{property.booking_count} bookings</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-medium text-green-600">${property.total_revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ADR</p>
                      <p className="font-medium">${property.average_daily_rate.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Occupancy</p>
                      <p className="font-medium text-blue-600">{property.occupancy_rate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Net Revenue</p>
                      <p className="font-medium text-purple-600">${(property.total_revenue - property.cleaning_costs - property.maintenance_costs).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drawers */}
      <RecentBookingsDrawer 
        open={bookingsOpen} 
        onOpenChange={setBookingsOpen}
        reservations={recentReservations}
        loading={reservationsLoading}
      />
      <MaintenanceDrawer 
        open={maintenanceOpen} 
        onOpenChange={setMaintenanceOpen} 
      />
    </div>
  );
};

export default ModernPropertyAnalytics;
