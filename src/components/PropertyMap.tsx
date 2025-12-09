
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/types/property';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
}

const PropertyMap = ({ properties, selectedProperty }: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { settings } = useSimplifiedSiteSettings();
  const { settings: tenantSettings } = useTenantSettings();
  
  const siteName = tenantSettings.site_name || 'Our Office';

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Get mapbox token from settings
    const mapboxToken = settings.mapboxToken;
    
    // Skip map initialization if no token is configured
    if (!mapboxToken || mapboxToken.trim() === '') {
      console.warn('Mapbox token not configured in site settings');
      return;
    }

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    // Default to US center - properties will be placed with offsets
    const defaultCenter: [number, number] = [-98.5795, 39.8283];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter,
      zoom: 4
    });

    // Add property markers with random offsets from center
    // In production, properties should have their own coordinates
    properties.forEach((property, index) => {
      if (property.location && map.current) {
        // Use slight offsets from center for visualization
        const lng = defaultCenter[0] + (Math.random() - 0.5) * 10;
        const lat = defaultCenter[1] + (Math.random() - 0.5) * 10;

        const marker = new mapboxgl.Marker({
          color: selectedProperty?.id === property.id ? '#F59E0B' : '#EF4444'
        })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2 max-w-xs">
                  <h3 class="font-bold text-sm">${property.title}</h3>
                  <p class="text-xs text-gray-600 mb-2">${property.location}</p>
                  <p class="text-xs mb-2">${property.bedrooms} bed • ${property.bathrooms} bath</p>
                  ${property.price_per_night ? `<p class="text-sm font-semibold text-blue-600">$${property.price_per_night}/night</p>` : ''}
                </div>
              `)
          )
          .addTo(map.current);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [properties, selectedProperty, settings.mapboxToken, siteName]);

  // Show placeholder if no mapbox token is configured
  if (!settings.mapboxToken || settings.mapboxToken.trim() === '') {
    return (
      <div 
        className="w-full h-96 rounded-lg border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center"
        style={{ minHeight: '400px' }}
      >
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">🗺️</div>
          <p className="text-sm">Map requires Mapbox token configuration</p>
          <p className="text-xs mt-1">Please configure in Admin Settings</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-96 rounded-lg border border-gray-200 shadow-sm"
      style={{ minHeight: '400px' }}
    />
  );
};

export default PropertyMap;
