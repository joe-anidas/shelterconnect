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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Resolve Request</h2>
            <p className="text-sm text-gray-600">
              Select shelter assignment for {requestName} ({peopleCount} people)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentAssignedShelter && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  Currently assigned to: {currentAssignedShelter}
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                You can keep this assignment or change to a different shelter below.
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading shelters...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadShelters}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Available Shelters:
              </h3>
              {shelters.map((shelter) => {
                const availableSpace = shelter.capacity - shelter.occupancy;
                const hasCapacity = availableSpace >= peopleCount;
                const isSelected = selectedShelterId === shelter.id;
                
                return (
                  <div
                    key={shelter.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : hasCapacity
                        ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        : 'border-red-200 bg-red-50 cursor-not-allowed'
                    }`}
                    onClick={() => hasCapacity && setSelectedShelterId(shelter.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900">{shelter.name}</h4>
                          {isSelected && (
                            <Check className="h-5 w-5 text-blue-600 ml-2" />
                          )}
                        </div>
                        
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          <span>
                            {shelter.occupancy}/{shelter.capacity} occupancy
                          </span>
                          <span className="mx-2">•</span>
                          <span className={hasCapacity ? 'text-green-600' : 'text-red-600'}>
                            {availableSpace} available space
                          </span>
                        </div>
                        
                        {shelter.features && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {shelter.features.split(',').map((feature, index) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                >
                                  {feature.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {shelter.address && (
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{shelter.address}</span>
                          </div>
                        )}
                      </div>
                      
                      {!hasCapacity && (
                        <div className="text-xs text-red-600 font-medium">
                          Insufficient capacity
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedShelterId}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedShelterId
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
}