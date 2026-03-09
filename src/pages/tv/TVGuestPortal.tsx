import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Book, MapPin, MessageSquare, Settings, Wifi, Key, Clock, Loader2, Monitor } from 'lucide-react';
import TVLayout, { tvStyles } from '@/components/tv/TVLayout';
import TVHeader from '@/components/tv/TVHeader';
import TVSidebar from '@/components/tv/TVSidebar';
import TVFocusableButton from '@/components/tv/TVFocusableButton';
import TVChatInterface from '@/components/tv/TVChatInterface';
import TVPropertyInfo from '@/components/tv/TVPropertyInfo';
import TVLocalGuide from '@/components/tv/TVLocalGuide';
import TVWeatherWidget from '@/components/tv/TVWeatherWidget';
import { useTVDevice } from '@/hooks/useTVDevice';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PropertyData {
  id: string;
  name: string;
  address: string;
  organization_id?: string;
}

interface ReservationData {
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
}

const sidebarItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'house-info', label: 'House Info', icon: Book },
  { id: 'local-guide', label: 'Local Guide', icon: MapPin },
  { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const TVGuestPortal: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { displayMode, isPaired } = useTVDevice(propertyId);

  // React to display_mode changes — navigate away if mode changes
  useEffect(() => {
    if (!isPaired) return;
    if (displayMode === 'signage') {
      navigate(`/tv/${propertyId}/signage`);
    } else if (displayMode === 'welcome') {
      navigate(`/tv/${propertyId}`);
    }
  }, [displayMode, isPaired, propertyId, navigate]);

  useEffect(() => {
    if (propertyId) fetchData();
  }, [propertyId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = sidebarItems.findIndex(item => item.id === activeSection);
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        setActiveSection(sidebarItems[currentIndex - 1].id);
      } else if (e.key === 'ArrowDown' && currentIndex < sidebarItems.length - 1) {
        e.preventDefault();
        setActiveSection(sidebarItems[currentIndex + 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection]);

  const fetchData = async () => {
    if (!propertyId) return;
    setIsLoading(true);
    try {
      const { data: propertyData } = await supabase
        .from('properties')
        .select('id, title, location, organization_id')
        .eq('id', propertyId)
        .single();

      if (propertyData) {
        setProperty({
          id: propertyData.id,
          name: propertyData.title,
          address: propertyData.location || '',
          organization_id: propertyData.organization_id,
        });
      }

      // Try to get active reservation for guest name
      const now = new Date().toISOString().split('T')[0];
      const { data: res } = await supabase
        .from('property_reservations')
        .select('guest_name, check_in_date, check_out_date')
        .eq('property_id', propertyId)
        .eq('booking_status', 'confirmed')
        .lte('check_in_date', now)
        .gte('check_out_date', now)
        .order('check_in_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      setReservation(res || {
        guest_name: 'Guest',
        check_in_date: new Date().toISOString(),
        check_out_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection property={property} propertyId={propertyId} />;
      case 'house-info':
        return <TVPropertyInfo propertyId={propertyId} />;
      case 'local-guide':
        return <TVLocalGuide propertyId={propertyId} />;
      case 'chat':
        return <TVChatInterface propertyId={propertyId} organizationId={property?.organization_id} />;
      case 'settings':
        return <SettingsSection propertyId={propertyId} onSignageMode={() => navigate(`/tv/${propertyId}/signage`)} />;
      default:
        return <HomeSection property={property} propertyId={propertyId} />;
    }
  };

  if (isLoading) {
    return (
      <TVLayout className="flex items-center justify-center">
        <Loader2 className={cn(tvStyles.iconLarge, "animate-spin text-primary")} />
      </TVLayout>
    );
  }

  return (
    <TVLayout>
      <div className="h-full flex flex-col">
        <TVHeader propertyName={property?.name} guestName={reservation?.guest_name} />
        <div className="flex-1 flex gap-8 mt-6">
          <TVSidebar items={sidebarItems} activeItem={activeSection} onItemSelect={setActiveSection} className="w-72 shrink-0" />
          <main className="flex-1 overflow-auto">{renderContent()}</main>
        </div>
      </div>
    </TVLayout>
  );
};

const HomeSection: React.FC<{ property: PropertyData | null; propertyId?: string }> = ({ property, propertyId }) => (
  <div className="space-y-8">
    <h2 className={tvStyles.heading2}>Welcome to {property?.name}</h2>
    <TVWeatherWidget propertyId={propertyId} variant="compact" />
    <div className="grid grid-cols-2 gap-6">
      <QuickInfoCard icon={Wifi} title="WiFi" value="See House Info" />
      <QuickInfoCard icon={Key} title="Door Code" value="See House Info" />
      <QuickInfoCard icon={Clock} title="Check-in" value="3:00 PM" />
      <QuickInfoCard icon={Clock} title="Check-out" value="11:00 AM" />
    </div>
  </div>
);

const QuickInfoCard: React.FC<{ icon: React.ElementType; title: string; value: string }> = ({ icon: Icon, title, value }) => (
  <div className="bg-card border border-border rounded-2xl p-6 focus:ring-4 focus:ring-primary/50 focus:outline-none" tabIndex={0}>
    <div className="flex items-center gap-4 mb-4">
      <Icon className="h-8 w-8 text-primary" />
      <span className={cn(tvStyles.bodySmall, "text-muted-foreground")}>{title}</span>
    </div>
    <p className={cn(tvStyles.heading3, "font-semibold")}>{value}</p>
  </div>
);

const SettingsSection: React.FC<{ propertyId?: string; onSignageMode: () => void }> = ({ onSignageMode }) => (
  <div className="space-y-8">
    <h2 className={tvStyles.heading2}>Settings</h2>
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className={tvStyles.heading3}>Signage Mode</h3>
          <p className={tvStyles.caption}>Switch to digital signage display</p>
        </div>
        <TVFocusableButton variant="outline" onClick={onSignageMode}>
          <Monitor className="h-6 w-6 mr-2" />
          Signage Mode
        </TVFocusableButton>
      </div>
    </div>
  </div>
);

export default TVGuestPortal;
