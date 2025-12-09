import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book, ExternalLink, Settings, MapPin, Phone, Wifi, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const GuidebooksTab = () => {
  // Use organization-scoped properties
  const { properties: orgProperties, loading: propertiesLoading } = usePropertyFetch();
  const orgPropertyIds = orgProperties.map(p => p.id);
  
  // Fetch property access details and guidebooks for org properties
  const { data: propertiesWithDetails, isLoading } = useQuery({
    queryKey: ['properties-guidebooks', orgPropertyIds],
    queryFn: async () => {
      if (orgPropertyIds.length === 0) return [];
      
      // Fetch properties with access details
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select(`
          id, 
          title, 
          location
        `)
        .in('id', orgPropertyIds)
        .order('title');
      
      if (propError) throw propError;

      // Fetch guidebooks for these properties
      const { data: guidebooks, error: guidebookError } = await supabase
        .from('property_guidebooks')
        .select('property_id, is_active')
        .in('property_id', orgPropertyIds);

      if (guidebookError) throw guidebookError;

      // Combine data
      return properties.map(p => ({
        ...p,
        hasGuidebook: guidebooks?.some(g => g.property_id === p.id)
      }));
    },
    enabled: !propertiesLoading && orgPropertyIds.length > 0,
  });
  
  const properties = propertiesWithDetails;

  if (isLoading || propertiesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const propertiesWithGuidebook = properties?.filter(p => p.hasGuidebook) || [];
  const propertiesWithoutGuidebook = properties?.filter(p => !p.hasGuidebook) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Digital Guidebooks</h3>
          <p className="text-sm text-muted-foreground">
            Manage property guidebooks with check-in instructions, house rules, and local recommendations
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">{properties?.length || 0}</p>
              </div>
              <Book className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Guidebook</p>
                <p className="text-2xl font-bold text-green-600">{propertiesWithGuidebook.length}</p>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Setup</p>
                <p className="text-2xl font-bold text-amber-600">{propertiesWithoutGuidebook.length}</p>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
                Pending
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties with Guidebooks */}
      {propertiesWithGuidebook.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Book className="h-5 w-5 text-green-500" />
              Active Guidebooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {propertiesWithGuidebook.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{property.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {property.location || 'No location'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={`/guest/guidebook/${property.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Preview
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/guidebooks/${property.id}/edit`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Properties without Guidebooks */}
      {propertiesWithoutGuidebook.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Book className="h-5 w-5 text-amber-500" />
              Needs Guidebook Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {propertiesWithoutGuidebook.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-dashed bg-card"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{property.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {property.location || 'No location set'}
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/admin/guidebooks/${property.id}/edit`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Guidebook
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-3">Guidebook Best Practices</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Wifi className="h-4 w-4 mt-0.5 text-primary" />
              Include WiFi details prominently - guests always look for this first
            </li>
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-primary" />
              Add emergency contact information and local services
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-primary" />
              Include local recommendations for restaurants, attractions, and activities
            </li>
            <li className="flex items-start gap-2">
              <Book className="h-4 w-4 mt-0.5 text-primary" />
              Keep instructions clear and concise with step-by-step guides
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuidebooksTab;
