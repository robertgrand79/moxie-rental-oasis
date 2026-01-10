import React, { useState } from 'react';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Calendar, Users } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import GuestBookingWidget from '@/components/booking/GuestBookingWidget';

interface StickyBookingBarProps {
  property: Property;
}

const StickyBookingBar: React.FC<StickyBookingBarProps> = ({ property }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const pricePerNight = property.price_per_night || 0;

  return (
    <>
      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 lg:hidden">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">
                ${pricePerNight}
              </span>
              <span className="text-muted-foreground text-sm">/ night</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Select dates for total</span>
            </div>
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="px-8 font-semibold">
                Check Availability
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Book Your Stay</SheetTitle>
              </SheetHeader>
              <GuestBookingWidget 
                property={property} 
                onBookingComplete={() => setIsOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Spacer to prevent content from being hidden behind sticky bar */}
      <div className="h-20 lg:hidden" />
    </>
  );
};

export default StickyBookingBar;
