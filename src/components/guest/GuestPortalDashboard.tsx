import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, MapPin, Phone, Mail, Star, MessageSquare, Bell, User, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
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
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch guest profile
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
        // Create profile if it doesn't exist
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

  // Fetch guest reservations
  const { data: reservations = [] } = useQuery({
    queryKey: ['guest-reservations', profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from('property_reservations')
        .select(`
          *,
          properties:properties!inner(title, address)
        `)
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

  // Fetch guest notifications
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

  const upcomingReservations = reservations.filter(r => 
    new Date(r.check_in_date) > new Date() && r.booking_status === 'confirmed'
  );

  const currentReservations = reservations.filter(r => {
    const checkIn = new Date(r.check_in_date);
    const checkOut = new Date(r.check_out_date);
    const now = new Date();
    return checkIn <= now && checkOut >= now && r.booking_status === 'confirmed';
  });

  const pastReservations = reservations.filter(r => 
    new Date(r.check_out_date) < new Date() && r.booking_status === 'confirmed'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'cancelled': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>Guest Portal</CardTitle>
            <CardDescription>Please sign in to access your reservations</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.profile_image_url} />
              <AvatarFallback>
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {profile?.first_name || 'Guest'}!
              </h1>
              <p className="text-muted-foreground">
                {profile?.loyalty_points || 0} loyalty points • {reservations.length} total bookings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                {notifications.length}
              </Button>
            )}
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Support
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reservations">My Stays</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Stay</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentReservations.length}</div>
                  <p className="text-xs text-muted-foreground">Active reservations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingReservations.length}</div>
                  <p className="text-xs text-muted-foreground">Future bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.loyalty_points || 0}</div>
                  <p className="text-xs text-muted-foreground">Earned points</p>
                </CardContent>
              </Card>
            </div>

            {/* Current Reservations */}
            {currentReservations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Stay</CardTitle>
                  <CardDescription>You're currently checked in</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentReservations.map((reservation) => (
                    <div key={reservation.id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{reservation.properties.title}</h3>
                            <Badge variant="default">Currently Staying</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {reservation.properties.address}
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              Until {format(new Date(reservation.check_out_date), 'MMM dd')}
                            </div>
                          </div>
                          {reservation.check_in_instructions && (
                            <div className="mt-2 p-2 bg-white rounded border">
                              <p className="text-sm font-medium">Check-out Information:</p>
                              <p className="text-sm text-muted-foreground">
                                {reservation.check_in_instructions}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Get Help
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Reservations */}
            {upcomingReservations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Stays</CardTitle>
                  <CardDescription>Your confirmed reservations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingReservations.slice(0, 2).map((reservation) => (
                    <div key={reservation.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{reservation.properties.title}</h3>
                            <Badge variant={getStatusColor(reservation.booking_status)}>
                              {reservation.booking_status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {format(new Date(reservation.check_in_date), 'MMM dd')} - {format(new Date(reservation.check_out_date), 'MMM dd')}
                            </div>
                            <span>{reservation.guest_count} guests</span>
                            <span>${reservation.total_amount}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Notifications */}
            {notifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>Updates about your stays</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reservations" className="space-y-6">
            <ReservationsTab reservations={reservations} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <ProfileTab profile={profile} />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <SupportTab profile={profile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Reservations Tab Component
const ReservationsTab = ({ reservations }: { reservations: GuestReservation[] }) => {
  const [filter, setFilter] = useState('all');

  const filteredReservations = reservations.filter(r => {
    if (filter === 'upcoming') return new Date(r.check_in_date) > new Date();
    if (filter === 'current') {
      const checkIn = new Date(r.check_in_date);
      const checkOut = new Date(r.check_out_date);
      const now = new Date();
      return checkIn <= now && checkOut >= now;
    }
    if (filter === 'past') return new Date(r.check_out_date) < new Date();
    return true;
  });

  return (
    <>
      <div className="flex gap-2">
        {['all', 'upcoming', 'current', 'past'].map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterOption)}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredReservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{reservation.properties.title}</h3>
                    <Badge variant={getStatusColor(reservation.booking_status)}>
                      {reservation.booking_status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(reservation.check_in_date), 'MMM dd, yyyy')} - {format(new Date(reservation.check_out_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {reservation.properties.address}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{reservation.guest_count} guests</span>
                    <span className="font-medium">${reservation.total_amount}</span>
                    <Badge variant="outline">
                      Cleaning: {reservation.cleaning_status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Receipt
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

// Profile Tab Component
const ProfileTab = ({ profile }: { profile?: GuestProfile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.profile_image_url} />
              <AvatarFallback className="text-lg">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{profile?.first_name} {profile?.last_name}</h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              {profile?.phone && (
                <p className="text-sm text-muted-foreground">{profile?.phone}</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email notifications</span>
              <Badge variant={profile?.notification_settings?.email ? 'default' : 'outline'}>
                {profile?.notification_settings?.email ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Push notifications</span>
              <Badge variant={profile?.notification_settings?.push ? 'default' : 'outline'}>
                {profile?.notification_settings?.push ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">SMS notifications</span>
              <Badge variant={profile?.notification_settings?.sms ? 'default' : 'outline'}>
                {profile?.notification_settings?.sms ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Update Preferences
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
          <CardDescription>Your rewards and benefits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-blue-600">{profile?.loyalty_points || 0}</div>
            <p className="text-sm text-muted-foreground">Points Available</p>
            <p className="text-xs text-muted-foreground">
              Earn 10 points per $1 spent • Redeem for discounts and upgrades
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Saved payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No saved payment methods</p>
            <Button variant="outline" size="sm" className="mt-2">
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Support Tab Component
const SupportTab = ({ profile }: { profile?: GuestProfile }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Get Help</CardTitle>
          <CardDescription>Contact our support team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" size="lg" className="h-20 flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              <span>Live Chat</span>
            </Button>
            <Button variant="outline" size="lg" className="h-20 flex-col gap-2">
              <Phone className="h-6 w-6" />
              <span>Call Us</span>
            </Button>
            <Button variant="outline" size="lg" className="h-20 flex-col gap-2">
              <Mail className="h-6 w-6" />
              <span>Email Support</span>
            </Button>
            <Button variant="outline" size="lg" className="h-20 flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              <span>FAQ</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Request Early Check-in
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Report Property Issue
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Request Housekeeping
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Lost Key/Access Code
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Modify Reservation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'default';
    case 'cancelled': return 'destructive';
    case 'pending': return 'secondary';
    default: return 'outline';
  }
};

export default GuestPortalDashboard;