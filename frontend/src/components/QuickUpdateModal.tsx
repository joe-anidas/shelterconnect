import { useState, useEffect } from 'react';
import { X, Users, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface Shelter {
  id: number;
  name: string;
  capacity: number;
  occupancy: number;
}

interface QuickUpdateModalProps {
  isOpen: boolean;
  shelter: Shelter | null;
  onClose: () => void;
  onSubmit: (shelterId: number, newOccupancy: number) => void;
}

export default function QuickUpdateModal({ isOpen, shelter, onClose, onSubmit }: QuickUpdateModalProps) {
  const [occupancy, setOccupancy] = useState(0);
  const [changeAmount, setChangeAmount] = useState('');

  useEffect(() => {
    if (shelter && isOpen) {
      setOccupancy(shelter.occupancy);
      setChangeAmount('');
    }
  }, [shelter, isOpen]);

  const handleQuickChange = (amount: number) => {
    const newOccupancy = Math.max(0, Math.min(shelter?.capacity || 0, occupancy + amount));
    setOccupancy(newOccupancy);
    setChangeAmount(amount > 0 ? `+${amount}` : amount.toString());
    
    // Clear the change amount after 2 seconds
    setTimeout(() => setChangeAmount(''), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shelter) {
      onSubmit(shelter.id, occupancy);
    }
  };

  if (!isOpen || !shelter) {
    return null;
  }

  const occupancyRatio = occupancy / shelter.capacity;
  const previousRatio = shelter.occupancy / shelter.capacity;
  const change = occupancy - shelter.occupancy;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 pt-20 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">⚡ Quick Update</h2>
              <p className="text-purple-100 text-sm">Update occupancy in real-time</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 bg-white bg-opacity-20 rounded-full p-2 transition-all duration-200 hover:bg-opacity-30"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{shelter.name}</h3>
            <div className="text-sm text-gray-500">Capacity: {shelter.capacity} people</div>
          </div>

          {/* Current vs New Occupancy */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 mb-1">{shelter.occupancy}</div>
              <div className="text-xs text-gray-500">Current</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    previousRatio >= 0.9 ? 'bg-red-500' : 
                    previousRatio >= 0.7 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(previousRatio * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {occupancy}
                {changeAmount && (
                  <span className={`text-sm ml-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({changeAmount})
                  </span>
                )}
              </div>
              <div className="text-xs text-blue-600">New</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    occupancyRatio >= 0.9 ? 'bg-red-500' : 
                    occupancyRatio >= 0.7 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(occupancyRatio * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Manual Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Set Occupancy
            </label>
            <input
              type="number"
              min="0"
              max={shelter.capacity}
              value={occupancy}
              onChange={(e) => setOccupancy(Math.max(0, Math.min(shelter.capacity, parseInt(e.target.value) || 0)))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-xl font-semibold"
            />
          </div>

          {/* Quick Change Buttons */}
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-700 mb-3 text-center">Quick Changes</div>
            <div className="grid grid-cols-4 gap-2">
              {[-10, -5, -1, 1].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickChange(amount)}
                  disabled={
                    (amount < 0 && occupancy + amount < 0) ||
                    (amount > 0 && occupancy + amount > shelter.capacity)
                  }
                  className={`p-3 rounded-lg border-2 transition-all duration-200 font-semibold ${
                    amount < 0
                      ? 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                      : 'border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-center">
                    {amount < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  </div>
                  <div className="text-xs mt-1">{amount > 0 ? `+${amount}` : amount}</div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[5, 10].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickChange(amount)}
                  disabled={occupancy + amount > shelter.capacity}
                  className="p-2 rounded-lg border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Status Alert */}
          {occupancyRatio >= 0.9 && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Shelter at critical capacity!</span>
              </div>
            </div>
          )}

          {occupancyRatio >= 0.7 && occupancyRatio < 0.9 && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center text-amber-700">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Shelter nearing capacity</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              💾 Update Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}