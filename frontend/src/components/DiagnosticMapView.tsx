import { useEffect, useRef, useState } from 'react';
import { MapPin, Users, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
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

interface DiagnosticMapViewProps {
  shelters: Shelter[];
  requests?: Request[];
  onShelterClick?: (shelter: Shelter) => void;
}

export default function DiagnosticMapView({ shelters, requests = [], onShelterClick }: DiagnosticMapViewProps) {
  const [diagnostics, setDiagnostics] = useState({
    apiKey: false,
    apiLoaded: false,
    mapCreated: false,
    markersAdded: false,
    errors: [] as string[]
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      const newDiagnostics = {
        apiKey: false,
        apiLoaded: false,
        mapCreated: false,
        markersAdded: false,
        errors: [] as string[]
      };

      // Check API Key
      if (config.googleMapsApiKey) {
        newDiagnostics.apiKey = true;
      } else {
        newDiagnostics.errors.push('Google Maps API key not found in environment variables');
      }

      // Test API connectivity
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Chennai&key=${config.googleMapsApiKey}`);
        const data = await response.json();
        
        if (data.status === 'OK') {
          newDiagnostics.apiLoaded = true;
        } else {
          newDiagnostics.errors.push(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        }
      } catch (error) {
        newDiagnostics.errors.push(`Network error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }

      // Check data
      if (shelters.length === 0) {
        newDiagnostics.errors.push('No shelter data available');
      } else {
        const validShelters = shelters.filter(s => !isNaN(Number(s.lat)) && !isNaN(Number(s.lng)));
        if (validShelters.length === 0) {
          newDiagnostics.errors.push('No shelters have valid coordinates');
        } else {
          newDiagnostics.markersAdded = true;
        }
      }

      setDiagnostics(newDiagnostics);
    };

    runDiagnostics();
  }, [shelters]);

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg border border-slate-200 p-6">
      <div className="text-center mb-6">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Google Maps Diagnostics</h3>
        <p className="text-sm text-slate-600">Checking Google Maps integration status...</p>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <h4 className="font-semibold text-slate-700 mb-3">System Checks</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>API Key Present</span>
            {getStatusIcon(diagnostics.apiKey)}
          </div>
          <div className="flex items-center justify-between">
            <span>Google Maps API Accessible</span>
            {getStatusIcon(diagnostics.apiLoaded)}
          </div>
          <div className="flex items-center justify-between">
            <span>Shelter Data Available</span>
            {getStatusIcon(diagnostics.markersAdded)}
          </div>
        </div>
      </div>

      {diagnostics.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-red-700 mb-2">Issues Found</h4>
          <ul className="text-sm text-red-600 space-y-1">
            {diagnostics.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-700 mb-2">Troubleshooting Steps</h4>
        <ol className="text-sm text-blue-600 space-y-1 list-decimal list-inside">
          <li>Verify Google Maps JavaScript API is enabled in Google Cloud Console</li>
          <li>Check API key restrictions (HTTP referrers, IP restrictions)</li>
          <li>Ensure billing is enabled for the Google Cloud project</li>
          <li>Check browser console for detailed error messages</li>
          <li>Verify API key has sufficient quota remaining</li>
        </ol>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="font-semibold text-slate-700 mb-3">Data Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <MapPin className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-slate-900">{shelters.length}</div>
            <div className="text-xs text-slate-600">Total Shelters</div>
          </div>
          <div>
            <Users className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-slate-900">
              {shelters.reduce((sum, s) => sum + (s.capacity - s.occupancy), 0)}
            </div>
            <div className="text-xs text-slate-600">Available Beds</div>
          </div>
          <div>
            <AlertTriangle className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-slate-900">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-xs text-slate-600">Pending Requests</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          API Key: {config.googleMapsApiKey ? 
            `${config.googleMapsApiKey.substring(0, 10)}...` : 
            'Not configured'
          }
        </p>
      </div>
    </div>
  );
}
