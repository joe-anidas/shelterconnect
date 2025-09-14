import React from 'react';
import { MapPin, Users, Shield, Clock } from 'lucide-react';

interface Shelter {
  id: number;
  name: string;
  capacity: number;
  occupancy: number;
  features: string;
  address?: string;
  distance?: string;
  eta?: string;
  lat?: number;
  lng?: number;
}

interface ShelterCardProps {
  shelter: Shelter;
  onClick: (shelter: Shelter) => void;
  showDistance?: boolean;
  compact?: boolean;
}

export default function ShelterCard({ shelter, onClick, showDistance = false, compact = false }: ShelterCardProps) {
  const occupancyRatio = shelter.capacity ? (shelter.occupancy / shelter.capacity) : 0;
  const occupancyPercent = Math.round(occupancyRatio * 100);
  
  const getStatusColor = (ratio: number) => {
    if (ratio > 0.8) return { bg: 'bg-red-500', text: 'text-red-600', label: 'Near Capacity' };
    if (ratio > 0.6) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Moderate' };
    return { bg: 'bg-green-500', text: 'text-green-600', label: 'Available' };
  };

  const status = getStatusColor(occupancyRatio);
  const features = shelter.features.split(',').map(f => f.trim()).filter(f => f.length > 0);

  if (compact) {
    return (
      <div 
        onClick={() => onClick(shelter)}
        className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-slate-900">{shelter.name}</h3>
          <div className={`w-3 h-3 rounded-full ${status.bg}`}></div>
        </div>
        
        <div className="text-sm text-slate-600 mb-2">
          {shelter.occupancy}/{shelter.capacity} occupied
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className={`${status.bg} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(shelter)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{shelter.name}</h3>
          {shelter.address && (
            <div className="flex items-center text-sm text-slate-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{shelter.address}</span>
            </div>
          )}
        </div>
        
        <div className={`px-2 py-1 text-xs font-medium rounded-full ${status.text} bg-opacity-10`} style={{backgroundColor: status.bg.replace('bg-', '').replace('-500', '') + '20'}}>
          {status.label}
        </div>
      </div>

      {/* Occupancy */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-sm font-medium text-slate-700">
            <Users className="h-4 w-4 mr-1" />
            Occupancy
          </div>
          <div className="text-sm text-slate-600">
            {shelter.occupancy}/{shelter.capacity}
          </div>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className={`${status.bg} h-3 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
          />
        </div>
        
        <div className="mt-1 text-xs text-slate-500">
          {occupancyPercent}% occupied • {shelter.capacity - shelter.occupancy} spaces available
        </div>
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center text-sm font-medium text-slate-700 mb-2">
            <Shield className="h-4 w-4 mr-1" />
            Features
          </div>
          <div className="flex flex-wrap gap-1">
            {features.map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Distance & ETA */}
      {showDistance && (shelter.distance || shelter.eta) && (
        <div className="pt-4 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {shelter.distance && (
              <div className="flex items-center text-slate-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{shelter.distance}</span>
              </div>
            )}
            {shelter.eta && (
              <div className="flex items-center text-slate-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>{shelter.eta}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}