
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, ExternalLink, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface EventsPreviewProps {
  formData: any;
  categories: Array<{ value: string; label: string }>;
}

const EventsPreview = ({ formData, categories }: EventsPreviewProps) => {
  const formatEventDate = (dateStr: string, endDateStr?: string) => {
    if (!dateStr) return '';
    try {
      const startDate = new Date(dateStr);
      if (endDateStr && endDateStr !== dateStr) {
        const endDate = new Date(endDateStr);
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      }
      return format(startDate, 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  if (!formData.title) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Start filling out the form to see a preview of your event</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-xl">{formData.title}</h4>
              <div className="flex gap-1">
                {formData.status === 'draft' && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                    Draft
                  </Badge>
                )}
                {formData.status === 'published' && (
                  <Badge className="bg-green-600 text-white">Published</Badge>
                )}
                {formData.is_featured && (
                  <Badge className="bg-blue-600 text-white">Featured</Badge>
                )}
                {!formData.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                {formData.is_recurring && (
                  <Badge variant="outline">Recurring</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-3">
              <Badge variant="secondary" className="mr-3">
                {categories.find(c => c.value === formData.category)?.label || formData.category}
              </Badge>
              {formData.event_date && (
                <>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="mr-4">{formatEventDate(formData.event_date, formData.end_date)}</span>
                </>
              )}
              {formData.time_start && (
                <>
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="mr-4">
                    {formData.time_start}
                    {formData.time_end && ` - ${formData.time_end}`}
                  </span>
                </>
              )}
              {formData.location && (
                <>
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{formData.location}</span>
                </>
              )}
            </div>

            {formData.description && (
              <p className="text-gray-600 text-sm mb-4">{formData.description}</p>
            )}

            {formData.price_range && (
              <p className="text-sm font-medium mb-4">Price: {formData.price_range}</p>
            )}

            {(formData.website_url || formData.ticket_url) && (
              <div className="flex gap-2">
                {formData.website_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={formData.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Website
                    </a>
                  </Button>
                )}
                {formData.ticket_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={formData.ticket_url} target="_blank" rel="noopener noreferrer">
                      <Ticket className="h-3 w-3 mr-1" />
                      Tickets
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {formData.image_url && (
            <div className="ml-4">
              <img
                src={formData.image_url}
                alt={formData.title}
                className="w-32 h-24 object-cover rounded"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventsPreview;
