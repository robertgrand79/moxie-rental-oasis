import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  CalendarIcon, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  MessageSquare, 
  Trash2,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Users,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useDeleteReservation } from '@/hooks/useBookingData';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import PaginationControls from '@/components/ui/pagination-controls';

interface Reservation {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  total_amount: number;
  booking_status: string;
  cleaning_status: string;
  cleaning_work_order_id?: string;
  check_in_instructions?: string;
  special_requests?: string;
  created_at: string;
  properties: {
    title: string;
    location: string;
  };
}

const ModernBookingManagement = () => {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteReservation = useDeleteReservation();

  // Get organization-scoped properties
  const { properties: orgProperties, loading: propertiesLoading } = usePropertyFetch();
  const orgPropertyIds = orgProperties.map(p => p.id);

  // Fetch paginated reservations scoped to organization properties
  const { data: paginatedResult, isLoading: reservationsLoading, refetch } = useQuery({
    queryKey: ['bookings-management', orgPropertyIds, currentPage, statusFilter, searchTerm],
    queryFn: async () => {
      if (orgPropertyIds.length === 0) return { data: [], count: 0 };

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;

      let query = supabase
        .from('property_reservations')
        .select(`
          *,
          properties:properties!inner(title, location)
        `, { count: 'exact' })
        .in('property_id', orgPropertyIds)
        .order('check_in_date', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('booking_status', statusFilter);
      }

      const { data, error, count } = await query.range(start, end);

      if (error) throw error;
      
      const mapped = (data || []).map((item: any) => ({
        ...item,
        properties: item.properties || { title: 'Unknown Property', location: '' }
      })) as Reservation[];

      return { data: mapped, count: count || 0 };
    },
    enabled: orgPropertyIds.length > 0,
  });

  const reservations = paginatedResult?.data || [];
  const totalCount = paginatedResult?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Fetch global stats from DB (not just current page)
  const { data: stats } = useQuery({
    queryKey: ['bookings-stats', orgPropertyIds],
    queryFn: async () => {
      if (orgPropertyIds.length === 0) return { total: 0, confirmed: 0, pending: 0, cancelled: 0, totalRevenue: 0 };

      const { data, error } = await supabase
        .from('property_reservations')
        .select('booking_status, total_amount')
        .in('property_id', orgPropertyIds);

      if (error) throw error;

      const records = data || [];
      const confirmed = records.filter(r => r.booking_status === 'confirmed');
      return {
        total: records.length,
        confirmed: confirmed.length,
        pending: records.filter(r => r.booking_status === 'pending').length,
        cancelled: records.filter(r => r.booking_status === 'cancelled').length,
        totalRevenue: confirmed.reduce((sum, r) => sum + (r.total_amount || 0), 0),
      };
    },
    enabled: orgPropertyIds.length > 0,
  });

  const bookingStats = stats || { total: 0, confirmed: 0, pending: 0, cancelled: 0, totalRevenue: 0 };

  const isLoading = propertiesLoading || reservationsLoading;

  // Reset to page 1 when filters change
  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  // Client-side search filter (status is handled server-side)
  const filteredReservations = useMemo(() => {
    if (!searchTerm.trim()) return reservations;
    const query = searchTerm.toLowerCase();
    return reservations.filter(r => 
      r.guest_name.toLowerCase().includes(query) ||
      r.guest_email.toLowerCase().includes(query) ||
      r.properties.title.toLowerCase().includes(query)
    );
  }, [reservations, searchTerm]);

  // Create Turno cleaning task
  const createTurnoTask = useMutation({
    mutationFn: async (reservation: Reservation) => {
      const { data, error } = await supabase.functions.invoke('create-turno-cleaning', {
        body: {
          reservation_id: reservation.id,
          property_id: reservation.property_id,
          guest_name: reservation.guest_name,
          check_out_date: reservation.check_out_date,
          check_in_date: reservation.check_in_date,
          special_requests: reservation.special_requests,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cleaning task sent to Turno successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['bookings-management'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create Turno cleaning task",
        variant: "destructive",
      });
      console.error('Turno task creation error:', error);
    },
  });

  // Update reservation
  const updateReservation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Reservation> }) => {
      const { data, error } = await supabase
        .from('property_reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reservation updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['bookings-management'] });
      setSelectedReservation(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reservation",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'cancelled': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getCleaningStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'turno_scheduled': return 'secondary';
      case 'scheduled': return 'outline';
      case 'pending': return 'destructive';
      default: return 'outline';
    }
  };

  const handleDeleteReservation = (reservationId: string, guestName: string) => {
    deleteReservation.mutate(reservationId, {
      onSuccess: () => {
        toast({
          title: "Booking Deleted",
          description: `Reservation for ${guestName} has been deleted and calendar dates unblocked.`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete reservation",
          variant: "destructive",
        });
      }
    });
  };

  const renderReservationCard = (reservation: Reservation) => (
    <Card key={reservation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{reservation.guest_name}</span>
          </div>
          <div className="flex gap-1.5">
            <Badge variant={getStatusColor(reservation.booking_status)}>
              {reservation.booking_status}
            </Badge>
            <Badge variant={getCleaningStatusColor(reservation.cleaning_status)} className="text-xs">
              {reservation.cleaning_status}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{reservation.properties.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>
              {format(new Date(reservation.check_in_date), 'MMM dd')} - {format(new Date(reservation.check_out_date), 'MMM dd')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{reservation.guest_count} guests</span>
            </div>
            <div className="flex items-center gap-1 font-medium text-foreground">
              <DollarSign className="h-3 w-3" />
              <span>${reservation.total_amount}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t">
          {reservation.cleaning_status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => createTurnoTask.mutate(reservation)}
              disabled={createTurnoTask.isPending}
              className="flex-1"
            >
              Send to Turno
            </Button>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedReservation(reservation)}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Manage
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage Reservation - {reservation.guest_name}</DialogTitle>
              </DialogHeader>
              
              {selectedReservation && (
                <ReservationManageForm
                  reservation={selectedReservation}
                  onUpdate={(updates) => 
                    updateReservation.mutate({ 
                      id: selectedReservation.id, 
                      updates 
                    })
                  }
                  isUpdating={updateReservation.isPending}
                  getCleaningStatusColor={getCleaningStatusColor}
                />
              )}
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="destructive"
                disabled={deleteReservation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the reservation for {reservation.guest_name}? 
                  This will also unblock the calendar dates.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteReservation(reservation.id, reservation.guest_name)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  const renderReservationListItem = (reservation: Reservation) => (
    <div key={reservation.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{reservation.guest_name}</span>
            </div>
            <Badge variant={getStatusColor(reservation.booking_status)}>
              {reservation.booking_status}
            </Badge>
            <Badge variant={getCleaningStatusColor(reservation.cleaning_status)}>
              Cleaning: {reservation.cleaning_status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {reservation.guest_email}
            </div>
            {reservation.guest_phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {reservation.guest_phone}
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {reservation.properties.title}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
              <span>
                {format(new Date(reservation.check_in_date), 'MMM dd')} - {format(new Date(reservation.check_out_date), 'MMM dd')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span>${reservation.total_amount}</span>
            </div>
            <span className="text-muted-foreground">{reservation.guest_count} guests</span>
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          {reservation.cleaning_status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => createTurnoTask.mutate(reservation)}
              disabled={createTurnoTask.isPending}
            >
              Send to Turno
            </Button>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedReservation(reservation)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Manage
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage Reservation - {reservation.guest_name}</DialogTitle>
              </DialogHeader>
              
              {selectedReservation && (
                <ReservationManageForm
                  reservation={selectedReservation}
                  onUpdate={(updates) => 
                    updateReservation.mutate({ 
                      id: selectedReservation.id, 
                      updates 
                    })
                  }
                  isUpdating={updateReservation.isPending}
                  getCleaningStatusColor={getCleaningStatusColor}
                />
              )}
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="destructive"
                disabled={deleteReservation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the reservation for {reservation.guest_name}? 
                  This will also unblock the calendar dates.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteReservation(reservation.id, reservation.guest_name)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="space-y-4">
        {/* Title and Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Booking Management</h1>
            {/* Inline Stats */}
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />
                <span className="font-medium text-foreground">{bookingStats.total}</span> Total
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">{bookingStats.confirmed}</span> Confirmed
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-600">{bookingStats.pending}</span> Pending
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-600">${bookingStats.totalRevenue.toLocaleString()}</span> Revenue
              </span>
            </div>
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
                  placeholder="Search guests, properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredReservations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No reservations found</p>
              <p className="text-sm mt-1">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'No bookings yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservations.map(renderReservationCard)}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Reservations</CardTitle>
            <CardDescription>Recent booking activity and cleaning status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReservations.map(renderReservationListItem)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Reservation Management Form Component
const ReservationManageForm = ({ 
  reservation, 
  onUpdate, 
  isUpdating,
  getCleaningStatusColor
}: { 
  reservation: Reservation; 
  onUpdate: (updates: Partial<Reservation>) => void;
  isUpdating: boolean;
  getCleaningStatusColor: (status: string) => "default" | "destructive" | "secondary" | "outline";
}) => {
  const [checkInInstructions, setCheckInInstructions] = useState(reservation.check_in_instructions || '');
  const [specialRequests, setSpecialRequests] = useState(reservation.special_requests || '');
  const [bookingStatus, setBookingStatus] = useState(reservation.booking_status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      check_in_instructions: checkInInstructions,
      special_requests: specialRequests,
      booking_status: bookingStatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Booking Status</label>
          <select
            value={bookingStatus}
            onChange={(e) => setBookingStatus(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
          >
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Cleaning Status</label>
          <div className="mt-2">
            <Badge variant={getCleaningStatusColor(reservation.cleaning_status)}>
              {reservation.cleaning_status}
            </Badge>
          </div>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Check-in Instructions</label>
        <Textarea
          value={checkInInstructions}
          onChange={(e) => setCheckInInstructions(e.target.value)}
          placeholder="Add check-in instructions for the guest..."
          className="mt-1"
          rows={3}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Special Requests / Notes</label>
        <Textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Guest requests or internal notes..."
          className="mt-1"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Reservation'}
        </Button>
      </div>
    </form>
  );
};

export default ModernBookingManagement;
