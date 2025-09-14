import React from 'react';
import { AlertTriangle, Users, ArrowRight, CheckCircle } from 'lucide-react';

interface Shelter {
  id: number;
  name: string;
  capacity: number;
  occupancy: number;
}

interface RebalanceAlertsProps {
  shelters: Shelter[];
}

export default function RebalanceAlerts({ shelters }: RebalanceAlertsProps) {
  const overCapacityShelters = shelters.filter(shelter => 
    (shelter.occupancy / shelter.capacity) > 0.8
  );

  const availableShelters = shelters.filter(shelter => 
    (shelter.occupancy / shelter.capacity) < 0.7
  ).sort((a, b) => (a.occupancy / a.capacity) - (b.occupancy / b.capacity));

  const generateRebalanceSuggestions = () => {
    if (overCapacityShelters.length === 0 || availableShelters.length === 0) {
      return [];
    }

    return overCapacityShelters.slice(0, 2).map((overloaded, index) => {
      const target = availableShelters[index % availableShelters.length];
      const suggestedMove = Math.min(5, overloaded.occupancy - Math.floor(overloaded.capacity * 0.75));
      
      return {
        id: `suggestion-${overloaded.id}-${target.id}`,
        from: overloaded,
        to: target,
        count: suggestedMove,
        reason: `${overloaded.name} at ${Math.round((overloaded.occupancy / overloaded.capacity) * 100)}% capacity`,
        eta: `${8 + Math.floor(Math.random() * 10)} minutes`
      };
    });
  };

  const suggestions = generateRebalanceSuggestions();

  if (overCapacityShelters.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Rebalance Status
          </h2>
        </div>
        <div className="p-4 text-center">
          <div className="text-green-600 mb-2">
            <CheckCircle className="h-12 w-12 mx-auto mb-2" />
            <p className="font-medium">All Systems Normal</p>
          </div>
          <p className="text-sm text-slate-600">
            No shelters are over capacity. The system is balanced.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          Rebalance Alerts
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          {overCapacityShelters.length} shelter{overCapacityShelters.length !== 1 ? 's' : ''} over 80% capacity
        </p>
      </div>

      <div className="divide-y divide-slate-200">
        {/* Over Capacity Shelters */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Critical Shelters</h3>
          <div className="space-y-2">
            {overCapacityShelters.map((shelter) => (
              <div key={shelter.id} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">{shelter.name}</div>
                  <div className="text-xs text-slate-600">
                    {shelter.occupancy}/{shelter.capacity} occupied
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600">
                    {Math.round((shelter.occupancy / shelter.capacity) * 100)}%
                  </div>
                  <div className="text-xs text-red-500">Over capacity</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rebalance Suggestions */}
        {suggestions.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Suggested Reassignments</h3>
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-slate-600">{suggestion.reason}</div>
                    <div className="text-xs text-blue-600">ETA: {suggestion.eta}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center bg-red-50 text-red-700 px-2 py-1 rounded">
                      <span className="font-medium">{suggestion.from.name}</span>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    
                    <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded">
                      <span className="font-medium">{suggestion.to.name}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-slate-600">
                      Move {suggestion.count} families
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        Approve
                      </button>
                      <button className="px-2 py-1 text-xs border border-slate-300 text-slate-600 rounded hover:bg-slate-50 transition-colors">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}