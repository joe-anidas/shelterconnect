import React from 'react';
import { MapPin, Users, AlertTriangle } from 'lucide-react';

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

interface MapViewProps {
  shelters: Shelter[];
  requests?: Request[];
  onShelterClick?: (shelter: Shelter) => void;
}

export default function MapView({ shelters, requests = [], onShelterClick }: MapViewProps) {
  // Enhanced coordinate-based map visualization with satellite-style background
  
  // Convert string coordinates to numbers and filter out invalid ones
  const validShelters = shelters.filter(s => s.lat != null && s.lng != null);
  const validRequests = requests.filter(r => r.lat != null && r.lng != null);
  
  const shelterLats = validShelters.map(s => Number(s.lat)).filter(lat => !isNaN(lat));
  const shelterLngs = validShelters.map(s => Number(s.lng)).filter(lng => !isNaN(lng));
  const requestLats = validRequests.map(r => Number(r.lat)).filter(lat => !isNaN(lat));
  const requestLngs = validRequests.map(r => Number(r.lng)).filter(lng => !isNaN(lng));
  
  // Combine all valid coordinates
  const allLats = [...shelterLats, ...requestLats];
  const allLngs = [...shelterLngs, ...requestLngs];
  
  // Default to Chennai, India if no valid coordinates
  const mapBounds = allLats.length > 0 && allLngs.length > 0 ? {
    minLat: Math.min(...allLats) - 0.05,
    maxLat: Math.max(...allLats) + 0.05,
    minLng: Math.min(...allLngs) - 0.05,
    maxLng: Math.max(...allLngs) + 0.05,
  } : {
    minLat: 12.8,  // South Chennai
    maxLat: 13.2,  // North Chennai
    minLng: 80.0,  // West Chennai
    maxLng: 80.4,  // East Chennai (Bay of Bengal)
  };

  const normalizePosition = (lat: number, lng: number) => {
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const getShelterColor = (occupancyRatio: number) => {
    if (occupancyRatio > 0.8) {
      return 'bg-red-500 border-red-600';
    }
    if (occupancyRatio > 0.6) {
      return 'bg-yellow-500 border-yellow-600';
    }
    return 'bg-green-500 border-green-600';
  };

  return (
    <div className="relative w-full h-[500px] bg-gray-200 rounded-lg border border-slate-300 overflow-hidden shadow-lg">
      {/* India Map Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/8/84/India-map.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Road Map Grid Lines */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />
      
      {/* Map Title */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-80 p-2 rounded-md shadow">
        <h3 className="font-bold text-lg text-slate-800">Shelter Map - Chennai Area</h3>
      </div>

      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-sm border border-slate-200 z-10">
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

      {/* Shelters */}
      {shelters.map((shelter) => {
        const lat = Number(shelter.lat);
        const lng = Number(shelter.lng);
        
        // Skip shelters with invalid coordinates
        if (isNaN(lat) || isNaN(lng)) {
          return null;
        }
        
        const position = normalizePosition(lat, lng);
        const occupancyRatio = shelter.occupancy / shelter.capacity;
        const colorClass = getShelterColor(occupancyRatio);

        return (
          <div
            key={shelter.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group`}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            onClick={() => onShelterClick?.(shelter)}
          >
            {/* Shelter Pin */}
            <div className={`w-6 h-6 rounded-full border-2 ${colorClass} shadow-lg transition-all duration-200 group-hover:scale-110`}>
              <MapPin className="w-full h-full text-white p-1" />
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
              <div className="font-semibold">{shelter.name}</div>
              <div>{shelter.occupancy}/{shelter.capacity} occupied</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
            </div>
          </div>
        );
      })}

      {/* Pending Requests */}
      {requests.filter(r => r.status === 'pending').map((request) => {
        const lat = Number(request.lat);
        const lng = Number(request.lng);
        
        if (isNaN(lat) || isNaN(lng)) {
          return null;
        }
        
        const position = normalizePosition(lat, lng);

        return (
          <div
            key={request.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
          >
            {/* Request Pin */}
            <div className="w-4 h-4 bg-orange-500 border-2 border-orange-600 rounded-full shadow-lg animate-pulse">
              <AlertTriangle className="w-full h-full text-white p-0.5" />
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-orange-900 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
              <div className="font-semibold">{request.name}</div>
              <div>Pending assignment</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-orange-900"></div>
            </div>
          </div>
        );
      })}

      {/* Stats Overlay */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-sm border border-slate-200">
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