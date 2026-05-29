import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  MapPin,
  MessageSquare,
  BookOpen,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface Reservation {
  id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  total_amount: number;
  booking_status: string;
  cleaning_status: string;
  access_code: string | null;
  guest_name: string;
  properties: {
    title: string;
    address: string;
    wifi_ssid: string | null;
  };
}

const MobileStays: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('current');

  // Fetch guest profile
  const { data: profile } = useQuery({
    queryKey: ['mobile-stays-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('guest_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch guest reservations
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['mobile-stays-reservations', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];
      const { data, error } = await supabase
        .from('property_reservations')
        .select('*, properties:property_id(title, address, wifi_ssid)')
        .eq('guest_email', profile.email)
        .order('check_in_date', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((item) => ({
        ...item,
        properties: item.properties || { title: 'Property', address: '', wifi_ssid: null }
      })) as Reservation[];
    },
    enabled: !!profile?.email,
  });

  const now = new Date();
  
  const currentStays = reservations.filter(r => {
    const checkIn = new Date(r.check_in_date);
    const checkOut = new Date(r.check_out_date);
    return checkIn <= now && checkOut >= now && r.booking_status === 'confirmed';
  });

  const upcomingStays = reservations.filter(r => 
    new Date(r.check_in_date) > now && r.booking_status === 'confirmed'
  );

  const pastStays = reservations.filter(r => 
    new Date(r.check_out_date) < now && r.booking_status === 'confirmed'
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStayCard = (reservation: Reservation, isCurrent = false) => {
    const checkIn = new Date(reservation.check_in_date);
    const checkOut = new Date(reservation.check_out_date);

    return (
      <Card key={reservation.id} className="overflow-hidden rounded-3xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 truncate max-w-[220px]">
                {reservation.properties.title}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {reservation.properties.address}
              </p>
            </div>
            {getStatusBadge(reservation.booking_status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm border-y py-3 border-slate-50 dark:border-zinc-800/50">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Check-in</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>{format(checkIn, 'MMM dd, yyyy')}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Check-out</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>{format(checkOut, 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                {reservation.guest_count} guests
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                ${reservation.total_amount}
              </span>
            </div>
            
            {reservation.access_code && isCurrent && (
              <span className="font-mono bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold">
                Code: {reservation.access_code}
              </span>
            )}
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs"
              onClick={() => navigate(`/mobile/guidebook/${reservation.property_id}`)}
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Guidebook
            </Button>
            
            {!isCurrent && new Date(reservation.check_in_date) > now && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 text-xs dark:border-indigo-900 dark:text-indigo-400"
                onClick={() => navigate(`/mobile/checkin/${reservation.id}`)}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Online Check-in
              </Button>
            )}

            {(isCurrent || new Date(reservation.check_out_date) < now) && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 rounded-xl border-slate-200 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-xs"
                onClick={() => navigate('/mobile/chat')}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Support
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-grow p-4 flex flex-col overflow-y-auto">
      {/* Header bar */}
      <div className="mb-4">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">My Stay Bookings</h2>
        <p className="text-xs text-muted-foreground">Keep track of your vacation details</p>
      </div>

      {isLoading ? (
        <div className="space-y-4 flex-grow flex flex-col justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading stays...</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-3 rounded-full bg-slate-100 dark:bg-zinc-800 p-1 mb-5">
            <TabsTrigger value="current" className="rounded-full text-xs py-2">
              Active ({currentStays.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-full text-xs py-2">
              Upcoming ({upcomingStays.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-full text-xs py-2">
              Past ({pastStays.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4 focus-visible:outline-none">
            {currentStays.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800">
                <Clock className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No active stay</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
                  You aren't checked into any property right now. Stays activate on check-in day.
                </p>
              </div>
            ) : (
              currentStays.map(r => renderStayCard(r, true))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4 focus-visible:outline-none">
            {upcomingStays.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800">
                <Calendar className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No upcoming stays</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
                  Planning another trip? Find your next perfect getaway by browsing our listings.
                </p>
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 mt-4 rounded-xl text-xs"
                  onClick={() => navigate('/properties')}
                >
                  Browse Vacation Spots
                </Button>
              </div>
            ) : (
              upcomingStays.map(r => renderStayCard(r))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 focus-visible:outline-none">
            {pastStays.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800">
                <Receipt className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No past stays</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
                  Your past travel receipts and instructions will populate here after you check out.
                </p>
              </div>
            ) : (
              pastStays.map(r => renderStayCard(r))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default MobileStays;
