import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Home, Book, MapPin, MessageSquare, Settings, Wifi, Key, Clock, Loader2 } from 'lucide-react';
import TVLayout, { tvStyles } from '@/components/tv/TVLayout';
import TVHeader from '@/components/tv/TVHeader';
import TVSidebar from '@/components/tv/TVSidebar';
import TVFocusableButton from '@/components/tv/TVFocusableButton';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PropertyData {
  id: string;
  name: string;
  address: string;
  wifi_network?: string;
  wifi_password?: string;
  check_in_time?: string;
  check_out_time?: string;
  door_code?: string;
  house_rules?: string[];
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

/**
 * TVGuestPortal - Main guest portal for paired TV
 * 
 * Features:
 * - Property information display
 * - WiFi credentials
 * - Door codes
 * - House rules
 * - Local recommendations
 * - AI chat integration
 */
const TVGuestPortal: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [activeSection, setActiveSection] = useState('home');
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (propertyId) {
      fetchData();
    }
  }, [propertyId]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = sidebarItems.findIndex(item => item.id === activeSection);
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            setActiveSection(sidebarItems[currentIndex - 1].id);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < sidebarItems.length - 1) {
            setActiveSection(sidebarItems[currentIndex + 1].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection]);

  const fetchData = async () => {
    if (!propertyId) return;
    setIsLoading(true);

    try {
      // Fetch property
      const { data: propertyData } = await supabase
        .from('properties')
        .select('id, title, location')
        .eq('id', propertyId)
        .single();

      if (propertyData) {
        setProperty({
          id: propertyData.id,
          name: propertyData.title,
          address: propertyData.location || '',
          wifi_network: 'See house manual',
          wifi_password: 'See house manual',
          check_in_time: '3:00 PM',
          check_out_time: '11:00 AM',
          door_code: 'See check-in instructions',
          house_rules: ['No smoking', 'No parties', 'Quiet hours 10PM-8AM']
        });
      }

      // Mock reservation data for now
      setReservation({
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
        return <HomeSection property={property} reservation={reservation} />;
      case 'house-info':
        return <HouseInfoSection property={property} />;
      case 'local-guide':
        return <LocalGuideSection />;
      case 'chat':
        return <ChatSection propertyId={propertyId} />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <HomeSection property={property} reservation={reservation} />;
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
        <TVHeader 
          propertyName={property?.name}
          guestName={reservation?.guest_name}
        />

        <div className="flex-1 flex gap-8 mt-6">
          {/* Sidebar */}
          <TVSidebar
            items={sidebarItems}
            activeItem={activeSection}
            onItemSelect={setActiveSection}
            className="w-72 shrink-0"
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </TVLayout>
  );
};

// Home Section
const HomeSection: React.FC<{ property: PropertyData | null; reservation: ReservationData | null }> = ({ property, reservation }) => (
  <div className="space-y-8">
    <h2 className={tvStyles.heading2}>Welcome to {property?.name}</h2>
    
    <div className="grid grid-cols-2 gap-6">
      {/* Quick Info Cards */}
      <QuickInfoCard 
        icon={Wifi}
        title="WiFi"
        value={property?.wifi_network || 'Not set'}
        subValue={property?.wifi_password ? `Password: ${property.wifi_password}` : undefined}
      />
      <QuickInfoCard 
        icon={Key}
        title="Door Code"
        value={property?.door_code || 'See instructions'}
      />
      <QuickInfoCard 
        icon={Clock}
        title="Check-in"
        value={property?.check_in_time || '3:00 PM'}
      />
      <QuickInfoCard 
        icon={Clock}
        title="Check-out"
        value={property?.check_out_time || '11:00 AM'}
      />
    </div>
  </div>
);

// Quick Info Card Component
const QuickInfoCard: React.FC<{ 
  icon: React.ElementType; 
  title: string; 
  value: string; 
  subValue?: string;
}> = ({ icon: Icon, title, value, subValue }) => (
  <div className={cn(
    "bg-card border border-border rounded-2xl p-6",
    "focus:ring-4 focus:ring-primary/50 focus:outline-none",
    "transition-all duration-200"
  )} tabIndex={0}>
    <div className="flex items-center gap-4 mb-4">
      <Icon className="h-8 w-8 text-primary" />
      <span className={cn(tvStyles.bodySmall, "text-muted-foreground")}>{title}</span>
    </div>
    <p className={cn(tvStyles.heading3, "font-semibold")}>{value}</p>
    {subValue && (
      <p className={cn(tvStyles.caption, "mt-1")}>{subValue}</p>
    )}
  </div>
);

// House Info Section
const HouseInfoSection: React.FC<{ property: PropertyData | null }> = ({ property }) => (
  <div className="space-y-8">
    <h2 className={tvStyles.heading2}>House Information</h2>
    
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className={cn(tvStyles.heading3, "mb-4")}>House Rules</h3>
        <ul className="space-y-3">
          {(property?.house_rules || ['No rules set']).map((rule, index) => (
            <li key={index} className={cn(tvStyles.body, "flex items-center gap-3")}>
              <span className="w-2 h-2 bg-primary rounded-full" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

// Local Guide Section
const LocalGuideSection: React.FC = () => (
  <div className="space-y-8">
    <h2 className={tvStyles.heading2}>Local Guide</h2>
    <p className={tvStyles.body}>Discover nearby restaurants, activities, and attractions.</p>
    {/* Placeholder for local recommendations */}
    <div className="grid grid-cols-2 gap-6">
      {['Restaurants', 'Coffee Shops', 'Attractions', 'Outdoor Activities'].map((category) => (
        <div 
          key={category}
          className="bg-card border border-border rounded-2xl p-6 focus:ring-4 focus:ring-primary/50 focus:outline-none"
          tabIndex={0}
        >
          <MapPin className="h-8 w-8 text-primary mb-4" />
          <h3 className={tvStyles.heading3}>{category}</h3>
          <p className={tvStyles.caption}>Coming soon</p>
        </div>
      ))}
    </div>
  </div>
);

// Chat Section
const ChatSection: React.FC<{ propertyId?: string }> = ({ propertyId }) => (
  <div className="space-y-8">
    <h2 className={tvStyles.heading2}>AI Assistant</h2>
    <p className={tvStyles.body}>Have questions? Ask our AI assistant for help.</p>
    
    <div className="bg-card border border-border rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <MessageSquare className={cn(tvStyles.iconLarge, "mx-auto text-primary mb-4")} />
        <p className={tvStyles.heading3}>Chat Coming Soon</p>
        <p className={tvStyles.caption}>Voice and text chat will be available here</p>
      </div>
    </div>
  </div>
);

// Settings Section
const SettingsSection: React.FC = () => (
  <div className="space-y-8">
    <h2 className={tvStyles.heading2}>Settings</h2>
    
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className={tvStyles.heading3}>Display Mode</h3>
          <p className={tvStyles.caption}>Switch between guest portal and signage</p>
        </div>
        <TVFocusableButton variant="outline">
          Guest Portal
        </TVFocusableButton>
      </div>
    </div>
  </div>
);

export default TVGuestPortal;
