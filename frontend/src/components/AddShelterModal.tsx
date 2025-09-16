import { useState } from 'react';
import { X, MapPin, Users, Home, Accessibility, Heart, Utensils } from 'lucide-react';

interface AddShelterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shelterData: any) => void;
}

export default function AddShelterModal({ isOpen, onClose, onSubmit }: AddShelterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: '',
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
    onSubmit({
      ...formData,
      capacity: parseInt(formData.capacity),
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      features: formData.features.join(','),
      occupancy: 0
    });
    
    // Reset form
    setFormData({
      name: '',
      address: '',
      capacity: '',
      lat: '',
      lng: '',
      phone: '',
      email: '',
      features: [],
      description: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 pt-20 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">🏢 Add New Shelter</h2>
              <p className="text-green-100">Create a new emergency shelter facility</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 bg-white bg-opacity-20 rounded-full p-2 transition-all duration-200 hover:bg-opacity-30"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form id="add-shelter-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="123 Main Street, City, State, ZIP"
                  rows={3}
                />
              </div>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="100"
                />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="contact@shelter.org"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Additional information about this shelter..."
                  rows={3}
                />
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
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-green-600' : 'text-gray-500'}`} />
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
              form="add-shelter-form"
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              🏢 Create Shelter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}