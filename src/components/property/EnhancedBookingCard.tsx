import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Property } from '@/types/property';
import { Calendar, Users, Wifi, Car, Shield, Clock, Star, MapPin } from 'lucide-react';
import GuestBookingWidget from '@/components/booking/GuestBookingWidget';
import AvailabilityDisplay from '@/components/booking/AvailabilityDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EnhancedBookingCardProps {
  property: Property;
  variant?: 'card' | 'floating' | 'inline';
  showAvailability?: boolean;
}

const EnhancedBookingCard = ({ 
  property, 
  variant = 'card',
  showAvailability = false 
}: EnhancedBookingCardProps) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('book');

  const hasBookingUrl = true; // Always available with internal system

  const handleBookingComplete = (reservationId: string) => {
    setIsBookingModalOpen(false);
    // Could show a success message or redirect
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'floating':
        return 'fixed top-20 right-4 w-80 z-50 shadow-2xl';
      case 'inline':
        return 'w-full';
      default:
        return 'w-full max-w-sm';
    }
  };

  const renderBookingButton = () => {
    return (
      <Button 
        onClick={() => setIsBookingModalOpen(true)}
        className="w-full h-12 text-lg font-semibold"
      >
        Check Availability & Book
      </Button>
    );
  };

  const renderPropertyDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{property.location}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>Up to {property.max_guests} guests</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{property.bedrooms} bed, {property.bathrooms} bath</span>
        </div>
      </div>

      {property.price_per_night && (
        <div className="text-center py-3 border-y">
          <div className="text-2xl font-bold">${property.price_per_night}</div>
          <div className="text-sm text-muted-foreground">per night</div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-medium text-sm">What's Included</h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            <Wifi className="h-3 w-3 mr-1" />
            Free WiFi
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Car className="h-3 w-3 mr-1" />
            Free Parking
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Instant Confirmation
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            24/7 Support
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Card className={`${getVariantStyles()}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book Your Stay
          </CardTitle>
          <CardDescription>
            Reserve {property.title}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {renderPropertyDetails()}
          {renderBookingButton()}
        </CardContent>
      </Card>

      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book {property.title}</DialogTitle>
            <DialogDescription>
              Complete your reservation for this beautiful property
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="book">Book Now</TabsTrigger>
              <TabsTrigger value="availability">View Availability</TabsTrigger>
            </TabsList>
            
            <TabsContent value="book" className="mt-6">
              <GuestBookingWidget 
                property={property} 
                onBookingComplete={handleBookingComplete}
              />
            </TabsContent>
            
            <TabsContent value="availability" className="mt-6">
              <AvailabilityDisplay 
                property={property} 
                showPricing={true}
                daysToShow={30}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedBookingCard;