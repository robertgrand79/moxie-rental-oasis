import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CalendarIcon, MapPin, Phone, Mail, Star, MessageSquare, Bell, User, CreditCard,
  Wifi, BookOpen, ScrollText, Clock, ArrowRight, Sparkles, ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface GuestReservation {
  id: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  total_amount: number;
  booking_status: string;
  cleaning_status: string;
  check_in_instructions?: string;
  properties: {
    title: string;
    address: string;
  };
}

interface GuestPreferences {
  dietary?: string[];
  accessibility?: string[];
  interests?: string[];
}

interface NotificationSettings {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
}

interface GuestProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  profile_image_url?: string;
  loyalty_points: number;
  preferences: GuestPreferences | null;
  notification_settings: NotificationSettings | null;
}

const GuestPortalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'home' | 'stays' | 'profile' | 'support'>('home');

  const { data: profile } = useQuery({
    queryKey: ['guest-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('guest_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        const { data: newProfile, error: createError } = await supabase
          .from('guest_profiles')
          .insert({
            user_id: user.id,
            email: user.email || '',
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
          })
          .select()
          .single();
        if (createError) throw createError;
        return newProfile as GuestProfile;
      }
      return data as GuestProfile;
    },
    enabled: !!user,
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['guest-reservations', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from('property_reservations')
        .select(`*, properties:properties!inner(title, address)`)
        .eq('guest_email', profile.email)
        .order('check_in_date', { ascending: false });
      if (error) throw error;
      if (!data) return [];
      return data.map((item) => ({
        ...item,
        properties: item.properties || { title: 'Property', address: '' }
      })) as GuestReservation[];
    },
    enabled: !!profile?.email,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['guest-notifications', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from('guest_notifications')
        .select('*')
        .eq('guest_profile_id', profile.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const currentReservations = reservations.filter(r => {
    const checkIn = new Date(r.check_in_date);
    const checkOut = new Date(r.check_out_date);
    const now = new Date();
    return checkIn <= now && checkOut >= now && r.booking_status === 'confirmed';
  });

  const upcomingReservations = reservations.filter(r =>
    new Date(r.check_in_date) > new Date() && r.booking_status === 'confirmed'
  );

  const activeStay = currentReservations[0] || upcomingReservations[0];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-sm">
          <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
            <User className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-3xl tracking-tight mb-2">Guest Portal</h1>
          <p className="text-muted-foreground mb-8">Sign in to access your stays and concierge services</p>
          <Button
            onClick={() => navigate('/auth')}
            className="rounded-full shadow-sm hover:-translate-y-0.5 transition-all px-8"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const guestName = profile?.first_name || 'Guest';
  const propertyName = activeStay?.properties?.title;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header with full-bleed feel */}
      <div className="relative overflow-hidden">
        {/* Gradient background simulating property imagery overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/4 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="relative px-4 pt-safe-top">
          {/* Top bar */}
          <div className="flex items-center justify-between py-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarImage src={profile?.profile_image_url} />
                <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              {notifications.length > 0 && (
                <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-0">
                  {notifications.length} new
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <Bell className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>

          {/* Welcome greeting */}
          <div className="max-w-2xl mx-auto pb-8 pt-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">
              Welcome back
            </p>
            <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-foreground">
              {propertyName
                ? <>Hello, {guestName}.<br /><span className="text-primary/80">Enjoy your stay.</span></>
                : <>Hello, {guestName}.</>
              }
            </h1>
            {activeStay && (
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>{activeStay.properties.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto -mt-2 pb-32 space-y-6">
        {/* Active Stay Card */}
        {activeStay && (
          <div className="rounded-2xl overflow-hidden backdrop-blur-md bg-card/80 border border-border/30 shadow-sm">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {currentReservations.length > 0 ? 'Current Stay' : 'Upcoming Stay'}
                </p>
                <Badge
                  variant="secondary"
                  className="rounded-full text-[10px] px-2.5 py-0.5 bg-green-500/10 text-green-700 border-0 font-medium"
                >
                  {currentReservations.length > 0 ? 'Checked In' : 'Confirmed'}
                </Badge>
              </div>
              <h3 className="font-serif text-xl tracking-tight mb-1">{activeStay.properties.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>
                    {format(new Date(activeStay.check_in_date), 'MMM d')} – {format(new Date(activeStay.check_out_date), 'MMM d')}
                  </span>
                </div>
                <span className="text-border">·</span>
                <span>{activeStay.guest_count} guest{activeStay.guest_count !== 1 ? 's' : ''}</span>
              </div>
              {currentReservations.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" strokeWidth={1.5} />
                  <span>
                    {differenceInDays(new Date(activeStay.check_out_date), new Date())} night{differenceInDays(new Date(activeStay.check_out_date), new Date()) !== 1 ? 's' : ''} remaining
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Action Grid – glassmorphic cards */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Quick Access</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Wifi, label: 'Wi-Fi & Access', desc: 'Codes & passwords', action: () => {} },
              { icon: BookOpen, label: 'House Guide', desc: 'Rules & amenities', action: () => activeStay && navigate(`/guest/guidebook/${activeStay.id}`) },
              { icon: MapPin, label: 'Local Guide', desc: 'Dining & activities', action: () => activeStay && navigate(`/guest/guidebook/${activeStay.id}`) },
              { icon: MessageSquare, label: 'Get Help', desc: 'Chat with host', action: () => {} },
            ].map(({ icon: Icon, label, desc, action }) => (
              <button
                key={label}
                onClick={action}
                className="group rounded-2xl p-4 text-left backdrop-blur-md bg-card/60 border border-border/20 hover:border-border/40 hover:bg-card/80 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] min-h-[100px]"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium tracking-tight">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Stays */}
        {upcomingReservations.length > 0 && currentReservations.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Upcoming</p>
            <div className="space-y-3">
              {upcomingReservations.slice(0, 2).map((res) => (
                <div
                  key={res.id}
                  className="rounded-2xl p-4 backdrop-blur-md bg-card/60 border border-border/20 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-medium tracking-tight">{res.properties.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(res.check_in_date), 'MMM d')} – {format(new Date(res.check_out_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Updates</p>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-2xl p-4 backdrop-blur-md bg-card/60 border border-border/20 flex items-start gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium tracking-tight">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loyalty Points */}
        {(profile?.loyalty_points ?? 0) > 0 && (
          <div className="rounded-2xl p-5 backdrop-blur-md bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Loyalty Points</p>
                <p className="text-3xl font-semibold tracking-tight mt-1">{profile?.loyalty_points}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no reservations */}
        {reservations.length === 0 && (
          <div className="py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="h-8 w-8 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-medium tracking-tight mt-4">No upcoming stays</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              When you book a stay, your reservation details and concierge services will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation – frosted glass */}
      <div className="fixed bottom-0 inset-x-0 backdrop-blur-xl bg-background/80 border-t border-border/20 pb-safe-bottom z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
          {[
            { icon: Sparkles, label: 'Home', view: 'home' as const },
            { icon: CalendarIcon, label: 'Stays', view: 'stays' as const },
            { icon: User, label: 'Profile', view: 'profile' as const },
            { icon: MessageSquare, label: 'Support', view: 'support' as const },
          ].map(({ icon: Icon, label, view }) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors min-h-[44px] ${
                activeView === view
                  ? 'text-primary'
                  : 'text-muted-foreground/60 hover:text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={activeView === view ? 2 : 1.5} />
              <span className="text-[10px] tracking-wide">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuestPortalDashboard;
