import React from 'react';
import { Property } from '@/types/property';
import { Calendar, Users, ChevronUp, Shield } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CustomFeeDetail {
  id: string;
  name: string;
  amount: number;
  description?: string;
}

interface BookingSummaryCardProps {
  property: Property;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
  charges?: {
    accommodationSubtotal: number;
    cleaningFee: number;
    serviceFee: number;
    customFees?: CustomFeeDetail[];
    totalCustomFees?: number;
    subtotal: number;
    totalTax: number;
    grandTotal: number;
  };
}

export const BookingSummaryCard = ({
  property,
  checkInDate,
  checkOutDate,
  guestCount,
  charges
}: BookingSummaryCardProps) => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const nights = checkInDate && checkOutDate 
    ? differenceInDays(parseISO(checkOutDate), parseISO(checkInDate))
    : 0;

  const coverImage = property.cover_image_url || property.featured_photos?.[0] || property.images?.[0] || '/placeholder.svg';

  // Mobile: Collapsible bottom sheet style
  if (isMobile) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.08)] border-t border-border/30 bg-background">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <img src={coverImage} alt={property.title} className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm line-clamp-1">{property.title}</p>
                {charges ? (
                  <p className="text-lg font-semibold tracking-tight">${charges.grandTotal.toFixed(2)}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">{nights > 0 ? `${nights} nights` : 'Select dates'}</p>
                )}
              </div>
            </div>
            <ChevronUp className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <Separator className="mb-4 bg-border/30" />
            <MobileSummaryContent 
              property={property}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              guestCount={guestCount}
              nights={nights}
              charges={charges}
            />
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  // Desktop: Premium sticky receipt card
  return (
    <div className="sticky top-24">
      <div className="rounded-2xl bg-background border border-border/30 shadow-lg shadow-black/5 overflow-hidden">
        {/* Property Image */}
        <div className="aspect-[16/10] overflow-hidden">
          <img 
            src={coverImage} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6 space-y-5">
          {/* Property Name */}
          <div>
            <h3 className="font-semibold text-base line-clamp-2">{property.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{property.location}</p>
          </div>

          {/* Stay Details */}
          {(checkInDate || checkOutDate || guestCount) && (
            <>
              <Separator className="bg-border/30" />
              <div className="space-y-3">
                {checkInDate && checkOutDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" strokeWidth={1.5} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {format(parseISO(checkInDate), 'MMM dd')} — {format(parseISO(checkOutDate), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                    </div>
                  </div>
                )}
                
                {guestCount && (
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <p className="text-sm">{guestCount} {guestCount === 1 ? 'guest' : 'guests'}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Price Breakdown */}
          {charges && (
            <>
              <Separator className="bg-border/30" />
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Price details</p>
                
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      ${(charges.accommodationSubtotal / nights).toFixed(2)} × {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                    <span>${charges.accommodationSubtotal.toFixed(2)}</span>
                  </div>
                  
                  {charges.cleaningFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cleaning fee</span>
                      <span>${charges.cleaningFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {charges.serviceFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service fee</span>
                      <span>${charges.serviceFee.toFixed(2)}</span>
                    </div>
                  )}

                  {charges.customFees && charges.customFees.length > 0 && charges.customFees.map((fee) => (
                    <div key={fee.id} className="flex justify-between">
                      <span className="text-muted-foreground">{fee.name}</span>
                      <span>${fee.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  
                  {charges.totalTax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes</span>
                      <span>${charges.totalTax.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <Separator className="bg-border/30" />
                
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-3xl font-semibold tracking-tight">${charges.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}

          {/* Trust */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-2">
            <Shield className="h-3 w-3" strokeWidth={1.5} />
            <span>Secure checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile summary content
const MobileSummaryContent = ({
  property,
  checkInDate,
  checkOutDate,
  guestCount,
  nights,
  charges
}: {
  property: Property;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
  nights: number;
  charges?: BookingSummaryCardProps['charges'];
}) => (
  <div className="space-y-3">
    {(checkInDate || checkOutDate || guestCount) && (
      <div className="space-y-2">
        {checkInDate && checkOutDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <span>{format(parseISO(checkInDate), 'MMM dd')} — {format(parseISO(checkOutDate), 'MMM dd, yyyy')}</span>
            <span className="text-muted-foreground">({nights} nights)</span>
          </div>
        )}
        {guestCount && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <span>{guestCount} {guestCount === 1 ? 'guest' : 'guests'}</span>
          </div>
        )}
      </div>
    )}

    {charges && (
      <div className="space-y-2 text-sm">
        <Separator className="bg-border/30" />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Accommodation ({nights} nights)</span>
          <span>${charges.accommodationSubtotal.toFixed(2)}</span>
        </div>
        {charges.cleaningFee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cleaning fee</span>
            <span>${charges.cleaningFee.toFixed(2)}</span>
          </div>
        )}
        {charges.serviceFee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service fee</span>
            <span>${charges.serviceFee.toFixed(2)}</span>
          </div>
        )}
        {charges.totalTax > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxes</span>
            <span>${charges.totalTax.toFixed(2)}</span>
          </div>
        )}
      </div>
    )}
  </div>
);
