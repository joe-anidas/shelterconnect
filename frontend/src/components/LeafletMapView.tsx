import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers not showing up in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetinaIcon from 'leaflet/dist/images/marker-icon-2x.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
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

interface LeafletMapViewProps {
  shelters: Shelter[];
  requests?: Request[];
  onShelterClick?: (shelter: Shelter) => void;
}

// Component to fit map bounds to markers
function FitBounds({ positions }: { positions: LatLngExpression[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions as [number, number][], { padding: [20, 20] });
    }
  }, [map, positions]);
  
  return null;
}

export default function LeafletMapView({ shelters, requests = [], onShelterClick }: LeafletMapViewProps) {
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

  // Create positions array for bounds fitting
  const allPositions: LatLngExpression[] = [
    ...validShelters.map(s => [s.lat, s.lng] as LatLngExpression),
    ...validRequests.map(r => [r.lat, r.lng] as LatLngExpression)
  ];

  // Default center (Chennai, India) if no valid coordinates
  const defaultCenter: LatLngExpression = [13.0827, 80.2707];
  const center = allPositions.length > 0 ? allPositions[0] : defaultCenter;

  // Create custom icons for different marker types
  const shelterIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTUiIGZpbGw9IiMxZDRlZDgiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Im0xMiA5IDQgMTAtNCAxMC00LTEwIDQtMTB6IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  const requestIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTUiIGZpbGw9IiNlZjQ0NDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTIiIHI9IjMiIGZpbGw9IiNmZmYiLz4KPHJlY3QgeD0iMTQiIHk9IjE3IiB3aWR0aD0iNCIgaGVpZ2h0PSI4IiByeD0iMiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const ratio = occupancy / capacity;
    if (ratio >= 0.9) { return '#ef4444'; } // red
    if (ratio >= 0.7) { return '#f59e0b'; } // amber
    return '#10b981'; // green
  };

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-200">
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Fit bounds to show all markers */}
        <FitBounds positions={allPositions} />
        
        {/* Shelter markers */}
        {validShelters.map((shelter) => (
          <Marker
            key={`shelter-${shelter.id}`}
            position={[shelter.lat, shelter.lng]}
            icon={shelterIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-2">{shelter.name}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-medium">{shelter.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Occupancy:</span>
                    <span className="font-medium" style={{ color: getOccupancyColor(shelter.occupancy, shelter.capacity) }}>
                      {shelter.occupancy} ({Math.round((shelter.occupancy / shelter.capacity) * 100)}%)
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-600">Features:</span>
                    <div className="text-xs mt-1">{shelter.features}</div>
                  </div>
                </div>
                {onShelterClick && (
                  <button
                    onClick={() => onShelterClick(shelter)}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 w-full"
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Request markers */}
        {validRequests.map((request) => (
          <Marker
            key={`request-${request.id}`}
            position={[request.lat, request.lng]}
            icon={requestIcon}
          >
            <Popup>
              <div className="p-2 min-w-[180px]">
                <h3 className="font-bold text-lg mb-2">{request.name}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium px-2 py-1 rounded text-xs ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'assigned' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
