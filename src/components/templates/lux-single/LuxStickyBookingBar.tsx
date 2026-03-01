import React, { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import GuestBookingWidget from '@/components/booking/GuestBookingWidget';
import { useIsMobile } from '@/hooks/use-mobile';

interface LuxStickyBookingBarProps {
  property: Property;
}

const LuxStickyBookingBar: React.FC<LuxStickyBookingBarProps> = ({ property }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const isMobile = useIsMobile();

  const pricePerNight = property.price_per_night || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsPastHero(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isPastHero) return null;

  // Mobile: fixed bottom bar
  if (isMobile) {
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/90 border-t border-border/30 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xl font-serif font-semibold text-foreground">
                ${pricePerNight}
              </span>
              <span className="text-muted-foreground text-sm ml-1">/ night</span>
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button className="px-8 font-medium tracking-wide uppercase text-sm">
                  Reserve
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle className="font-serif text-xl">Book Your Stay</SheetTitle>
                </SheetHeader>
                <GuestBookingWidget
                  property={property}
                  onBookingComplete={() => setIsOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="h-20 lg:hidden" />
      </>
    );
  }

  // Desktop: floating top bar
  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/20 shadow-sm animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h2 className="font-serif text-lg text-foreground truncate max-w-xs">
            {property.title}
          </h2>
          <div className="hidden md:flex items-center gap-1 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" />
            <span>Select dates for total</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-xl font-serif font-semibold text-foreground">
              ${pricePerNight}
            </span>
            <span className="text-muted-foreground text-sm ml-1">/ night</span>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="px-8 font-medium tracking-wide uppercase text-sm">
                Reserve
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Book Your Stay</DialogTitle>
              </DialogHeader>
              <GuestBookingWidget
                property={property}
                onBookingComplete={() => setIsOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default LuxStickyBookingBar;
