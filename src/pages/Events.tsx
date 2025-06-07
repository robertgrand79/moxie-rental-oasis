
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ExternalLink, Ticket, Filter } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { useEugeneEvents } from '@/hooks/useEugeneEvents';
import { format, parseISO } from 'date-fns';
import Footer from '@/components/Footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categoryLabels = {
  festival: 'Festival',
  sports: 'Sports',
  arts: 'Arts & Culture',
  food: 'Food & Drink',
  outdoor: 'Outdoor'
};

const Events = () => {
  const { events, isLoading } = useEugeneEvents();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('upcoming');

  // Filter events based on selected criteria
  const filteredEvents = events.filter(event => {
    if (!event.is_active) return false;
    
    const eventDate = new Date(event.event_date);
    const now = new Date();
    
    // Time filter
    if (timeFilter === 'upcoming' && eventDate < now) return false;
    if (timeFilter === 'past' && eventDate >= now) return false;
    
    // Category filter
    if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
    
    return true;
  });

  const formatEventDate = (dateStr: string, endDateStr?: string) => {
    const startDate = parseISO(dateStr);
    if (endDateStr && endDateStr !== dateStr) {
      const endDate = parseISO(endDateStr);
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
    return format(startDate, 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Eugene Events
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover what's happening in Eugene during your stay. From festivals and concerts 
              to outdoor adventures and cultural events.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past Events</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white"
                >
                  {event.image_url && (
                    <div className="relative overflow-hidden">
                      <OptimizedImage
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-white/90 text-gray-900">
                          {categoryLabels[event.category as keyof typeof categoryLabels] || event.category}
                        </Badge>
                      </div>
                      {event.is_featured && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-blue-600 text-white">Featured</Badge>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatEventDate(event.event_date, event.end_date)}</span>
                      </div>

                      {event.time_start && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>
                            {event.time_start}
                            {event.time_end && ` - ${event.time_end}`}
                          </span>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      {event.price_range && (
                        <div className="flex items-center">
                          <Ticket className="h-4 w-4 mr-2" />
                          <span>{event.price_range}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {event.ticket_url && (
                        <Button size="sm" className="flex-1" asChild>
                          <a
                            href={event.ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Ticket className="h-4 w-4 mr-1" />
                            Tickets
                          </a>
                        </Button>
                      )}
                      {event.website_url && (
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <a
                            href={event.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Details
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSelectedCategory('all');
                  setTimeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Events;
