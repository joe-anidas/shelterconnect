import React, { useState } from 'react';
import { Plus, Edit3, Trash2, MapPin, Users, Settings } from 'lucide-react';
import ShelterCard from '../components/ShelterCard';
import { mockShelters } from '../data/mockData';

export default function SheltersPage() {
  const [shelters, setShelters] = useState(mockShelters);
  const [editingShelter, setEditingShelter] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleOccupancyUpdate = (shelterId: number, newOccupancy: number) => {
    setShelters(prev => prev.map(shelter => 
      shelter.id === shelterId 
        ? { ...shelter, occupancy: Math.max(0, Math.min(newOccupancy, shelter.capacity)) }
        : shelter
    ));
  };

  const QuickOccupancyControls = ({ shelter }) => (
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
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Shelter Management</h1>
          <p className="text-slate-600">Manage shelter information and occupancy levels</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Shelter
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-slate-900">{shelters.length}</div>
          <div className="text-sm text-slate-600">Total Shelters</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {shelters.reduce((sum, s) => sum + s.capacity, 0)}
          </div>
          <div className="text-sm text-slate-600">Total Capacity</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">
            {shelters.reduce((sum, s) => sum + s.occupancy, 0)}
          </div>
          <div className="text-sm text-slate-600">Current Occupancy</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-red-600">
            {shelters.filter(s => s.occupancy / s.capacity > 0.8).length}
          </div>
          <div className="text-sm text-slate-600">Near Capacity</div>
        </div>
      </div>

      {/* Demo Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Demo Instructions</h3>
        <p className="text-blue-800 text-sm mb-2">
          Use the quick update controls to simulate occupancy changes during your demo:
        </p>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Click "+5" or "-5" to adjust occupancy</li>
          <li>• Click "85%" to set a shelter to near-capacity (triggers rebalancing alerts)</li>
          <li>• Use the number input for precise control</li>
          <li>• Watch the dashboard update in real-time when occupancy changes</li>
        </ul>
      </div>

      {/* Shelters Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shelters.map((shelter) => (
          <div key={shelter.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{shelter.name}</h3>
                <div className="flex items-center text-sm text-slate-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{shelter.address}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 text-slate-400 hover:text-slate-600">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button className="p-1 text-slate-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Capacity Info */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Occupancy</span>
                <span className="text-sm text-slate-600">
                  {shelter.occupancy}/{shelter.capacity}
                </span>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    shelter.occupancy / shelter.capacity > 0.8
                      ? 'bg-red-500'
                      : shelter.occupancy / shelter.capacity > 0.6
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((shelter.occupancy / shelter.capacity) * 100, 100)}%` }}
                />
              </div>
              
              <div className="text-xs text-slate-500 mt-1">
                {Math.round((shelter.occupancy / shelter.capacity) * 100)}% occupied
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <div className="text-sm font-medium text-slate-700 mb-2">Features</div>
              <div className="flex flex-wrap gap-1">
                {shelter.features.split(',').map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                  >
                    {feature.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Controls for Demo */}
            <QuickOccupancyControls shelter={shelter} />

            {/* Status Badge */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                  shelter.occupancy / shelter.capacity > 0.8
                    ? 'bg-red-100 text-red-800'
                    : shelter.occupancy / shelter.capacity > 0.6
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {shelter.occupancy / shelter.capacity > 0.8
                    ? 'Near Capacity'
                    : shelter.occupancy / shelter.capacity > 0.6
                    ? 'Moderate'
                    : 'Available'
                  }
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}