import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTenantPointsOfInterest } from '@/hooks/useTenantPointsOfInterest';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { MapPin, Star } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  restaurant: '#EF4444',  // Red
  outdoor: '#22C55E',     // Green
  culture: '#8B5CF6',     // Purple
  entertainment: '#F59E0B', // Orange
  other: '#3B82F6',       // Blue
};

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: 'Restaurants',
  outdoor: 'Outdoor',
  culture: 'Culture',
  entertainment: 'Entertainment',
  other: 'Other',
};

const POIMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { pointsOfInterest, isLoading: poisLoading } = useTenantPointsOfInterest();
  const { settings, loading: settingsLoading } = useTenantSettings();
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter POIs with valid coordinates
  const validPOIs = pointsOfInterest.filter(
    poi => poi.latitude && poi.longitude && 
           Math.abs(poi.latitude) <= 90 && 
           Math.abs(poi.longitude) <= 180
  );

  // Get unique categories from POIs
  const categories = [...new Set(validPOIs.map(poi => poi.category || 'other'))];

  useEffect(() => {
    // Cleanup first if map already exists
    if (map.current) {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current.remove();
      map.current = null;
    }

    if (!mapContainer.current || !settings?.mapboxToken || validPOIs.length === 0) return;

    // Set access token
    mapboxgl.accessToken = settings.mapboxToken;

    // Calculate bounds from POIs
    const bounds = new mapboxgl.LngLatBounds();
    validPOIs.forEach(poi => {
      // Handle potentially positive longitudes that should be negative (US West Coast)
      const lng = poi.longitude! > 0 && poi.longitude! > 100 ? -poi.longitude! : poi.longitude!;
      bounds.extend([lng, poi.latitude!]);
    });

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        bounds: bounds,
        fitBoundsOptions: { padding: 50, maxZoom: 14 },
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);

        // Add markers for each POI
        validPOIs.forEach(poi => {
          const category = poi.category || 'other';
          const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
          
          // Handle potentially positive longitudes
          const lng = poi.longitude! > 0 && poi.longitude! > 100 ? -poi.longitude! : poi.longitude!;

          // Create custom marker element
          const el = document.createElement('div');
          el.className = 'poi-marker';
          el.style.cssText = `
            width: 32px;
            height: 32px;
            background-color: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          `;

          // Create popup content
          const popupContent = `
            <div style="max-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
              <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${poi.name}</h3>
              <span style="
                display: inline-block;
                padding: 2px 8px;
                background-color: ${color}20;
                color: ${color};
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                margin-bottom: 8px;
              ">${CATEGORY_LABELS[category] || category}</span>
              ${poi.rating ? `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="${color}" stroke="${color}">
                    <polygon points="12,2 15,9 22,9 17,14 19,22 12,18 5,22 7,14 2,9 9,9"/>
                  </svg>
                  <span style="font-size: 14px; font-weight: 500;">${poi.rating}</span>
                </div>
              ` : ''}
              ${poi.address ? `<p style="margin: 0 0 8px; font-size: 13px; color: #666;">${poi.address}</p>` : ''}
              ${poi.description ? `<p style="margin: 0 0 8px; font-size: 13px; color: #444;">${poi.description.substring(0, 100)}${poi.description.length > 100 ? '...' : ''}</p>` : ''}
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(poi.address || poi.name)}" 
                target="_blank" 
                rel="noopener noreferrer"
                style="
                  display: inline-block;
                  padding: 6px 12px;
                  background-color: ${color};
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  font-size: 13px;
                  font-weight: 500;
                "
              >Get Directions</a>
            </div>
          `;

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([lng, poi.latitude!])
            .setPopup(popup)
            .addTo(map.current!);

          markersRef.current.push(marker);
        });
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error);
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setMapLoaded(false);
    };
  }, [settings?.mapboxToken, JSON.stringify(validPOIs)]);

  const isLoading = poisLoading || settingsLoading;

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="h-[400px] rounded-xl bg-muted animate-pulse flex items-center justify-center">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!settings?.mapboxToken) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="h-[300px] rounded-xl bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Interactive map coming soon</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (validPOIs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Explore the Area</h2>
          <p className="text-muted-foreground">
            Discover {validPOIs.length} local spots near our properties
          </p>
        </div>

        <div className="relative">
          <div 
            ref={mapContainer} 
            className="w-full h-[450px] rounded-xl shadow-lg overflow-hidden"
          />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-md">
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <div key={category} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.other }}
                  />
                  <span className="text-xs font-medium">
                    {CATEGORY_LABELS[category] || category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default POIMap;
