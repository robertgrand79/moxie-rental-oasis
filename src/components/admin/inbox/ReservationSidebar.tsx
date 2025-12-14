import React from 'react';
import { InboxThread, ThreadReservation } from '@/hooks/useGuestInbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Home, 
  FileText,
  StickyNote
} from 'lucide-react';
import { format } from 'date-fns';

interface ReservationSidebarProps {
  thread: InboxThread;
  reservations: ThreadReservation[];
  loading: boolean;
}

const ReservationSidebar: React.FC<ReservationSidebarProps> = ({
  thread,
  reservations,
  loading,
}) => {
  const activeReservation = reservations.find(r => 
    r.booking_status === 'confirmed' || r.booking_status === 'pending'
  ) || reservations[0];

  if (loading) {
    return (
      <div className="w-72 border-r bg-muted/10 p-4 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <ScrollArea className="w-72 border-r bg-muted/10">
      <div className="p-4 space-y-4">
        {/* Active/Primary Reservation */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Reservation
          </h4>
          
          {activeReservation ? (
            <div className="bg-background rounded-lg border p-3 space-y-3">
              {/* Property */}
              <div className="flex items-start gap-2">
                <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">
                    {activeReservation.property?.title || 'Unknown Property'}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <span>{format(new Date(activeReservation.check_in_date), 'MMM d')}</span>
                  <span className="text-muted-foreground"> → </span>
                  <span>{format(new Date(activeReservation.check_out_date), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {/* Guest info */}
              <div className="text-sm text-muted-foreground">
                <p>{activeReservation.guest_name}</p>
              </div>

              {/* Status */}
              <div className="pt-1">
                <Badge 
                  variant={activeReservation.booking_status === 'confirmed' ? 'default' : 'secondary'}
                >
                  {activeReservation.booking_status}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="bg-background rounded-lg border p-4 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No reservations found</p>
            </div>
          )}
        </div>

        {/* All Reservations (if more than one) */}
        {reservations.length > 1 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                All Reservations ({reservations.length})
              </h4>
              <div className="space-y-2">
                {reservations.map((res) => (
                  <div 
                    key={res.id} 
                    className={`bg-background rounded-lg border p-2 text-sm ${
                      res.id === activeReservation?.id ? 'ring-1 ring-primary' : ''
                    }`}
                  >
                    <p className="font-medium truncate">
                      {res.property?.title || 'Unknown Property'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(res.check_in_date), 'MMM d')} - {format(new Date(res.check_out_date), 'MMM d')}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {res.booking_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Notes section placeholder */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Notes
          </h4>
          <div className="bg-background rounded-lg border p-3 text-sm text-muted-foreground italic">
            No notes yet
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default ReservationSidebar;
