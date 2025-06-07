
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PropertyData } from '@/types/propertyData';

interface BookingCardProps {
  property: PropertyData;
}

const BookingCard = ({ property }: BookingCardProps) => {
  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-8">
        <CardHeader>
          <CardTitle className="text-2xl">
            ${property.pricePerNight}
            <span className="text-lg font-normal text-gray-600">/night</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full mb-4 bg-gradient-to-r from-gradient-from to-gradient-accent-from hover:from-gradient-from/90 hover:to-gradient-accent-from/90"
            onClick={() => {
              if (property.hospitableBookingUrl) {
                window.open(property.hospitableBookingUrl, '_blank');
              }
            }}
          >
            Book Now
          </Button>
          <p className="text-sm text-gray-600 text-center">
            You won't be charged yet
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCard;
