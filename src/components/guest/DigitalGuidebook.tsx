import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Phone, Clock, Star, ExternalLink, Navigation, Utensils, Coffee } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Guidebook {
  id: string;
  property_id: string;
  title: string;
  content: {
    welcome_message?: string;
    check_in_instructions?: string;
    check_out_instructions?: string;
    house_rules?: string[];
    amenities?: string[];
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
  };
}

interface DigitalGuidebookProps {
  propertyId: string;
}

const DigitalGuidebook = ({ propertyId }: DigitalGuidebookProps) => {
  const [activeTab, setActiveTab] = useState('welcome');

  // Fetch guidebook data
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

  // Fetch property details
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
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading guidebook...</p>
        </div>
      </div>
    );
  }

  if (!guidebook) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No guidebook available for this property.</p>
        </CardContent>
      </Card>
    );
  }

  const content = guidebook.content || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{property?.title || guidebook.title}</CardTitle>
          <CardDescription>Your Complete Property Guide</CardDescription>
          {property?.location && (
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {property.location}
            </div>
          )}
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="local">Local Guide</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="welcome" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {content.welcome_message || "Welcome to your home away from home! We hope you have a wonderful stay."}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Check-in Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {content.check_in_instructions || "Check-in instructions will be provided separately."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Check-out Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {content.check_out_instructions || "Please ensure all doors are locked and keys are left as instructed."}
                </p>
              </CardContent>
            </Card>
          </div>

          {content.house_rules && content.house_rules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>House Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {content.house_rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="amenities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Amenities</CardTitle>
              <CardDescription>Everything available during your stay</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(content.amenities || (property?.amenities ? [property.amenities] : []) || []).map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
              {content.wifi && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">WiFi Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Network:</strong> {content.wifi.network}</p>
                    <p><strong>Password:</strong> <code className="bg-white px-2 py-1 rounded">{content.wifi.password}</code></p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="local" className="space-y-6">
          <LocalRecommendations recommendations={content.local_recommendations} />
        </TabsContent>

        <TabsContent value="info" className="space-y-6">
          {content.local_recommendations?.transportation && (
            <Card>
              <CardHeader>
                <CardTitle>Transportation</CardTitle>
                <CardDescription>Getting around Eugene</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Airport</h4>
                  <p className="text-sm text-muted-foreground">{content.local_recommendations.transportation.airport}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Parking</h4>
                  <p className="text-sm text-muted-foreground">{content.local_recommendations.transportation.parking}</p>
                </div>
                {content.local_recommendations.transportation.public_transit && (
                  <div>
                    <h4 className="font-medium mb-2">Public Transit</h4>
                    <div className="space-y-1">
                      {content.local_recommendations.transportation.public_transit.map((option, index) => (
                        <p key={index} className="text-sm text-muted-foreground">{option}</p>
                      ))}
                    </div>
                  </div>
                )}
                {content.local_recommendations.transportation.rideshare && (
                  <div>
                    <h4 className="font-medium mb-2">Rideshare Options</h4>
                    <div className="flex gap-2">
                      {content.local_recommendations.transportation.rideshare.map((service, index) => (
                        <Badge key={index} variant="outline">{service}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          {content.emergency_contacts && content.emergency_contacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>Important numbers for your stay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.emergency_contacts.map((contact, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{contact.name}</h4>
                        <p className="text-sm text-muted-foreground">{contact.role}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">{contact.available}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`tel:${contact.phone}`}>
                          <Phone className="h-4 w-4 mr-1" />
                          {contact.phone}
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>General Emergency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button size="lg" variant="destructive" className="w-full" asChild>
                <a href="tel:911">
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency Services - 911
                </a>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="tel:311">
                    Non-Emergency - 311
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="tel:211">
                    Information - 211
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Local Recommendations Component
const LocalRecommendations = ({ recommendations }: { recommendations?: any }) => {
  if (!recommendations) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No local recommendations available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {recommendations.restaurants && recommendations.restaurants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Restaurants & Dining
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.restaurants.map((restaurant: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{restaurant.name}</h4>
                      <Badge variant="outline">{restaurant.type}</Badge>
                      {restaurant.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{restaurant.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{restaurant.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        {restaurant.distance}
                      </span>
                      {restaurant.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {restaurant.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  {restaurant.website && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {recommendations.activities && recommendations.activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Activities & Attractions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.activities.map((activity: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{activity.name}</h4>
                      <Badge variant="outline">{activity.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        {activity.distance}
                      </span>
                      {activity.hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.hours}
                        </span>
                      )}
                    </div>
                  </div>
                  {activity.website && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={activity.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {recommendations.shopping && recommendations.shopping.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              Shopping & Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.shopping.map((shop: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{shop.name}</h4>
                    <Badge variant="outline">{shop.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{shop.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {shop.distance}
                    </span>
                    {shop.hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {shop.hours}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DigitalGuidebook;