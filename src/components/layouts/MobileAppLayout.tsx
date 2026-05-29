import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  Home,
  BookOpen,
  Calendar,
  MessageSquare,
  Ticket,
  Wrench,
  User,
  LogOut,
  Bell,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const MobileAppLayout: React.FC = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch guest profile
  const { data: profile } = useQuery({
    queryKey: ['mobile-guest-profile', user?.id],
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

  // Fetch guest reservations to find active propertyId for guidebook link
  const { data: reservations = [] } = useQuery({
    queryKey: ['mobile-guest-reservations', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];
      const { data, error } = await supabase
        .from('property_reservations')
        .select('*, properties:property_id(title)')
        .eq('guest_email', profile.email)
        .order('check_in_date', { ascending: false });

      if (error) {
        console.error('Error fetching reservations:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.email,
  });

  // Find active property for quick guidebook access
  const activeReservation = reservations.find((r: any) => {
    const checkIn = new Date(r.check_in_date);
    const checkOut = new Date(r.check_out_date);
    const now = new Date();
    return checkIn <= now && checkOut >= now && r.booking_status === 'confirmed';
  });

  const activePropertyId = activeReservation?.property_id;

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Entering Moxie Oasis...</p>
        </div>
      </div>
    );
  }

  // Allow public access to contractor portal routes if token is specified,
  // or allow loading guidebook if it has a property id, but require auth for dashboard
  const isContractorPath = location.pathname.startsWith('/mobile/contractor');
  const isGuidebookPath = location.pathname.startsWith('/mobile/guidebook');
  
  if (!user && !isContractorPath && !isGuidebookPath && location.pathname !== '/mobile/chat') {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const navItems = [
    { label: 'Dashboard', path: '/mobile', icon: <Home className="h-5 w-5" />, requiresAuth: true },
    { 
      label: 'Digital Guidebook', 
      path: activePropertyId ? `/mobile/guidebook/${activePropertyId}` : '/mobile/guidebook', 
      icon: <BookOpen className="h-5 w-5" />, 
      requiresAuth: false 
    },
    { label: 'My Stays', path: '/mobile/stays', icon: <Calendar className="h-5 w-5" />, requiresAuth: true },
    { label: 'Messages', path: '/mobile/chat', icon: <MessageSquare className="h-5 w-5" />, requiresAuth: true },
    { label: 'Service Requests', path: '/mobile/requests', icon: <Ticket className="h-5 w-5" />, requiresAuth: true },
    { label: 'Contractor Portal', path: '/mobile/contractor', icon: <Wrench className="h-5 w-5" />, requiresAuth: false },
    { label: 'Profile & Settings', path: '/mobile/profile', icon: <User className="h-5 w-5" />, requiresAuth: true },
  ];

  const handleNav = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-zinc-950 pb-safe">
      {/* Top Glassmorphic Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/60 safe-area-top">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* Slide-out Menu Trigger */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-slate-100 dark:hover:bg-zinc-800">
                  <Menu className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] max-w-[320px] p-0 flex flex-col bg-white dark:bg-zinc-900 border-r shadow-2xl">
                <SheetHeader className="p-6 border-b text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent font-black text-2xl tracking-wider">
                      STAYMOXIE
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-zinc-800 dark:text-zinc-300">
                      APP
                    </Badge>
                  </SheetTitle>
                </SheetHeader>

                {/* Profile Header in Navigation Menu */}
                {user && (
                  <div className="p-4 mx-4 my-2 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-zinc-800/40 dark:to-zinc-800/20 border border-slate-100 dark:border-zinc-800">
                    <Avatar className="h-11 w-11 border-2 border-white dark:border-zinc-800 shadow-sm">
                      <AvatarImage src={profile?.profile_image_url} />
                      <AvatarFallback className="bg-indigo-600 text-white font-semibold">
                        {profile?.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-sm truncate text-slate-800 dark:text-slate-200">
                        {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Moxie Guest'}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" />
                        {profile?.loyalty_points || 0} points
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path || 
                                     (item.path.startsWith('/mobile/guidebook') && location.pathname.startsWith('/mobile/guidebook'));
                    if (item.requiresAuth && !user) return null;

                    return (
                      <button
                        key={item.label}
                        onClick={() => handleNav(item.path)}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold border-l-4 border-indigo-600'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {React.cloneElement(item.icon, {
                            className: `h-5 w-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-zinc-400'}`
                          })}
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-30" />
                      </button>
                    );
                  })}
                </nav>

                {/* Navigation Footer */}
                {user && (
                  <div className="p-4 border-t mt-auto">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 border-slate-200 dark:border-zinc-800 text-red-600 hover:text-red-700 hover:bg-red-50/50 dark:hover:bg-red-950/20"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            {/* Desktop Brand Logo */}
            <span className="hidden md:inline bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent font-black text-2xl tracking-wider">
              STAYMOXIE
            </span>
            <span className="md:hidden font-extrabold text-lg text-slate-800 dark:text-slate-100">
              {location.pathname === '/mobile' && 'Oasis Dashboard'}
              {location.pathname.startsWith('/mobile/guidebook') && 'Digital Guidebook'}
              {location.pathname === '/mobile/stays' && 'My Stays'}
              {location.pathname === '/mobile/chat' && 'Inbox Messages'}
              {location.pathname === '/mobile/requests' && 'Requests & Support'}
              {location.pathname === '/mobile/contractor' && 'Contractor Hub'}
              {location.pathname === '/mobile/profile' && 'My Profile'}
            </span>
          </div>

          {/* Quick Actions (Notifications & Profile Shortcut) */}
          <div className="flex items-center gap-2">
            {user && (
              <>
                <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-zinc-800">
                  <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  {reservations.length > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-600" />
                  )}
                </Button>
                
                <Avatar 
                  onClick={() => navigate('/mobile/profile')}
                  className="h-8 w-8 cursor-pointer border dark:border-zinc-800 shadow-sm active:scale-95 transition-transform"
                >
                  <AvatarImage src={profile?.profile_image_url} />
                  <AvatarFallback className="bg-indigo-600 text-white text-xs font-semibold">
                    {profile?.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-grow flex flex-col relative">
        <Outlet />
      </main>
    </div>
  );
};

export default MobileAppLayout;
