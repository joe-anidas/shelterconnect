import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Users, AlertTriangle } from 'lucide-react';
import { config } from '../config/env';

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

interface GoogleMapViewProps {
  shelters: Shelter[];
  requests?: Request[];
  onShelterClick?: (shelter: Shelter) => void;
}

export default function GoogleMapView({ shelters, requests = [], onShelterClick }: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Initialize Google Maps
  useEffect(() => {
    console.log('GoogleMapView: Initializing with API key:', config.googleMapsApiKey ? 'Present' : 'Missing');
    
    if (!config.googleMapsApiKey) {
      console.error('GoogleMapView: No API key found');
      setError('Google Maps API key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
      setIsLoading(false);
      return;
    }

    console.log('GoogleMapView: Creating loader...');
    const loader = new Loader({
      apiKey: config.googleMapsApiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    console.log('GoogleMapView: Loading Google Maps API...');
    loader
      .load()
      .then(() => {
        console.log('GoogleMapView: Google Maps API loaded successfully');
        
        if (!mapRef.current) {
          console.error('GoogleMapView: Map ref is null');
          setError('Map container not available');
          setIsLoading(false);
          return;
        }

        console.log('GoogleMapView: Creating map instance...');
        // Default center (Chennai area based on your coordinates)
        const center = { lat: 13.0827, lng: 80.2707 };

        mapInstance.current = new google.maps.Map(mapRef.current, {
          zoom: 11,
          center,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        console.log('GoogleMapView: Map created successfully');
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Google Maps loading error:', error);
        setError(`Failed to load Google Maps: ${error.message || error}`);
        setIsLoading(false);
      });
  }, []);

  // Add markers when map is loaded and data changes
  useEffect(() => {
    console.log('GoogleMapView: Adding markers, isLoaded:', isLoaded, 'mapInstance:', !!mapInstance.current);
    console.log('GoogleMapView: Shelters data:', shelters.length, 'shelters');
    
    if (!isLoaded || !mapInstance.current) {
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoordinates = false;

    // Add shelter markers
    shelters.forEach((shelter, index) => {
      const lat = Number(shelter.lat);
      const lng = Number(shelter.lng);

      console.log(`GoogleMapView: Processing shelter ${index}: ${shelter.name}, lat: ${lat}, lng: ${lng}`);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`GoogleMapView: Invalid coordinates for shelter ${shelter.name}`);
        return;
      }

      hasValidCoordinates = true;
      const position = { lat, lng };
      bounds.extend(position);

      const occupancyRatio = shelter.occupancy / shelter.capacity;
      let color = '#22c55e'; // Green - available
      if (occupancyRatio > 0.8) {
        color = '#ef4444'; // Red - near capacity
      } else if (occupancyRatio > 0.6) {
        color = '#f59e0b'; // Yellow - moderate
      }

      // Custom marker icon
      const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      };

      const marker = new google.maps.Marker({
        position,
        map: mapInstance.current,
        title: shelter.name,
        icon: markerIcon,
      });

      // Info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${shelter.name}</h3>
            <p style="margin: 4px 0; font-size: 14px;">
              <strong>Capacity:</strong> ${shelter.occupancy}/${shelter.capacity} 
              <span style="color: ${color};">●</span>
            </p>
            <p style="margin: 4px 0; font-size: 14px;">
              <strong>Available:</strong> ${shelter.capacity - shelter.occupancy} beds
            </p>
            <p style="margin: 4px 0; font-size: 14px;">
              <strong>Features:</strong> ${shelter.features || 'None specified'}
            </p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker);
        onShelterClick?.(shelter);
      });

      markersRef.current.push(marker);
    });

    // Add request markers
    requests.filter(r => r.status === 'pending').forEach((request) => {
      const lat = Number(request.lat);
      const lng = Number(request.lng);

      if (isNaN(lat) || isNaN(lng)) {
        return;
      }

      hasValidCoordinates = true;
      const position = { lat, lng };
      bounds.extend(position);

      const markerIcon = {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 8,
        fillColor: '#f97316', // Orange
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      };

      const marker = new google.maps.Marker({
        position,
        map: mapInstance.current,
        title: `Request: ${request.name}`,
        icon: markerIcon,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Pending Request</h3>
            <p style="margin: 4px 0; font-size: 14px;">
              <strong>Name:</strong> ${request.name}
            </p>
            <p style="margin: 4px 0; font-size: 14px; color: #f97316;">
              <strong>Status:</strong> Awaiting assignment
            </p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (hasValidCoordinates && markersRef.current.length > 0) {
      mapInstance.current.fitBounds(bounds);
      
      // Don't zoom in too much for single markers
      google.maps.event.addListenerOnce(mapInstance.current, 'bounds_changed', () => {
        const zoom = mapInstance.current?.getZoom();
        if (zoom && zoom > 15) {
          mapInstance.current?.setZoom(15);
        }
      });
    }
  }, [isLoaded, shelters, requests, onShelterClick]);

  if (isLoading) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-slate-600">Loading Google Maps...</p>
          <p className="text-xs text-slate-500 mt-2">
            API Key: {config.googleMapsApiKey ? '✅ Present' : '❌ Missing'}
          </p>
          <p className="text-xs text-slate-500">
            Check browser console for details
          </p>
          <div className="mt-4">
            <button 
              onClick={() => {
                setError('Loading timed out. This might be due to API key restrictions or network issues.');
                setIsLoading(false);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Show fallback view if loading takes too long
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-red-50 to-slate-100 rounded-lg border border-red-200">
        <div className="text-center p-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Google Maps Unavailable</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          
          {/* Fallback to simple coordinates list */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-slate-700 mb-3">Shelter Locations</h4>
            <div className="max-h-48 overflow-y-auto">
              {shelters.map((shelter) => {
                const occupancyRatio = shelter.occupancy / shelter.capacity;
                const statusColor = occupancyRatio > 0.8 ? 'text-red-600' : 
                                   occupancyRatio > 0.6 ? 'text-yellow-600' : 'text-green-600';
                return (
                  <div key={shelter.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <div className="text-left">
                      <div className="font-medium text-sm text-slate-900">{shelter.name}</div>
                      <div className="text-xs text-slate-500">
                        {Number(shelter.lat).toFixed(4)}, {Number(shelter.lng).toFixed(4)}
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${statusColor}`}>
                      {shelter.occupancy}/{shelter.capacity}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="bg-white p-3 rounded border">
              <MapPin className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-slate-900">{shelters.length}</div>
              <div className="text-xs text-slate-600">Total Shelters</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <Users className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-slate-900">
                {shelters.reduce((sum, s) => sum + (s.capacity - s.occupancy), 0)}
              </div>
              <div className="text-xs text-slate-600">Available Beds</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border border-slate-200">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-lg border border-slate-200 z-10">
        <h3 className="text-xs font-semibold text-slate-700 mb-2">Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Available (&lt;60%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>Moderate (60-80%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Near capacity (&gt;80%)</span>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="w-3 h-3 text-orange-500 mr-2" />
            <span>Pending requests</span>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg border border-slate-200">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-blue-600 mr-1" />
            <span>{shelters.length} shelters</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 text-green-600 mr-1" />
            <span>{shelters.reduce((sum, s) => sum + (s.capacity - s.occupancy), 0)} available</span>
          </div>
          {requests.length > 0 && (
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-orange-600 mr-1" />
              <span>{requests.filter(r => r.status === 'pending').length} pending</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
