import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTenantPointsOfInterest } from '@/hooks/useTenantPointsOfInterest';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';

const CATEGORY_COLORS: Record<string, string> = {
  // Store as "H S% L%" so we can use hsl(${color}) and hsl(${color} / alpha)
  restaurant: '0 84% 60%', // ~ red-500
  outdoor: '142 71% 45%', // ~ green-500
  culture: '258 90% 66%', // ~ violet-500
  entertainment: '38 92% 50%', // ~ amber-500
  other: '217 91% 60%', // ~ blue-500
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

  const { pointsOfInterest, isLoading: poisLoading, error: poisError } = useTenantPointsOfInterest();
  const { data: platformConfig, isLoading: configLoading, error: configError } = usePlatformConfig();

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapboxToken = platformConfig?.mapboxToken;

  // Filter POIs with valid coordinates
  const validPOIs = pointsOfInterest.filter(
    (poi) =>
      poi.latitude &&
      poi.longitude &&
      Math.abs(poi.latitude) <= 90 &&
      Math.abs(poi.longitude) <= 180
  );

  // Get unique categories from POIs
  const categories = [...new Set(validPOIs.map((poi) => poi.category || 'other'))];

  useEffect(() => {
    setMapError(null);
    setMapLoaded(false);

    console.log('[POIMap] Setup', {
      domain: window.location.host,
      hasToken: !!mapboxToken,
      tokenPreview: mapboxToken ? `${mapboxToken.slice(0, 3)}… (len ${mapboxToken.length})` : 'missing',
      poiCount: validPOIs.length,
    });

    // Cleanup first if map already exists
    if (map.current) {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.current.remove();
      map.current = null;
    }

    if (!mapContainer.current || !mapboxToken || validPOIs.length === 0) {
      if (!mapContainer.current) console.warn('[POIMap] Skipping init: no map container');
      if (!mapboxToken) console.warn('[POIMap] Skipping init: missing Mapbox token');
      if (validPOIs.length === 0) console.warn('[POIMap] Skipping init: no valid POIs');
      return;
    }

    // Set access token
    mapboxgl.accessToken = mapboxToken;

    // Calculate bounds from POIs
    const bounds = new mapboxgl.LngLatBounds();
    validPOIs.forEach((poi) => {
      // Handle potentially positive longitudes that should be negative (US West Coast)
      const lng = poi.longitude! > 0 && poi.longitude! > 100 ? -poi.longitude! : poi.longitude!;
      bounds.extend([lng, poi.latitude!]);
    });

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        bounds,
        fitBoundsOptions: { padding: 50, maxZoom: 14 },
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);

        // Add markers for each POI
        validPOIs.forEach((poi) => {
          const category = poi.category || 'other';
          const hsl = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;

          // Handle potentially positive longitudes
          const lng = poi.longitude! > 0 && poi.longitude! > 100 ? -poi.longitude! : poi.longitude!;

          // Create custom marker element
          const el = document.createElement('div');
          el.className = 'poi-marker';
          el.style.cssText = `
            width: 32px;
            height: 32px;
            background-color: hsl(${hsl});
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid hsl(0 0% 100%);
            box-shadow: 0 2px 6px hsl(0 0% 0% / 0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          `;

          // Create popup content
          const popupContent = `
            <div style="max-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
              <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: hsl(var(--foreground));">${poi.name}</h3>
              <span style="
                display: inline-block;
                padding: 2px 8px;
                background-color: hsl(${hsl} / 0.12);
                color: hsl(${hsl});
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                margin-bottom: 8px;
              ">${CATEGORY_LABELS[category] || category}</span>
              ${poi.rating ? `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="hsl(${hsl})" stroke="hsl(${hsl})">
                    <polygon points="12,2 15,9 22,9 17,14 19,22 12,18 5,22 7,14 2,9 9,9"/>
                  </svg>
                  <span style="font-size: 14px; font-weight: 500; color: hsl(var(--foreground));">${poi.rating}</span>
                </div>
              ` : ''}
              ${poi.address ? `<p style="margin: 0 0 8px; font-size: 13px; color: hsl(var(--muted-foreground));">${poi.address}</p>` : ''}
              ${poi.description ? `<p style="margin: 0 0 8px; font-size: 13px; color: hsl(var(--foreground));">${poi.description.substring(0, 100)}${poi.description.length > 100 ? '...' : ''}</p>` : ''}
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(poi.address || poi.name)}" 
                target="_blank" 
                rel="noopener noreferrer"
                style="
                  display: inline-block;
                  padding: 6px 12px;
                  background-color: hsl(${hsl});
                  color: hsl(0 0% 100%);
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
        const message = (e?.error as { message?: string } | undefined)?.message || 'Mapbox failed to load.';
        console.error('[POIMap] Mapbox error:', e.error);
        setMapError(message);
      });
    } catch (error) {
      console.error('[POIMap] Failed to initialize map:', error);
      setMapError(error instanceof Error ? error.message : 'Failed to initialize map.');
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setMapLoaded(false);
    };
  }, [mapboxToken, JSON.stringify(validPOIs)]);

  const isLoading = poisLoading || configLoading;
  const combinedError =
    poisError ||
    (configError ? ((configError as { message?: string })?.message ?? String(configError)) : null) ||
    mapError;

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

  if (combinedError) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertTitle>Map failed to load</AlertTitle>
            <AlertDescription>
              <p>{combinedError}</p>
              <p className="mt-2">
                Domain: <span className="font-mono">{window.location.host}</span>
              </p>
              <p className="mt-2">
                If your Mapbox token has URL restrictions, add this domain to the allowed list.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  if (!mapboxToken) {
    console.warn('[POIMap] No Mapbox token configured; map will not render.');
    return null; // No token configured at platform level
  }

  if (validPOIs.length === 0) {
    console.warn('[POIMap] No valid POIs with coordinates; map will not render.');
    return null;
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Explore the Area</h2>
          <p className="text-muted-foreground">Discover {validPOIs.length} local spots near our properties</p>
        </div>

        <div className="relative">
          <div ref={mapContainer} className="w-full h-[350px] md:h-[500px] lg:h-[600px] rounded-xl shadow-lg overflow-hidden" />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-md">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <div key={category} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: `hsl(${CATEGORY_COLORS[category] || CATEGORY_COLORS.other})` }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium">{CATEGORY_LABELS[category] || category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* (debug) keep mapLoaded in state to avoid regressions / future UI hooks */}
          <span className="sr-only" aria-live="polite">{mapLoaded ? 'Map loaded' : 'Map not loaded'}</span>
        </div>
      </div>
    </section>
  );
};

export default POIMap;

