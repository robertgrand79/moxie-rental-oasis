import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  MapPin, Phone, Clock, Star, ExternalLink, Navigation, Utensils, Coffee, Wrench, 
  AlertTriangle, ArrowLeft, Wifi, Key, Car, ScrollText, BookOpen, Shield, ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import GuidebookQuickAccess from './GuidebookQuickAccess';

interface Guidebook {
  id: string;
  property_id: string;
  title: string;
  content: {
    welcome_message?: string;
    check_in_instructions?: string;
    check_out_instructions?: string;
    door_code?: string;
    parking_instructions?: string;
    check_in_time?: string;
    check_out_time?: string;
    house_rules?: string[];
    amenities?: string[];
    appliance_guides?: Array<{
      name: string;
      icon?: string;
      instructions: string;
      tips?: string;
      troubleshooting?: string;
    }>;
    local_recommendations?: {
      restaurants?: Array<{
        name: string;
        type: string;
        distance: string;
        rating: number;
        description: string;
        phone?: string;
        website?: string;
      }>;
      activities?: Array<{
        name: string;
        type: string;
        distance: string;
        description: string;
        hours?: string;
        website?: string;
      }>;
      shopping?: Array<{
        name: string;
        type: string;
        distance: string;
        description: string;
        hours?: string;
      }>;
      transportation?: {
        airport: string;
        parking: string;
        public_transit: string[];
        rideshare: string[];
      };
    };
    emergency_contacts?: Array<{
      name: string;
      role: string;
      phone: string;
      available: string;
    }>;
    wifi?: {
      network: string;
      password: string;
    };
    property_address?: string;
  };
}

interface DigitalGuidebookProps {
  propertyId: string;
}

type GuidebookSection = 'welcome' | 'amenities' | 'appliances' | 'local' | 'info' | 'contact';

const DigitalGuidebook = ({ propertyId }: DigitalGuidebookProps) => {
  const [activeSection, setActiveSection] = useState<GuidebookSection>('welcome');

  const { data: guidebook, isLoading } = useQuery({
    queryKey: ['property-guidebook', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_guidebooks')
        .select('*')
        .eq('property_id', propertyId)
        .eq('is_active', true)
        .single();
      if (error) throw error;
      return data as Guidebook;
    },
  });

  const { data: property } = useQuery({
    queryKey: ['property-details', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('title, location, amenities')
        .eq('id', propertyId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground tracking-wide">Loading your guide...</p>
        </div>
      </div>
    );
  }

  if (!guidebook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center py-24">
          <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-medium tracking-tight mt-4">No guidebook available</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            The property guide hasn't been published yet. Check back closer to your arrival.
          </p>
        </div>
      </div>
    );
  }

  const content = guidebook.content || {};
  const hasAppliances = content.appliance_guides && content.appliance_guides.length > 0;
  const propertyTitle = property?.title || guidebook.title;

  const allSections: { id: GuidebookSection; icon: typeof BookOpen; label: string; available: boolean }[] = [
    { id: 'welcome', icon: BookOpen, label: 'Welcome', available: true },
    { id: 'amenities', icon: Wifi, label: 'Amenities', available: true },
    { id: 'appliances', icon: Wrench, label: 'Appliances', available: !!hasAppliances },
    { id: 'local', icon: MapPin, label: 'Local Guide', available: true },
    { id: 'info', icon: Navigation, label: 'Getting Here', available: true },
    { id: 'contact', icon: Shield, label: 'Emergency', available: true },
  ];
  const sections = allSections.filter(s => s.available);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/4 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="relative px-4 pt-safe-top max-w-2xl mx-auto">
          <div className="py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="rounded-full -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" strokeWidth={1.5} />
              Back
            </Button>
          </div>

          <div className="pb-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">
              Your Property Guide
            </p>
            <h1 className="font-serif text-3xl md:text-4xl tracking-tight">
              {propertyTitle}
            </h1>
            {property?.location && (
              <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>{property.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto pb-12 space-y-6">
        {/* Quick Access */}
        <GuidebookQuickAccess
          wifi={content.wifi}
          doorCode={content.door_code}
          parkingInstructions={content.parking_instructions}
          checkInTime={content.check_in_time}
          checkOutTime={content.check_out_time}
        />

        {/* Section Navigation – horizontal scroll pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {sections.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm whitespace-nowrap transition-all min-h-[44px] ${
                activeSection === id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card/60 backdrop-blur-sm border border-border/20 text-muted-foreground hover:border-border/40'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeSection === 'welcome' && (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="rounded-2xl p-6 backdrop-blur-md bg-card/60 border border-border/20">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {content.welcome_message || "Welcome to your home away from home! We hope you have a wonderful stay."}
              </p>
            </div>

            {/* Check-in / Check-out */}
            <div className="grid grid-cols-1 gap-3">
              {content.check_in_instructions && (
                <div className="rounded-2xl p-5 backdrop-blur-md bg-card/60 border border-border/20">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Check-in</p>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {content.check_in_instructions}
                  </p>
                </div>
              )}
              {content.check_out_instructions && (
                <div className="rounded-2xl p-5 backdrop-blur-md bg-card/60 border border-border/20">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Check-out</p>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {content.check_out_instructions}
                  </p>
                </div>
              )}
            </div>

            {/* House Rules */}
            {content.house_rules && content.house_rules.length > 0 && (
              <div className="rounded-2xl p-5 backdrop-blur-md bg-card/60 border border-border/20">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">House Rules</p>
                <div className="space-y-3">
                  {content.house_rules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="h-5 w-5 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] text-primary font-medium">{index + 1}</span>
                      </div>
                      <span className="text-foreground/80">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'amenities' && (
          <div className="space-y-6">
            <div className="rounded-2xl p-5 backdrop-blur-md bg-card/60 border border-border/20">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Available Amenities</p>
              <div className="grid grid-cols-2 gap-2">
                {(content.amenities || []).map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center gap-2.5 p-3 rounded-xl bg-background/50">
                    <div className="h-1.5 w-1.5 bg-primary/60 rounded-full" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {content.wifi && (
              <div className="rounded-2xl p-5 backdrop-blur-md bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <Wifi className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Wi-Fi</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Network</span>
                    <code className="bg-background/60 px-2.5 py-1 rounded-lg text-foreground">{content.wifi.network}</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Password</span>
                    <code className="bg-background/60 px-2.5 py-1 rounded-lg text-foreground">{content.wifi.password}</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'appliances' && hasAppliances && (
          <div className="rounded-2xl backdrop-blur-md bg-card/60 border border-border/20 overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {content.appliance_guides?.map((guide, index) => (
                <AccordionItem key={index} value={`appliance-${index}`} className="border-border/20">
                  <AccordionTrigger className="hover:no-underline px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-primary" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium">{guide.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 space-y-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{guide.instructions}</p>
                    {guide.tips && (
                      <div className="rounded-xl p-3 bg-primary/5">
                        <p className="text-xs font-medium text-primary mb-1">💡 Tip</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{guide.tips}</p>
                      </div>
                    )}
                    {guide.troubleshooting && (
                      <div className="rounded-xl p-3 bg-amber-500/5 border border-amber-500/10">
                        <p className="text-xs font-medium text-amber-700 mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Troubleshooting
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{guide.troubleshooting}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {activeSection === 'local' && (
          <LocalRecommendations recommendations={content.local_recommendations} />
        )}

        {activeSection === 'info' && (
          <div className="space-y-4">
            {content.property_address && (
              <div className="rounded-2xl p-5 backdrop-blur-md bg-card/60 border border-border/20">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Property Address</p>
                <p className="text-foreground/80">{content.property_address}</p>
                <p className="text-xs text-muted-foreground mt-2">Save this address for directions</p>
              </div>
            )}

            {content.local_recommendations?.transportation && (
              <div className="rounded-2xl p-5 backdrop-blur-md bg-card/60 border border-border/20 space-y-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Transportation</p>
                {content.local_recommendations.transportation.airport && (
                  <div>
                    <p className="text-sm font-medium mb-1">Airport</p>
                    <p className="text-sm text-muted-foreground">{content.local_recommendations.transportation.airport}</p>
                  </div>
                )}
                {content.local_recommendations.transportation.parking && (
                  <div>
                    <p className="text-sm font-medium mb-1">Parking</p>
                    <p className="text-sm text-muted-foreground">{content.local_recommendations.transportation.parking}</p>
                  </div>
                )}
                {content.local_recommendations.transportation.rideshare?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Rideshare</p>
                    <div className="flex gap-2">
                      {content.local_recommendations.transportation.rideshare.map((service, i) => (
                        <Badge key={i} variant="secondary" className="rounded-full bg-primary/5 text-primary border-0">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeSection === 'contact' && (
          <div className="space-y-4">
            {content.emergency_contacts && content.emergency_contacts.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Property Contacts</p>
                {content.emergency_contacts.map((contact, index) => (
                  <div key={index} className="rounded-2xl p-4 backdrop-blur-md bg-card/60 border border-border/20 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.role}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        {contact.available}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="rounded-full h-10 w-10 p-0" asChild>
                      <a href={`tel:${contact.phone}`}>
                        <Phone className="h-4 w-4 text-primary" strokeWidth={1.5} />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl p-5 backdrop-blur-md bg-destructive/5 border border-destructive/10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-destructive/70 mb-4">Emergency</p>
              <Button size="lg" variant="destructive" className="w-full rounded-xl min-h-[48px]" asChild>
                <a href="tel:911">
                  <Phone className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  Emergency Services — 911
                </a>
              </Button>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button variant="outline" size="sm" className="rounded-xl min-h-[44px]" asChild>
                  <a href="tel:311">Non-Emergency — 311</a>
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl min-h-[44px]" asChild>
                  <a href="tel:211">Information — 211</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Editorial Local Recommendations ── */
const LocalRecommendations = ({ recommendations }: { recommendations?: any }) => {
  if (!recommendations) {
    return (
      <div className="py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-6 w-6 text-primary" strokeWidth={1.5} />
        </div>
        <p className="text-muted-foreground text-sm">No local recommendations available yet.</p>
      </div>
    );
  }

  const RecommendationCard = ({ item, type }: { item: any; type: 'restaurant' | 'activity' | 'shop' }) => (
    <div className="rounded-2xl p-4 backdrop-blur-md bg-card/60 border border-border/20 hover:border-border/40 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-medium tracking-tight">{item.name}</h4>
            <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0 bg-muted/50 border-0 text-muted-foreground">
              {item.type}
            </Badge>
            {type === 'restaurant' && item.rating && (
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs text-muted-foreground">{item.rating}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Navigation className="h-3 w-3" strokeWidth={1.5} />
              {item.distance}
            </span>
            {item.hours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" strokeWidth={1.5} />
                {item.hours}
              </span>
            )}
            {item.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" strokeWidth={1.5} />
                {item.phone}
              </span>
            )}
          </div>
        </div>
        {item.website && (
          <Button size="icon" variant="ghost" className="rounded-full h-9 w-9 flex-shrink-0" asChild>
            <a href={item.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
            </a>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {recommendations.restaurants?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Dining</p>
          </div>
          <div className="space-y-3">
            {recommendations.restaurants.map((r: any, i: number) => (
              <RecommendationCard key={i} item={r} type="restaurant" />
            ))}
          </div>
        </div>
      )}

      {recommendations.activities?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Activities</p>
          </div>
          <div className="space-y-3">
            {recommendations.activities.map((a: any, i: number) => (
              <RecommendationCard key={i} item={a} type="activity" />
            ))}
          </div>
        </div>
      )}

      {recommendations.shopping?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Coffee className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Shopping & Services</p>
          </div>
          <div className="space-y-3">
            {recommendations.shopping.map((s: any, i: number) => (
              <RecommendationCard key={i} item={s} type="shop" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalGuidebook;
