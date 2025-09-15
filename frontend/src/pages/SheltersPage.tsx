import { useState } from 'react';
import { Plus, Edit3, Trash2, MapPin, Users, Settings } from 'lucide-react';
import MapView from '../components/MapView';
import { mockShelters, mockRequests } from '../data/mockData';

// Define the type for a shelter object to match mockData.ts
interface Shelter {
  id: number;
  name: string;
  capacity: number;
  occupancy: number;
  features: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
}

export default function SheltersPage() {
  const [shelters, setShelters] = useState(mockShelters);
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleOccupancyUpdate = (shelterId: number, newOccupancy: number) => {
    setShelters(prev => prev.map(shelter => 
      shelter.id === shelterId 
        ? { ...shelter, occupancy: Math.max(0, Math.min(newOccupancy, shelter.capacity)) }
        : shelter
    ));
  };

  const QuickOccupancyControls = ({ shelter }: { shelter: Shelter }) => (
    <div className="flex items-center space-x-2 mt-3">
      <span className="text-xs text-slate-500">Quick update:</span>
      <button
        onClick={() => handleOccupancyUpdate(shelter.id, shelter.occupancy - 5)}
        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
      >
        -5
      </button>
      <button
        onClick={() => handleOccupancyUpdate(shelter.id, shelter.occupancy + 5)}
        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
      >
        +5
      </button>
      <button
        onClick={() => handleOccupancyUpdate(shelter.id, Math.round(shelter.capacity * 0.85))}
        className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
      >
        85%
      </button>
      <input
        type="number"
        value={shelter.occupancy}
        onChange={(e) => handleOccupancyUpdate(shelter.id, parseInt(e.target.value) || 0)}
        className="w-16 px-1 py-1 text-xs border rounded"
        min="0"
        max={shelter.capacity}
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Shelter Network</h1>
          <p className="mt-2 text-lg text-slate-600">Live overview of shelter status and locations.</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
        >
          <Plus size={20} className="mr-2" />
          Add New Shelter
        </button>
      </div>

      {/* Main Content: Map and Shelter List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map View Column */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Geographic Overview</h2>
          <MapView shelters={shelters} requests={mockRequests} />
        </div>

        {/* Shelter List Column */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Shelter Details</h2>
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
            {shelters.map(shelter => (
              <div key={shelter.id} className="bg-white p-5 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{shelter.name}</h3>
                    <p className="text-sm text-slate-500 flex items-center mt-1">
                      <MapPin size={14} className="mr-1.5" /> {shelter.address}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setEditingShelter(shelter)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <Edit3 size={18} />
                    </button>
                    <button className="text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Users size={16} className="text-slate-500 mr-2" />
                    <span className="text-lg font-semibold text-slate-700">{shelter.occupancy}</span>
                    <span className="text-sm text-slate-500"> / {shelter.capacity}</span>
                  </div>
                  <div className="w-1/2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 ml-4">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${(shelter.occupancy / shelter.capacity) * 100}%`,
                        backgroundColor: shelter.occupancy / shelter.capacity > 0.8 ? '#ef4444' : '#22c55e'
                      }}
                    ></div>
                  </div>
                </div>
                
                <QuickOccupancyControls shelter={shelter} />
                
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="text-sm font-medium text-slate-600 flex items-center">
                    <Settings size={14} className="mr-2" /> Special Features: {shelter.features.split(',').join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}