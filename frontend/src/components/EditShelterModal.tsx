import { useState, useEffect } from 'react';
import { X, MapPin, Users, Home, Accessibility, Heart, Utensils } from 'lucide-react';

interface Shelter {
  id: number;
  name: string;
  address: string;
  capacity: number;
  occupancy: number;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  features: string;
  description?: string;
}

interface EditShelterModalProps {
  isOpen: boolean;
  shelter: Shelter | null;
  onClose: () => void;
  onSubmit: (shelterData: any) => void;
}

export default function EditShelterModal({ isOpen, shelter, onClose, onSubmit }: EditShelterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: '',
    occupancy: '',
    lat: '',
    lng: '',
    phone: '',
    email: '',
    features: [] as string[],
    description: ''
  });

  const availableFeatures = [
    { id: 'medical', label: '🏥 Medical Facilities', icon: Heart },
    { id: 'wheelchair', label: '♿ Wheelchair Accessible', icon: Accessibility },
    { id: 'food', label: '🍽️ Food Services', icon: Utensils },
    { id: 'families', label: '👨‍👩‍👧‍👦 Family Rooms', icon: Users },
    { id: 'pets', label: '🐕 Pet Friendly', icon: Home },
    { id: 'children', label: '🧒 Child Care', icon: Users },
    { id: 'elderly', label: '👴 Elderly Care', icon: Heart },
    { id: 'mental_health', label: '🧠 Mental Health Support', icon: Heart }
  ];

  useEffect(() => {
    if (shelter && isOpen) {
      setFormData({
        name: shelter.name,
        address: shelter.address,
        capacity: shelter.capacity.toString(),
        occupancy: shelter.occupancy.toString(),
        lat: shelter.lat.toString(),
        lng: shelter.lng.toString(),
        phone: shelter.phone || '',
        email: shelter.email || '',
        features: shelter.features ? shelter.features.split(',').map(f => f.trim()) : [],
        description: shelter.description || ''
      });
    }
  }, [shelter, isOpen]);

  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shelter) {
      return;
    }
    
    onSubmit({
      id: shelter.id,
      ...formData,
      capacity: parseInt(formData.capacity),
      occupancy: parseInt(formData.occupancy),
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      features: formData.features.join(',')
    });
  };

  if (!isOpen || !shelter) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 pt-20 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">✏️ Edit Shelter</h2>
              <p className="text-blue-100">Update shelter information and settings</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 bg-white bg-opacity-20 rounded-full p-2 transition-all duration-200 hover:bg-opacity-30"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form id="edit-shelter-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📋 Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Home className="inline h-4 w-4 mr-1" />
                  Shelter Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Community Emergency Shelter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Address *
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="123 Main Street, City, State, ZIP"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="inline h-4 w-4 mr-1" />
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Occupancy
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.occupancy}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupancy: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.lat}
                    onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="40.7128"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.lng}
                    onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="-74.0060"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📞 Contact Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="contact@shelter.org"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Additional information about this shelter..."
                  rows={4}
                />
              </div>

              {/* Occupancy Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">📊 Occupancy Status</h4>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Current Status</span>
                  <span className={`font-semibold ${
                    parseInt(formData.occupancy) / parseInt(formData.capacity) >= 0.9 ? 'text-red-600' : 
                    parseInt(formData.occupancy) / parseInt(formData.capacity) >= 0.7 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {formData.occupancy}/{formData.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      parseInt(formData.occupancy) / parseInt(formData.capacity) >= 0.9 ? 'bg-red-500' : 
                      parseInt(formData.occupancy) / parseInt(formData.capacity) >= 0.7 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min((parseInt(formData.occupancy) / parseInt(formData.capacity)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">🏥 Available Features & Services</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableFeatures.map((feature) => {
                const Icon = feature.icon;
                const isSelected = formData.features.includes(feature.id);
                
                return (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => handleFeatureToggle(feature.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className="text-sm font-medium">{feature.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </form>
        
        {/* Footer - Fixed at bottom */}
        <div className="bg-white border-t border-gray-200 p-6 flex-shrink-0">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-shelter-form"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              💾 Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}