import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Wifi,
  Key,
  Calendar,
  MessageSquare,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Copy,
  Check,
  MapPin,
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const MobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch guest profile
  const { data: profile } = useQuery({
    queryKey: ['mobile-dashboard-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('guest_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching guest profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });

  // Fetch guest reservations
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['mobile-dashboard-reservations', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];
      const { data, error } = await supabase
        .from('property_reservations')
        .select('*, properties:property_id(id, title, address, wifi_ssid, wifi_password, check_in_instructions)')
        .eq('guest_email', profile.email)
        .order('check_in_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.email,
  });

  const activeReservation = reservations.find((r: any) => {
    const checkIn = new Date(r.check_in_date);
    const checkOut = new Date(r.check_out_date);
    const now = new Date();
    return checkIn <= now && checkOut >= now && r.booking_status === 'confirmed';
  });

  const upcomingReservation = reservations
    .filter((r: any) => new Date(r.check_in_date) > new Date() && r.booking_status === 'confirmed')
    .sort((a: any, b: any) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime())[0];

  const handleCopyWifi = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWifi(true);
    toast.success('Wi-Fi credentials copied to clipboard');
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    toast.success('Access code copied to clipboard');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const daysToTrip = upcomingReservation
    ? differenceInDays(new Date(upcomingReservation.check_in_date), new Date())
    : null;

  return (
    <div className="flex-1 p-4 space-y-6 overflow-y-auto">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-4 translate-x-4 rounded-full bg-white/10 blur-xl" />
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-200">
              Moxie Vacation Rentals
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-1">
              Welcome back, {profile?.first_name || 'Guest'}!
            </h2>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400 animate-pulse" />
              <div className="text-sm">
                <span className="font-bold text-amber-300">Gold Status Tier</span>
                <p className="text-[11px] text-violet-200">Exclusive member perks active</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-white">
                {profile?.loyalty_points || 0}
              </span>
              <p className="text-[10px] text-violet-200 uppercase tracking-wider font-bold">
                Loyalty Points
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Card className="animate-pulse">
            <CardContent className="h-40 bg-slate-100 dark:bg-zinc-800 rounded-3xl" />
          </Card>
        </div>
      )}

      {/* Active Stay Card */}
      {!isLoading && activeReservation && (
        <Card className="overflow-hidden rounded-3xl border-0 shadow-lg bg-white dark:bg-zinc-900">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-white flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider">Active Stay</span>
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
              Checked In
            </Badge>
          </div>
          <CardContent className="p-6 space-y-5">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                {activeReservation.properties?.title || 'Property'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {activeReservation.properties?.address || 'Directions not available'}
              </p>
            </div>

            {/* Quick Access Access Code & WiFi */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <Key className="h-4 w-4" />
                  <span className="text-xs font-bold">Access Code</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-black text-amber-900 dark:text-amber-200">
                    {activeReservation.access_code || 'TBD'}
                  </span>
                  {activeReservation.access_code && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(activeReservation.access_code)}
                      className="h-8 w-8 text-amber-700 dark:text-amber-400"
                    >
                      {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs font-bold">Property Wi-Fi</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate text-indigo-900 dark:text-indigo-200">
                    {activeReservation.properties?.wifi_ssid || 'Unavailable'}
                  </span>
                  {activeReservation.properties?.wifi_ssid && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleCopyWifi(
                          `SSID: ${activeReservation.properties.wifi_ssid}\nPassword: ${activeReservation.properties.wifi_password}`
                        )
                      }
                      className="h-8 w-8 text-indigo-700 dark:text-indigo-400"
                    >
                      {copiedWifi ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                onClick={() => navigate(`/mobile/guidebook/${activeReservation.property_id}`)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Digital Guidebook
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                onClick={() => navigate('/mobile/chat')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Host
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Stay Card */}
      {!isLoading && !activeReservation && upcomingReservation && (
        <Card className="overflow-hidden rounded-3xl border-0 shadow-lg bg-white dark:bg-zinc-900">
          <div className="bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-4 text-white">
            <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-85">Upcoming Adventure</span>
            <h3 className="text-lg font-black mt-1 truncate">
              {upcomingReservation.properties?.title || 'Property'}
            </h3>
            <div className="flex items-center gap-1 text-xs opacity-90 mt-1">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(upcomingReservation.check_in_date), 'MMM dd')} -{' '}
                {format(new Date(upcomingReservation.check_out_date), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-zinc-800/40 p-4 border border-slate-100 dark:border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground font-semibold">Countdown</span>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">
                  {daysToTrip === 0 ? 'Starts Today!' : `${daysToTrip} days to go`}
                </p>
              </div>
              <Badge variant="outline" className="border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:border-indigo-900 dark:text-indigo-400">
                Confirmed
              </Badge>
            </div>

            <Button
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate(`/mobile/stays`)}
            >
              Manage Booking
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State / No Stays */}
      {!isLoading && !activeReservation && !upcomingReservation && (
        <Card className="rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-6 text-center">
          <CardContent className="space-y-4 pt-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200">No active bookings</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                You don't have any stays scheduled right now. Browse our beautiful vacation getaways!
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/properties')}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grid Menu Links */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/mobile/stays')}
          className="flex flex-col text-left p-5 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800 hover:shadow-md transition-all group"
        >
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Calendar className="h-5 w-5" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">My Stays</span>
          <span className="text-[11px] text-muted-foreground mt-1">All stay histories</span>
        </button>

        <button
          onClick={() => navigate('/mobile/guidebook')}
          className="flex flex-col text-left p-5 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800 hover:shadow-md transition-all group"
        >
          <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Digital Manual</span>
          <span className="text-[11px] text-muted-foreground mt-1">House rules & guides</span>
        </button>

        <button
          onClick={() => navigate('/mobile/requests')}
          className="flex flex-col text-left p-5 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800 hover:shadow-md transition-all group"
        >
          <div className="h-10 w-10 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Get Support</span>
          <span className="text-[11px] text-muted-foreground mt-1">Report service issues</span>
        </button>

        <button
          onClick={() => navigate('/mobile/contractor')}
          className="flex flex-col text-left p-5 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800 hover:shadow-md transition-all group"
        >
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Wrench className="h-5 w-5" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Contractor Hub</span>
          <span className="text-[11px] text-muted-foreground mt-1">Clean & Maintenance</span>
        </button>
      </div>

      {/* Travel Rewards Section */}
      <Card className="rounded-3xl border-0 shadow-sm bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Grow your rewards points</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Earn 10 loyalty points for every dollar spent on bookings. Redeem them during checkout on your next stay for instant savings!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MobileDashboard;
