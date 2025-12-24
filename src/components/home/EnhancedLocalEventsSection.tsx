import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, ExternalLink, Ticket, Search, Filter } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { useTenantLocalEvents, TenantLocalEvent } from '@/hooks/useTenantLocalEvents';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useContentAnalytics } from '@/hooks/useContentAnalytics';

const categoryLabels = {
  festival: 'Festival',
  sports: 'Sports',
  arts: 'Arts & Culture',
  food: 'Food & Drink',
  outdoor: 'Outdoor'
};

const EnhancedLocalEventsSection = () => {
  const { events, isLoading } = useTenantLocalEvents();
  const { trackInteraction } = useContentAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [showAll, setShowAll] = useState(false);

  // Track event interactions with enhanced metadata
  const trackEventClick = useMutation({
    mutationFn: async ({ event, actionType }: { event: TenantLocalEvent; actionType: 'view' | 'ticket' | 'website' }) => {
      return trackInteraction.mutateAsync({
        content_type: 'event',
        content_id: event.id,
        action_type: actionType,
        metadata: {
          title: event.title,
          category: event.category,
          event_date: event.event_date,
          is_featured: event.is_featured,
          has_tickets: !!event.ticket_url,
          has_website: !!event.website_url
        }
      });
    }
  });

  // Enhanced filtering with time-based logic
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => event.is_active);
    const now = new Date();
    const nextWeek = addDays(now, 7);

    // Apply time filter
    switch (timeFilter) {
      case 'today':
        filtered = filtered.filter(event => {
          const eventDate = parseISO(event.event_date);
          return format(eventDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
        });
        break;
      case 'this-week':
        filtered = filtered.filter(event => {
          const eventDate = parseISO(event.event_date);
          return isAfter(eventDate, now) && isBefore(eventDate, nextWeek);
        });
        break;
      case 'upcoming':
        filtered = filtered.filter(event => {
          const eventDate = parseISO(event.event_date);
          return isAfter(eventDate, now);
        });
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Sort by featured first, then by date
    filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
    });

    return filtered;
  }, [events, searchTerm, selectedCategory, timeFilter]);

  const displayEvents = showAll ? filteredEvents : filteredEvents.slice(0, 6);
  const hasMore = filteredEvents.length > 6;

  const formatEventDate = (dateStr: string, endDateStr?: string) => {
    const startDate = parseISO(dateStr);
    if (endDateStr && endDateStr !== dateStr) {
      const endDate = parseISO(endDateStr);
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
    return format(startDate, 'MMM d, yyyy');
  };

  const handleEventAction = (event: TenantLocalEvent, actionType: 'view' | 'ticket' | 'website') => {
    trackEventClick.mutate({ event, actionType });
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Hide section entirely if no events for this tenant
  if (filteredEvents.length === 0 && searchTerm === '' && selectedCategory === 'all' && timeFilter === 'upcoming') {
    return null;
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">What's Happening</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover upcoming events and activities during your stay
          </p>
        </div>

        {/* Enhanced Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="upcoming">Upcoming</option>
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayEvents.map((event) => (
            <Card
              key={event.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-card cursor-pointer"
              onClick={() => handleEventAction(event, 'view')}
            >
              {event.image_url && (
                <div className="relative overflow-hidden">
                  <OptimizedImage
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-background/90 text-foreground">
                      {categoryLabels[event.category as keyof typeof categoryLabels] || event.category}
                    </Badge>
                  </div>
                  {event.is_featured && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                    </div>
                  )}
                </div>
              )}
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>

                {event.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
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

                <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                  {event.ticket_url && (
                    <Button 
                      size="sm" 
                      className="flex-1" 
                      asChild
                      onClick={() => handleEventAction(event, 'ticket')}
                    >
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1" 
                      asChild
                      onClick={() => handleEventAction(event, 'website')}
                    >
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

        {/* Show More/Less Button */}
        {hasMore && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-2"
            >
              {showAll ? 'Show Less' : `Show All ${filteredEvents.length} Events`}
            </Button>
          </div>
        )}

        {filteredEvents.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link to="/events">
                View All Events
              </Link>
            </Button>
          </div>
        )}

        {filteredEvents.length === 0 && (searchTerm || selectedCategory !== 'all' || timeFilter !== 'upcoming') && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setTimeFilter('upcoming');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EnhancedLocalEventsSection;
