
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/types/property';

interface PropertyMapProps {
  properties: Property[];
  mapboxToken?: string;
}

const PropertyMap = ({ properties, mapboxToken }: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Eugene, Oregon coordinates for center
  const eugeneCenter: [number, number] = [-123.0917, 44.0520];

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: eugeneCenter,
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add markers for each property
    properties.forEach((property) => {
      // Create a popup for each property
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
          <h3 class="font-semibold text-sm">${property.title}</h3>
          <p class="text-xs text-gray-600 mb-1">${property.location}</p>
          <p class="text-xs font-medium">$${property.pricePerNight}/night</p>
        </div>`
      );

      // Use accurate coordinates for each property
      let coordinates: [number, number];
      
      switch (property.id) {
        case 'harris-st':
          coordinates = [-123.07797850475191, 44.025703181895906]; // Harris St
          break;
        case 'kincaid-st':
          coordinates = [-123.07938489901107, 44.030271922261456]; // Kincaid St
          break;
        case 'w-10th-house':
          coordinates = [-123.09827283381007, 44.04873026170491]; // W 10th House
          break;
        case 'w-10th-studio':
          coordinates = [-123.09827283381007, 44.04873026170491]; // W 10th Studio
          break;
        case 'woodlawn-ave':
          coordinates = [-123.0647321842284, 44.03201836311886]; // Woodlawn Ave
          break;
        default:
          coordinates = eugeneCenter;
      }

      // Create a marker
      new mapboxgl.Marker({
        color: '#3B82F6',
        scale: 0.8
      })
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [properties, mapboxToken]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-4">Map requires Mapbox token</p>
          <p className="text-sm text-gray-500">
            Add your Mapbox public token to display property locations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default PropertyMap;
