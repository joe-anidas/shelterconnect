import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, MapPin, Users, Settings, Shield } from 'lucide-react';
import { getShelters, createShelter, updateShelter, updateShelterOccupancy, deleteShelter, type Shelter } from '../services/shelters';

export default function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('sc_is_admin') === 'true');

  // Load shelters on mount and sync admin state with navbar/dashboard
  useEffect(() => {
    loadShelters();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sc_is_admin') {
        setIsAdmin(localStorage.getItem('sc_is_admin') === 'true');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const loadShelters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getShelters();
      setShelters(data);
    } catch (err) {
      setError('Failed to load shelters');
      console.error('Error loading shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOccupancyUpdate = async (shelterId: number, newOccupancy: number) => {
    try {
      const shelter = shelters.find(s => s.id === shelterId);
      if (!shelter) {
        return;
      }

      const clampedOccupancy = Math.max(0, Math.min(newOccupancy, shelter.capacity));
      
      // Update database
      await updateShelterOccupancy(shelterId, clampedOccupancy);
      
      // Update local state
      setShelters(prev => prev.map(shelter => 
        shelter.id === shelterId 
          ? { ...shelter, occupancy: clampedOccupancy }
          : shelter
      ));
    } catch (err) {
      setError('Failed to update occupancy');
      console.error('Error updating occupancy:', err);
    }
  };

  const handleDeleteShelter = async (shelterId: number) => {
    if (!confirm('Are you sure you want to delete this shelter? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteShelter(shelterId);
      setShelters(prev => prev.filter(shelter => shelter.id !== shelterId));
    } catch (err) {
      setError('Failed to delete shelter');
      console.error('Error deleting shelter:', err);
    }
  };

  const handleAddShelter = async (shelterData: Omit<Shelter, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newShelter = await createShelter(shelterData);
      setShelters(prev => [...prev, newShelter]);
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to create shelter');
      console.error('Error creating shelter:', err);
    }
  };

  const handleEditShelter = async (shelterData: Omit<Shelter, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingShelter) {
      return;
    }

    try {
      await updateShelter(editingShelter.id, shelterData);
      setShelters(prev => prev.map(shelter => 
        shelter.id === editingShelter.id 
          ? { ...shelter, ...shelterData }
          : shelter
      ));
      setEditingShelter(null);
    } catch (err) {
      setError('Failed to update shelter');
      console.error('Error updating shelter:', err);
    }
  };

  // Form components
  const AddShelterForm = ({ onSubmit, onCancel }: {
    onSubmit: (data: Omit<Shelter, 'id' | 'created_at' | 'updated_at'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: '',
      capacity: 0,
      occupancy: 0,
      features: [] as string[],
      address: '',
      lat: 0,
      lng: 0,
      phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableFeatures = [
      { id: 'medical', label: 'Medical Facilities', icon: '🏥' },
      { id: 'wheelchair', label: 'Wheelchair Accessible', icon: '♿' },
      { id: 'child-friendly', label: 'Child Friendly', icon: '👶' },
      { id: 'pet-friendly', label: 'Pet Friendly', icon: '🐕' },
      { id: 'elderly-care', label: 'Elderly Care', icon: '👴' },
      { id: 'mental-health', label: 'Mental Health Support', icon: '🧠' },
      { id: 'family-rooms', label: 'Family Rooms', icon: '👨‍👩‍👧‍👦' },
      { id: 'security', label: '24/7 Security', icon: '🔒' }
    ];

    const handleFeatureToggle = (featureId: string) => {
      setFormData(prev => ({
        ...prev,
        features: prev.features.includes(featureId)
          ? prev.features.filter(f => f !== featureId)
          : [...prev.features, featureId]
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit({
          ...formData,
          features: formData.features.join(',')
        });
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-indigo-600" />
            Basic Information
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shelter Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter shelter name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Capacity *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                    placeholder="100"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Occupancy
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={formData.occupancy || ''}
                    onChange={(e) => setFormData({...formData, occupancy: parseInt(e.target.value) || 0})}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
            Location
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter full address"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lat || ''}
                  onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value) || 0})}
                  placeholder="13.0827"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lng || ''}
                  onChange={(e) => setFormData({...formData, lng: parseFloat(e.target.value) || 0})}
                  placeholder="80.2707"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Features Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-indigo-600" />
            Contact & Features
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Features
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableFeatures.map((feature) => (
                  <label
                    key={feature.id}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.features.includes(feature.id)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature.id)}
                      onChange={() => handleFeatureToggle(feature.id)}
                      className="sr-only"
                    />
                    <span className="text-lg mr-2">{feature.icon}</span>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Shelter
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

  const EditShelterForm = ({ shelter, onSubmit, onCancel }: {
    shelter: Shelter;
    onSubmit: (data: Omit<Shelter, 'id' | 'created_at' | 'updated_at'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: shelter.name,
      capacity: shelter.capacity,
      occupancy: shelter.occupancy,
      features: shelter.features.split(',').filter(f => f.trim()),
      address: shelter.address,
      lat: shelter.lat,
      lng: shelter.lng,
      phone: shelter.phone
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableFeatures = [
      { id: 'medical', label: 'Medical Facilities', icon: '🏥' },
      { id: 'wheelchair', label: 'Wheelchair Accessible', icon: '♿' },
      { id: 'child-friendly', label: 'Child Friendly', icon: '👶' },
      { id: 'pet-friendly', label: 'Pet Friendly', icon: '🐕' },
      { id: 'elderly-care', label: 'Elderly Care', icon: '👴' },
      { id: 'mental-health', label: 'Mental Health Support', icon: '🧠' },
      { id: 'family-rooms', label: 'Family Rooms', icon: '👨‍👩‍👧‍👦' },
      { id: 'security', label: '24/7 Security', icon: '🔒' }
    ];

    const handleFeatureToggle = (featureId: string) => {
      setFormData(prev => ({
        ...prev,
        features: prev.features.includes(featureId)
          ? prev.features.filter(f => f !== featureId)
          : [...prev.features, featureId]
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit({
          ...formData,
          features: formData.features.join(',')
        });
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-indigo-600" />
            Basic Information
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shelter Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter shelter name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Capacity *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Occupancy
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={formData.occupancy}
                    onChange={(e) => setFormData({...formData, occupancy: parseInt(e.target.value) || 0})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
            Location
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lat}
                  onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lng}
                  onChange={(e) => setFormData({...formData, lng: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Features Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-indigo-600" />
            Contact & Features
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Features
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableFeatures.map((feature) => (
                  <label
                    key={feature.id}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.features.includes(feature.id)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature.id)}
                      onChange={() => handleFeatureToggle(feature.id)}
                      className="sr-only"
                    />
                    <span className="text-lg mr-2">{feature.icon}</span>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Update Shelter
              </>
            )}
          </button>
        </div>
      </form>
    );
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-slate-600">Loading shelters...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 text-red-700 rounded-2xl shadow-sm">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-4 text-red-500 hover:text-red-700 font-bold text-lg"
            >
              ×
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
              <Shield className="h-4 w-4 mr-2" />
              Emergency Shelter Management
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
              Shelter Network
            </h1>
            <p className="text-xl text-slate-600">Live overview of shelter status and locations across the region</p>
          </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Plus size={20} className="mr-2" />
              Add New Shelter
            </button>
          )}
        </div>
      </div>

      {/* Add Shelter Form Modal (admin only) */}
      {isAdmin && showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[10000] flex items-center justify-center p-4 pt-20">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Plus className="h-6 w-6 mr-3 text-indigo-600" />
                  Add New Shelter
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <AddShelterForm 
                onSubmit={handleAddShelter}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* No local login modal; admin state is shared via navbar login */}

      {/* Edit Shelter Form Modal */}
      {editingShelter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[10000] flex items-center justify-center p-4 pt-20">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Edit3 className="h-6 w-6 mr-3 text-indigo-600" />
                  Edit Shelter
                </h3>
                <button
                  onClick={() => setEditingShelter(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <EditShelterForm 
                shelter={editingShelter}
                onSubmit={handleEditShelter}
                onCancel={() => setEditingShelter(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Shelter List */}
      <div className="w-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Shelter Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shelters.map(shelter => (
              <div key={shelter.id} className="bg-white p-5 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow h-fit">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{shelter.name}</h3>
                    <p className="text-sm text-slate-500 flex items-center mt-1">
                      <MapPin size={14} className="mr-1.5" /> {shelter.address}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setEditingShelter(shelter)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteShelter(shelter.id)} 
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
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
                
                {isAdmin && <QuickOccupancyControls shelter={shelter} />}
                
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