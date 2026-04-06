import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTenantProperties } from '@/hooks/useTenantProperties';
import { usePropertyBookingSettings, getCancellationPolicyDetails } from '@/hooks/usePropertyBookingSettings';
import { Calendar, Search, Home, Star } from 'lucide-react';
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
  
  // Get property-specific booking settings
  const { data: bookingSettings } = usePropertyBookingSettings(propertyId);
  const cancellationPolicy = getCancellationPolicyDetails(bookingSettings?.cancellationPolicy || 'flexible');

  const contactPhone = settings?.contactPhone || '';
  const contactEmail = settings?.contactEmail || '';

  if (loading) {
    return <LoadingState variant="page" message="Loading property details..." />;
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
            <p className="text-muted-foreground">
              The property you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Property Header */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="aspect-video lg:aspect-square relative">
                <ThumbnailImage
                  src={property.cover_image_url || property.image_url || (property.images && property.images.length > 0 ? property.images[0] : '') || ''}
                  alt={property.title}
                  className="w-full h-full"
                />
              </div>
              
              <div className="p-6 flex flex-col justify-center">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-2">
                    <Star className="h-3 w-3 mr-1" />
                    Featured Property
                  </Badge>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <p className="text-muted-foreground text-lg">{property.location}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{property.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">Bedrooms</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{property.bathrooms}</div>
                    <div className="text-sm text-muted-foreground">Bathrooms</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{property.max_guests}</div>
                    <div className="text-sm text-muted-foreground">Guests</div>
                  </div>
                </div>

                <p className="text-muted-foreground line-clamp-3">
                  {property.description}
                </p>

                {property.price_per_night && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        ${property.price_per_night}
                      </span>
                      <span className="text-muted-foreground">per night</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Booking Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking & Reservations
                </CardTitle>
                <CardDescription>
                  Book your stay or manage existing reservations
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="book" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Book Now
                    </TabsTrigger>
                    <TabsTrigger value="availability" className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Availability
                    </TabsTrigger>
                    <TabsTrigger value="lookup" className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Find Reservation
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="book" className="mt-6">
                    <GuestBookingWidget property={property} />
                  </TabsContent>

                  <TabsContent value="availability" className="mt-6">
                    <AvailabilityDisplay 
                      property={property} 
                      showPricing={true}
                      daysToShow={60}
                    />
                  </TabsContent>

                  <TabsContent value="lookup" className="mt-6">
                    <div className="flex justify-center">
                      <GuestReservationPortal />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Property Info Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium">{bookingSettings?.checkInTime || '3:00 PM'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium">{bookingSettings?.checkOutTime || '11:00 AM'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Minimum Stay</span>
                  <span className="font-medium">{bookingSettings?.minStay || 1} night{(bookingSettings?.minStay || 1) > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cancellation</span>
                  <span className="font-medium">{cancellationPolicy.name}</span>
                </div>
                <p className="text-xs text-muted-foreground border-t pt-2">
                  {cancellationPolicy.description}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {property.amenities.split(',').map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>{amenity.trim()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            {(contactPhone || contactEmail) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    Have questions about this property or need assistance with your booking?
                  </p>
                  <div className="space-y-2">
                    {contactPhone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{contactPhone}</span>
                      </div>
                    )}
                    {contactEmail && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{contactEmail}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;