import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/types/property';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { MapPin } from 'lucide-react';
import { generateAddressSlug } from '@/utils/addressSlug';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertyClick?: (property: Property) => void;
}

const PropertyMap = ({ properties, selectedProperty, onPropertyClick }: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const { data: platformConfig, isLoading } = usePlatformConfig();
  const { settings: tenantSettings } = useTenantSettings();
  
  const siteName = tenantSettings.site_name || 'Our Office';
  const mapboxToken = platformConfig?.mapboxToken;

  // Filter properties that have valid coordinates
  const propertiesWithCoordinates = properties.filter(
    p => p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude)
  );

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Skip if no token configured
    if (!mapboxToken || mapboxToken.trim() === '') {
      console.warn('Mapbox token not configured');
      return;
    }

    // Skip if no properties with coordinates
    if (propertiesWithCoordinates.length === 0) {
      return;
    }

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    // Calculate center from properties with coordinates
    const lngs = propertiesWithCoordinates.map(p => p.longitude!);
    const lats = propertiesWithCoordinates.map(p => p.latitude!);
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    
    // Remove existing map if it exists
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: propertiesWithCoordinates.length === 1 ? 12 : 10
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: false }),
      'top-right'
    );

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add property markers
    propertiesWithCoordinates.forEach((property) => {
      if (!map.current) return;
      
      const isSelected = selectedProperty?.id === property.id;
      const addressSlug = generateAddressSlug(property.location);
      
      const marker = new mapboxgl.Marker({
        color: isSelected ? '#F59E0B' : '#EF4444'
      })
        .setLngLat([property.longitude!, property.latitude!])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2 max-w-xs">
                <h3 class="font-bold text-sm">${property.title}</h3>
                <p class="text-xs text-gray-600 mb-2">${property.location}</p>
                <p class="text-xs mb-2">${property.bedrooms} bed • ${property.bathrooms} bath</p>
                <a href="/property/${addressSlug}" class="text-xs text-blue-600 hover:underline">View property →</a>
              </div>
            `)
        )
        .addTo(map.current);
      
      // Add click handler if callback provided
      if (onPropertyClick) {
        marker.getElement().addEventListener('click', () => {
          onPropertyClick(property);
        });
      }
      
      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (propertiesWithCoordinates.length > 1 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      propertiesWithCoordinates.forEach(p => {
        bounds.extend([p.longitude!, p.latitude!]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [propertiesWithCoordinates.length, selectedProperty, mapboxToken, onPropertyClick]);

  // Show loading state
  if (isLoading) {
    return (
      <div 
        className="w-full h-80 rounded-lg border border-border shadow-sm bg-muted/50 flex items-center justify-center animate-pulse"
      >
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  // Hide map if no token configured
  if (!mapboxToken || mapboxToken.trim() === '') {
    return null;
  }

  // Show message if no properties have coordinates
  if (propertiesWithCoordinates.length === 0) {
    return (
      <div className="w-full rounded-lg border border-border bg-muted/30 flex flex-col items-center justify-center p-8 h-48">
        <MapPin className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-center">
          No properties with map coordinates available
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Add coordinates to properties in the admin panel
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-80 rounded-lg border border-border shadow-sm"
    />
  );
};

export default PropertyMap;
