import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CalendarIcon, User, Mail, Phone, MapPin, DollarSign, MessageSquare, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useDeleteReservation } from '@/hooks/useBookingData';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
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

const BookingManagement = () => {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteReservation = useDeleteReservation();

  // Get organization-scoped properties
  const { properties: orgProperties, loading: propertiesLoading } = usePropertyFetch();
  const orgPropertyIds = orgProperties.map(p => p.id);

  // Fetch reservations scoped to organization properties
  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['bookings-management', searchTerm, statusFilter, orgPropertyIds],
    queryFn: async () => {
      if (orgPropertyIds.length === 0) return [];

      let query = supabase
        .from('property_reservations')
        .select(`
          *,
          properties:properties!inner(title, location)
        `)
        .in('property_id', orgPropertyIds)
        .order('check_in_date', { ascending: false });

      if (searchTerm) {
        query = query.or(`guest_name.ilike.%${searchTerm}%,guest_email.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('booking_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (!data) return [];
      
      return data.map((item: any) => ({
        ...item,
        properties: item.properties || { title: 'Unknown Property', location: '' }
      })) as Reservation[];
    },
    enabled: orgPropertyIds.length > 0,
  });

  const isLoading = propertiesLoading || reservationsLoading;

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

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = !searchTerm || 
      (reservation.guest_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (reservation.guest_email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reservation.booking_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-muted-foreground">Manage guest reservations and cleaning coordination</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by guest name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations</CardTitle>
          <CardDescription>Recent booking activity and cleaning status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading reservations...</div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No reservations found</div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div key={reservation.id} className="border rounded-lg p-4">
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
                              This will also unblock the calendar dates ({format(new Date(reservation.check_in_date), 'MMM dd')} - {format(new Date(reservation.check_out_date), 'MMM dd')}).
                              This action cannot be undone.
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Reservation Management Form Component
const ReservationManageForm = ({ 
  reservation, 
  onUpdate, 
  isUpdating 
}: { 
  reservation: Reservation; 
  onUpdate: (updates: Partial<Reservation>) => void;
  isUpdating: boolean;
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
            className="w-full mt-1 px-3 py-2 border rounded-md"
          >
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Cleaning Status</label>
          <Badge variant={getCleaningStatusColor(reservation.cleaning_status)} className="mt-2">
            {reservation.cleaning_status}
          </Badge>
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

// Helper function moved outside component
const getCleaningStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'default';
    case 'turno_scheduled': return 'secondary';
    case 'scheduled': return 'outline';
    case 'pending': return 'destructive';
    default: return 'outline';
  }
};

export default BookingManagement;