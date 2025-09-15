import { useState, useEffect } from 'react';
import { Activity, MapPin, Users, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import MapView from '../components/MapView';
import RequestFeed from '../components/RequestFeed';
import AgentLog from '../components/AgentLog';
import RebalanceAlerts from '../components/RebalanceAlerts';
import { getShelters, Shelter } from '../services/shelters';
import { getRequests, Request } from '../services/requests';
import { getAgentLogs, AgentLog as AgentLogType } from '../services/agents';
import config from '../config/env';

export default function DashboardPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLogType[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isPolling, setIsPolling] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [sheltersData, requestsData, logsData] = await Promise.all([
          getShelters(),
          getRequests(50, 0),
          getAgentLogs(50, 0)
        ]);
        
        setShelters(sheltersData);
        setRequests(requestsData);
        setAgentLogs(logsData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!isPolling || !config.enableRealTimeUpdates) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        // Fetch latest data
        const [latestRequests, latestLogs] = await Promise.all([
          getRequests(10, 0),
          getAgentLogs(10, 0)
        ]);
        
        // Update with latest data
        setRequests(latestRequests.slice(0, 50));
        setAgentLogs(latestLogs.slice(0, 50));
        
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch real-time updates:', error);
      }
    }, config.pollingInterval);

    return () => clearInterval(interval);
  }, [isPolling, lastUpdate]);

  const stats = {
    totalShelters: shelters.length,
    totalCapacity: shelters.reduce((sum, shelter) => sum + shelter.capacity, 0),
    currentOccupancy: shelters.reduce((sum, shelter) => sum + shelter.occupancy, 0),
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    overCapacityShelters: shelters.filter(s => (s.occupancy / s.capacity) > 0.8).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
              <Activity className="h-4 w-4 mr-2" />
              Real-time Monitoring System
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
              Coordinator Dashboard
            </h1>
          <p className="text-slate-600">Real-time shelter coordination and agent activity monitoring</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="flex items-center text-sm text-slate-500">
            <Clock className="h-4 w-4 mr-1" />
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
          <button
            onClick={() => setIsPolling(!isPolling)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              isPolling 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-1 inline ${isPolling ? 'animate-spin' : ''}`} />
            {isPolling ? 'Live' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Shelters</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalShelters}</p>
            </div>
            <MapPin className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Capacity</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCapacity}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Current Occupancy</p>
              <p className="text-2xl font-bold text-slate-900">{stats.currentOccupancy}</p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Requests</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingRequests}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Over Capacity</p>
              <p className="text-2xl font-bold text-red-600">{stats.overCapacityShelters}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shelter Map
              </h2>
              <p className="text-sm text-slate-600">Real-time occupancy status and locations</p>
            </div>
            <div className="p-4">
              <MapView 
                shelters={shelters} 
                requests={requests.filter((r: any) => r.status === 'pending')}
                onShelterClick={(shelter: any) => console.log('Selected shelter:', shelter)}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Feeds and Alerts */}
        <div className="space-y-6">
          {/* Rebalance Alerts */}
          <RebalanceAlerts shelters={shelters} />
          
          {/* Pending Requests Feed */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Incoming Requests
              </h2>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <RequestFeed requests={requests.slice(0, 5).map(r => ({
                ...r,
                status: r.status === 'cancelled' ? 'pending' : r.status,
                timestamp: new Date(r.created_at),
                assigned_shelter: r.assigned_shelter_name
              }))} />
            </div>
          </div>

          {/* Agent Activity Log */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Agent Activity
              </h2>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <AgentLog logs={agentLogs.slice(0, 10).map(log => ({
                ...log,
                timestamp: new Date(log.timestamp),
                details: typeof log.details === 'object' ? JSON.stringify(log.details) : log.details
              }))} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}