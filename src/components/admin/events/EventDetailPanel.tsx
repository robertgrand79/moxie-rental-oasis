import React from 'react';
import { X, Edit, Calendar, Clock, MapPin, ExternalLink, Ticket, Star, RefreshCw, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Event } from '@/hooks/useEvents';

interface EventDetailPanelProps {
  event: Event;
  onClose: () => void;
  onEdit: () => void;
}

const EventDetailPanel = ({ event, onClose, onEdit }: EventDetailPanelProps) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      outdoor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      dining: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      culture: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      sports: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      community: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const formatEventDate = (eventDate: string) => {
    const date = new Date(eventDate);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                {event.status === 'published' ? 'Published' : 'Draft'}
              </Badge>
              {event.is_featured && (
                <Badge className="bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {event.is_recurring && (
                <Badge variant="outline">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Recurring
                </Badge>
              )}
              {event.category && (
                <Badge className={getCategoryColor(event.category)}>
                  {event.category}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{event.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Event Image */}
          {event.image_url && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Date & Time */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Date & Time</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center text-foreground">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                {formatEventDate(event.event_date)}
                {event.end_date && event.end_date !== event.event_date && (
                  <span> - {formatEventDate(event.end_date)}</span>
                )}
              </div>
              {event.time_start && (
                <div className="flex items-center text-foreground">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  {event.time_start}{event.time_end && ` - ${event.time_end}`}
                </div>
              )}
            </div>
            {event.is_recurring && event.recurrence_pattern && (
              <p className="text-sm text-muted-foreground">
                Recurrence: {event.recurrence_pattern}
              </p>
            )}
          </div>

          <Separator />

          {/* Location */}
          {event.location && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Location</h3>
                <div className="flex items-center text-foreground">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  {event.location}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Description */}
          {event.description && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Description</h3>
                <p className="text-foreground whitespace-pre-wrap">{event.description}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Price */}
          {event.price_range && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Price</h3>
                <div className="flex items-center text-foreground">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  <span className="font-medium text-green-600">{event.price_range}</span>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Links */}
          {(event.website_url || event.ticket_url) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Links</h3>
              <div className="flex flex-wrap gap-3">
                {event.website_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(event.website_url!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
                {event.ticket_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(event.ticket_url!, '_blank')}
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    Get Tickets
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Created: {new Date(event.created_at).toLocaleDateString()} • 
              Updated: {new Date(event.updated_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetailPanel;
