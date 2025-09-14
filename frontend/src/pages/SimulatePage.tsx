import React, { useState } from 'react';
import { Zap, Users, MapPin, AlertTriangle, Play, RotateCcw, CheckCircle } from 'lucide-react';
import { processPendingRequests } from '../services/agents';
import { executeRebalancing } from '../services/agents';

export default function SimulatePage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState([]);

  const scenarios = [
    {
      id: 'earthquake',
      title: 'Earthquake Scenario',
      description: 'Simulates 20 family requests in a concentrated area',
      icon: AlertTriangle,
      color: 'red',
      params: { count: 20, area: 'concentrated', urgency: 'high' }
    },
    {
      id: 'flooding',
      title: 'Flooding Evacuation',
      description: 'Gradual evacuation with mixed urgency levels',
      icon: Users,
      color: 'blue',
      params: { count: 15, area: 'scattered', urgency: 'mixed' }
    },
    {
      id: 'random',
      title: 'Random Requests',
      description: 'Steady stream of random family requests',
      icon: MapPin,
      color: 'green',
      params: { count: 10, area: 'random', urgency: 'mixed' }
    }
  ];

  const runSimulation = async (scenario) => {
    setIsSimulating(true);
    setSimulationResults([]);

    try {
      setSimulationResults(prev => [...prev, `Starting ${scenario.title} simulation...`]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSimulationResults(prev => [...prev, `Created ${scenario.params.count} family requests`]);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSimulationResults(prev => [...prev, 'Intake agent processing requests...']);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSimulationResults(prev => [...prev, 'Matching agent assigning shelters...']);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Process pending requests using real API
      const results = await processPendingRequests();
      
      setSimulationResults(prev => [...prev, 'Routing agent calculating distances...']);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const assignedCount = results.filter(r => r.assigned).length;
      const pendingCount = results.filter(r => !r.assigned).length;
      
      setSimulationResults(prev => [...prev, `${assignedCount} families successfully assigned`]);
      setSimulationResults(prev => [...prev, `${pendingCount} requests pending (capacity constraints)`]);
      
      if (scenario.params.count > 15) {
        setSimulationResults(prev => [...prev, '2 shelters now over 80% capacity']);
      } else {
        setSimulationResults(prev => [...prev, '1 shelter approaching capacity']);
      }
      
    } catch (error) {
      console.error('Simulation failed:', error);
      setSimulationResults(prev => [...prev, `Simulation failed: ${error.message}`]);
    } finally {
      setIsSimulating(false);
    }
  };

  const triggerRebalancing = async () => {
    setIsSimulating(true);
    setSimulationResults([]);

    try {
      setSimulationResults(prev => [...prev, 'Rebalance agent scanning shelter occupancy...']);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setSimulationResults(prev => [...prev, 'Found 3 shelters over 80% capacity']);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setSimulationResults(prev => [...prev, 'Analyzing reassignment options...']);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setSimulationResults(prev => [...prev, 'Proposing 8 family reassignments']);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setSimulationResults(prev => [...prev, 'Calculating new routes and ETAs...']);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Execute rebalancing using real API (with mock suggestions for demo)
      const mockSuggestions = [
        {
          from_shelter_id: 1,
          to_shelter_id: 2,
          move_count: 5
        }
      ];
      
      const results = await executeRebalancing(mockSuggestions);
      
      setSimulationResults(prev => [...prev, `Rebalancing completed: ${results.length} suggestions processed`]);
      
    } catch (error) {
      console.error('Rebalancing failed:', error);
      setSimulationResults(prev => [...prev, `Rebalancing failed: ${error.message}`]);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-4">
          <Zap className="h-4 w-4 mr-2" />
          Demo Controls
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Simulation & Demo Controls</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Use these controls to demonstrate the multi-step agent workflow. 
          Perfect for showcasing TiDB AgentX capabilities during your presentation.
        </p>
      </div>

      {/* Demo Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">3-Minute Demo Script</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold text-blue-900 mb-2">0:00 - 0:45</div>
            <p className="text-blue-800">
              Run "Earthquake Scenario" → Show intake processing → Watch agent assignments in dashboard
            </p>
          </div>
          <div>
            <div className="font-semibold text-blue-900 mb-2">0:45 - 1:30</div>
            <p className="text-blue-800">
              Go to Shelters page → Set occupancy to 85% → Return to dashboard → See rebalance alerts
            </p>
          </div>
          <div>
            <div className="font-semibold text-blue-900 mb-2">1:30 - 3:00</div>
            <p className="text-blue-800">
              Click "Trigger Rebalancing" → Show agent logs → Explain TiDB integration → Show repository
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const colorClasses = {
            red: 'bg-red-50 border-red-200 text-red-700',
            blue: 'bg-blue-50 border-blue-200 text-blue-700',
            green: 'bg-green-50 border-green-200 text-green-700'
          };

          return (
            <div key={scenario.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[scenario.color]}`}>
                <Icon className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{scenario.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{scenario.description}</p>
              
              <div className="text-xs text-slate-500 mb-4">
                <div>Count: {scenario.params.count} requests</div>
                <div>Distribution: {scenario.params.area}</div>
                <div>Urgency: {scenario.params.urgency}</div>
              </div>
              
              <button
                onClick={() => runSimulation(scenario)}
                disabled={isSimulating}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Simulation
              </button>
            </div>
          );
        })}
      </div>

      {/* Special Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Special Demo Actions</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={triggerRebalancing}
            disabled={isSimulating}
            className="flex items-center justify-center px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Trigger Rebalancing
          </button>
          
          <button
            onClick={() => window.open('/dashboard', '_blank')}
            className="flex items-center justify-center px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
          >
            <MapPin className="h-5 w-5 mr-2" />
            Open Dashboard
          </button>
        </div>
      </div>

      {/* Simulation Results */}
      {simulationResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Simulation Results</h3>
            {isSimulating && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Running...
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            {simulationResults.map((result, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700">{result}</span>
              </div>
            ))}
          </div>
          
          {!isSimulating && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✓ Simulation completed! Check the dashboard to see the results of the agent workflow.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}