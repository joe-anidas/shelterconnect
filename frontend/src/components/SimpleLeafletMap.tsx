import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers not showing up in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetinaIcon from 'leaflet/dist/images/marker-icon-2x.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerRetinaIcon,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Shelter {
  id: number;
  name: string;
  capacity: number;
  occupancy: number;
  lat: number | string;
  lng: number | string;
  features: string;
}

interface Request {
  id: number;
  name: string;
  lat: number | string;
  lng: number | string;
  status: string;
}

interface SimpleLeafletMapProps {
  shelters: Shelter[];
  requests?: Request[];
  onShelterClick?: (shelter: Shelter) => void;
}

export default function SimpleLeafletMap({ shelters, requests = [], onShelterClick }: SimpleLeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) { return; }

    // Convert string coordinates to numbers and filter out invalid ones
    const validShelters = shelters.filter(s => s.lat != null && s.lng != null).map(s => ({
      ...s,
      lat: Number(s.lat),
      lng: Number(s.lng)
    })).filter(s => !isNaN(s.lat) && !isNaN(s.lng));

    const validRequests = requests.filter(r => r.lat != null && r.lng != null).map(r => ({
      ...r,
      lat: Number(r.lat),
      lng: Number(r.lng)
    })).filter(r => !isNaN(r.lat) && !isNaN(r.lng));

    // Default center (Chennai, India) if no valid coordinates
    const defaultCenter: [number, number] = [13.0827, 80.2707];
    const center = validShelters.length > 0 ? [validShelters[0].lat, validShelters[0].lng] as [number, number] : defaultCenter;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, 11);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create custom icons
    const shelterIcon = L.divIcon({
      html: `<div style="background: #1d4ed8; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </div>`,
      className: 'custom-shelter-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const requestIcon = L.divIcon({
      html: `<div style="background: #ef4444; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C10.1 2 8.5 3.6 8.5 5.5s1.6 3.5 3.5 3.5 3.5-1.6 3.5-3.5S13.9 2 12 2zm0 14c-2.7 0-5.8 1.29-6 2.01V19h12v-1c-.2-.71-3.3-2-6-2z"/>
        </svg>
      </div>`,
      className: 'custom-request-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Add shelter markers
    const allMarkers: L.Marker[] = [];
    validShelters.forEach((shelter) => {
      const occupancyRatio = shelter.occupancy / shelter.capacity;
      const occupancyColor = occupancyRatio >= 0.9 ? '#ef4444' : occupancyRatio >= 0.7 ? '#f59e0b' : '#10b981';
      
      const marker = L.marker([shelter.lat, shelter.lng], { icon: shelterIcon })
        .bindPopup(`
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${shelter.name}</h3>
            <div style="font-size: 14px; line-height: 1.4;">
              <div style="display: flex; justify-content: space-between;">
                <span>Capacity:</span>
                <span style="font-weight: 500;">${shelter.capacity}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Occupancy:</span>
                <span style="font-weight: 500; color: ${occupancyColor};">
                  ${shelter.occupancy} (${Math.round(occupancyRatio * 100)}%)
                </span>
              </div>
              <div style="margin-top: 8px;">
                <span style="color: #6b7280; font-size: 12px;">Features:</span>
                <div style="font-size: 12px; margin-top: 4px;">${shelter.features}</div>
              </div>
            </div>
            ${onShelterClick ? `
              <button onclick="window.dispatchEvent(new CustomEvent('shelter-click', { detail: ${JSON.stringify(shelter)} }))" 
                      style="margin-top: 8px; padding: 4px 12px; background: #2563eb; color: white; font-size: 12px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
                View Details
              </button>
            ` : ''}
          </div>
        `)
        .addTo(map);
      
      allMarkers.push(marker);
    });

    // Add request markers
    validRequests.forEach((request) => {
      const marker = L.marker([request.lat, request.lng], { icon: requestIcon })
        .bindPopup(`
          <div style="padding: 8px; min-width: 180px;">
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${request.name}</h3>
            <div style="font-size: 14px;">
              <div style="display: flex; justify-content: space-between;">
                <span>Status:</span>
                <span style="font-weight: 500; padding: 2px 8px; border-radius: 4px; font-size: 12px; ${
                  request.status === 'pending' ? 'background: #fef3c7; color: #92400e;' :
                  request.status === 'assigned' ? 'background: #d1fae5; color: #065f46;' :
                  'background: #f3f4f6; color: #374151;'
                }">
                  ${request.status}
                </span>
              </div>
            </div>
          </div>
        `)
        .addTo(map);
      
      allMarkers.push(marker);
    });

    // Fit bounds to show all markers
    if (allMarkers.length > 0) {
      const group = new L.FeatureGroup(allMarkers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Handle shelter click events
    if (onShelterClick) {
      const handleShelterClick = (event: any) => {
        onShelterClick(event.detail);
      };
      window.addEventListener('shelter-click', handleShelterClick);
      
      // Cleanup function will remove this listener
      mapInstanceRef.current = map;
      (map as any)._shelterClickHandler = handleShelterClick;
    } else {
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        if ((mapInstanceRef.current as any)._shelterClickHandler) {
          window.removeEventListener('shelter-click', (mapInstanceRef.current as any)._shelterClickHandler);
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [shelters, requests, onShelterClick]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-200"
      style={{ minHeight: '400px' }}
    />
  );
}
