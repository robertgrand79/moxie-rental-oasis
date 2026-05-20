import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bed, CalendarCheck2, CalendarX2, Tag } from 'lucide-react';
import { generateAddressSlug } from '@/utils/addressSlug';

/**
 * Structured cards returned by the public-ai-chat edge function and rendered
 * as rich UI in the chat widget instead of plain markdown text.
 */
export type ChatCard =
  | {
      type: 'availability';
      propertyId: string;
      propertyTitle: string;
      location: string;
      available: boolean;
      checkInDate: string;
      checkOutDate: string;
    }
  | {
      type: 'pricing';
      propertyId: string;
      propertyTitle: string;
      location: string;
      checkInDate: string;
      checkOutDate: string;
      nights: number;
      subtotal: number;
      cleaningFee: number;
      serviceFee: number;
      total: number;
    }
  | {
      type: 'booking_link';
      propertyId: string;
      propertyTitle: string;
      location: string;
      checkInDate?: string;
      checkOutDate?: string;
    };

const money = (n: number) => `$${Math.round(n || 0).toLocaleString('en-US')}`;

const bookingPath = (location: string, checkIn?: string, checkOut?: string) => {
  const params = new URLSearchParams();
  if (checkIn) params.set('checkin', checkIn);
  if (checkOut) params.set('checkout', checkOut);
  const qs = params.toString();
  return `/property/${generateAddressSlug(location)}${qs ? `?${qs}` : ''}`;
};

interface ChatCardsProps {
  cards: ChatCard[];
  /** Tenant brand colour, applied to the card action buttons. */
  accentColor?: string;
}

const ChatCards: React.FC<ChatCardsProps> = ({ cards, accentColor }) => {
  if (!cards || cards.length === 0) return null;

  const buttonStyle = accentColor ? { backgroundColor: accentColor } : undefined;

  return (
    <div className="space-y-2">
      {cards.map((card, i) => {
        if (card.type === 'availability') {
          return (
            <div key={i} className="rounded-xl border bg-background p-3 text-sm shadow-sm">
              <div className="flex items-center gap-2">
                {card.available ? (
                  <CalendarCheck2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                ) : (
                  <CalendarX2 className="h-4 w-4 flex-shrink-0 text-destructive" />
                )}
                <span className="font-semibold">{card.propertyTitle}</span>
              </div>
              <p className="mt-1 text-muted-foreground">
                {card.available ? 'Available' : 'Not available'} · {card.checkInDate} → {card.checkOutDate}
              </p>
              {card.available && (
                <Link
                  to={bookingPath(card.location, card.checkInDate, card.checkOutDate)}
                  className="mt-2 block"
                >
                  <Button size="sm" className="w-full" style={buttonStyle}>
                    Book these dates
                  </Button>
                </Link>
              )}
            </div>
          );
        }

        if (card.type === 'pricing') {
          return (
            <div key={i} className="rounded-xl border bg-background p-3 text-sm shadow-sm">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="font-semibold">{card.propertyTitle}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {card.checkInDate} → {card.checkOutDate}
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {card.nights} {card.nights === 1 ? 'night' : 'nights'}
                  </span>
                  <span>{money(card.subtotal)}</span>
                </div>
                {card.cleaningFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cleaning fee</span>
                    <span>{money(card.cleaningFee)}</span>
                  </div>
                )}
                {card.serviceFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>{money(card.serviceFee)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 font-semibold">
                  <span>Total</span>
                  <span>{money(card.total)}</span>
                </div>
              </div>
              <Link
                to={bookingPath(card.location, card.checkInDate, card.checkOutDate)}
                className="mt-3 block"
              >
                <Button size="sm" className="w-full" style={buttonStyle}>
                  Book Now
                </Button>
              </Link>
            </div>
          );
        }

        return (
          <div key={i} className="rounded-xl border bg-background p-3 text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="font-semibold">{card.propertyTitle}</span>
            </div>
            <Link
              to={bookingPath(card.location, card.checkInDate, card.checkOutDate)}
              className="mt-2 block"
            >
              <Button size="sm" className="w-full" style={buttonStyle}>
                Book Now
              </Button>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default ChatCards;
