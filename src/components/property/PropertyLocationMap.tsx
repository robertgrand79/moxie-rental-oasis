import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/types/property';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { MapPin } from 'lucide-react';

interface PropertyLocationMapProps {
  property: Property;
  className?: string;
}

const PropertyLocationMap = ({ property, className = '' }: PropertyLocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { data: platformConfig, isLoading } = usePlatformConfig();
  
  const mapboxToken = platformConfig?.mapboxToken;
  const hasCoordinates = property.latitude && property.longitude;

  useEffect(() => {
    if (!mapContainer.current || map.current || !hasCoordinates) return;

    if (!mapboxToken || mapboxToken.trim() === '') {
      console.warn('Mapbox token not configured');
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    
    const center: [number, number] = [property.longitude!, property.latitude!];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: 14
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: false }),
      'top-right'
    );

    // Add marker for property
    new mapboxgl.Marker({ color: '#EF4444' })
      .setLngLat(center)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2 max-w-xs">
              <h3 class="font-bold text-sm">${property.title}</h3>
              <p class="text-xs text-gray-600">${property.location}</p>
            </div>
          `)
      )
      .addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [property, mapboxToken, hasCoordinates]);

  if (isLoading) {
    return (
      <div className={`w-full rounded-lg border border-border shadow-sm bg-muted/50 flex items-center justify-center h-64 ${className}`}>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (!mapboxToken || mapboxToken.trim() === '') {
    return null;
  }

  if (!hasCoordinates) {
    return (
      <div className={`w-full rounded-lg border border-border bg-muted/30 flex flex-col items-center justify-center p-8 h-64 ${className}`}>
        <MapPin className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-center">
          Map coordinates not available for this property
        </p>
        <p className="text-sm text-muted-foreground mt-1">{property.location}</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className={`w-full rounded-lg border border-border shadow-sm h-64 ${className}`}
    />
  );
};

export default PropertyLocationMap;
