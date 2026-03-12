import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTenantProperties } from '@/hooks/useTenantProperties';
import { usePropertyBookingSettings, getCancellationPolicyDetails } from '@/hooks/usePropertyBookingSettings';
import { Calendar, Search, Home, Star, Shield, Clock, MapPin } from 'lucide-react';
import GuestBookingWidget from '@/components/booking/GuestBookingWidget';
import AvailabilityDisplay from '@/components/booking/AvailabilityDisplay';
import GuestReservationPortal from '@/components/booking/GuestReservationPortal';
import ThumbnailImage from '@/components/ui/thumbnail-image';
import LoadingState from '@/components/ui/loading-state';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const BookingPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [activeTab, setActiveTab] = useState('book');
  const { properties, loading } = useTenantProperties();
  const { settings } = useTenantSettings();
  const property = properties?.find(p => p.id === propertyId);
  
  const { data: bookingSettings } = usePropertyBookingSettings(propertyId);
  const cancellationPolicy = getCancellationPolicyDetails(bookingSettings?.cancellationPolicy || 'flexible');

  const contactPhone = settings?.contactPhone || '';
  const contactEmail = settings?.contactEmail || '';

  if (loading) {
    return <LoadingState variant="page" message="Loading property details..." />;
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center space-y-4 p-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Home className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Property Not Found</h2>
          <p className="text-muted-foreground text-sm">
            The property you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Property Header */}
      <div className="border-b border-border/30 bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <ThumbnailImage
                src={property.image_url}
                alt={property.title}
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold tracking-tight truncate">{property.title}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                {property.location}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{property.bedrooms} bed</span>
                <span className="text-border">·</span>
                <span>{property.bathrooms} bath</span>
                <span className="text-border">·</span>
                <span>{property.max_guests} guests</span>
                {property.price_per_night && (
                  <>
                    <span className="text-border">·</span>
                    <span className="font-medium text-foreground">${property.price_per_night}/night</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/30 border border-border/30 rounded-xl p-1 mb-8 w-auto inline-flex">
            <TabsTrigger value="book" className="rounded-lg text-sm px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Book Now
            </TabsTrigger>
            <TabsTrigger value="availability" className="rounded-lg text-sm px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Availability
            </TabsTrigger>
            <TabsTrigger value="lookup" className="rounded-lg text-sm px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Find Reservation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book">
            <GuestBookingWidget property={property} />
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityDisplay 
              property={property} 
              showPricing={true}
              daysToShow={60}
            />
          </TabsContent>

          <TabsContent value="lookup">
            <div className="flex justify-center">
              <GuestReservationPortal />
            </div>
          </TabsContent>
        </Tabs>

        {/* Trust Footer */}
        <div className="mt-16 pt-8 border-t border-border/20">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" strokeWidth={1.5} />
              Secure checkout
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
              {cancellationPolicy.name} cancellation
            </span>
            {(contactPhone || contactEmail) && (
              <span>
                Need help? {contactEmail && <a href={`mailto:${contactEmail}`} className="underline underline-offset-2 hover:text-foreground transition-colors">{contactEmail}</a>}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
