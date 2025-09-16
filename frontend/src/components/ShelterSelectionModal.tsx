import { useState, useEffect } from 'react';
import { X, MapPin, Users, Check } from 'lucide-react';
import { getShelters, Shelter } from '../services/shelters';

interface ShelterSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (shelterId: number) => void;
  requestName: string;
  peopleCount: number;
  currentAssignedShelter?: string;
  currentAssignedShelterId?: number;
}

export default function ShelterSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  requestName,
  peopleCount,
  currentAssignedShelter,
  currentAssignedShelterId
}: ShelterSelectionModalProps) {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedShelterId, setSelectedShelterId] = useState<number | null>(currentAssignedShelterId || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadShelters();
    }
  }, [isOpen]);

  const loadShelters = async () => {
    try {
      setLoading(true);
      const sheltersData = await getShelters();
      setShelters(sheltersData);
      setError(null);
    } catch (err) {
      setError('Failed to load shelters');
      console.error('Error loading shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedShelterId) {
      onConfirm(selectedShelterId);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden transform transition-all duration-300 scale-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">🏠 Assign Shelter</h2>
              <p className="text-blue-100">
                Finding the perfect match for <span className="font-semibold">{requestName}</span> ({peopleCount} {peopleCount === 1 ? 'person' : 'people'})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 bg-white bg-opacity-20 rounded-full p-2 transition-all duration-200 hover:bg-opacity-30"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh] bg-gray-50">
          {currentAssignedShelter && (
            <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-xl shadow-sm">
              <div className="flex items-center mb-2">
                <div className="bg-amber-100 rounded-full p-2 mr-3">
                  <MapPin className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-amber-800 font-semibold">Current Assignment</h3>
                  <p className="text-amber-700">{currentAssignedShelter}</p>
                </div>
              </div>
              <p className="text-sm text-amber-600 bg-amber-100 p-2 rounded-lg">
                💡 You can keep this assignment or select a different shelter below
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-3 w-3 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-gray-600 mt-4 font-medium">Finding available shelters...</p>
              <p className="text-gray-500 text-sm mt-1">This won't take long</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-sm mx-auto">
                <div className="text-red-500 text-4xl mb-3">⚠️</div>
                <p className="text-red-700 font-semibold mb-2">{error}</p>
                <button
                  onClick={loadShelters}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  🏢 Available Shelters
                  <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {shelters.filter(s => (s.capacity - s.occupancy) >= peopleCount).length} suitable
                  </span>
                </h3>
              </div>
              {shelters.map((shelter) => {
                const availableSpace = shelter.capacity - shelter.occupancy;
                const hasCapacity = availableSpace >= peopleCount;
                const isSelected = selectedShelterId === shelter.id;
                const occupancyRatio = shelter.occupancy / shelter.capacity;
                
                return (
                  <div
                    key={shelter.id}
                    className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer group ${
                      isSelected
                        ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                        : hasCapacity
                        ? 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
                        : 'bg-gray-50 border border-red-200 cursor-not-allowed opacity-75'
                    }`}
                    onClick={() => hasCapacity && setSelectedShelterId(shelter.id)}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-2 shadow-lg">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    
                    {/* Capacity indicator */}
                    {!hasCapacity && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Full
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">{shelter.name}</h4>
                          
                          {/* Capacity bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Occupancy</span>
                              <span className={`font-semibold ${
                                occupancyRatio >= 0.9 ? 'text-red-600' : 
                                occupancyRatio >= 0.7 ? 'text-amber-600' : 'text-green-600'
                              }`}>
                                {shelter.occupancy}/{shelter.capacity}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  occupancyRatio >= 0.9 ? 'bg-red-500' : 
                                  occupancyRatio >= 0.7 ? 'bg-amber-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(occupancyRatio * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center text-sm mb-3">
                            <div className={`flex items-center px-3 py-1 rounded-full ${
                              hasCapacity ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              <Users className="h-4 w-4 mr-1" />
                              <span className="font-medium">
                                {availableSpace} spaces available
                              </span>
                            </div>
                          </div>
                          
                          {shelter.features && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2">
                                {shelter.features.split(',').map((feature, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium"
                                  >
                                    {feature.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {shelter.address && (
                            <div className="flex items-center mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{shelter.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="bg-white border-t border-gray-200 p-6 mt-auto flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedShelterId ? (
                <span className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  Shelter selected
                </span>
              ) : (
                'Please select a shelter to continue'
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedShelterId}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  selectedShelterId
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                ✅ Assign & Resolve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}