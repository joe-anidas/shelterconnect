import { useState, useEffect } from 'react';
import { Activity, MapPin, Users, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import LeafletMapView from '../components/LeafletMapView';
import RequestFeed from '../components/RequestFeed';
import RebalanceAlerts from '../components/RebalanceAlerts';
import ShelterSelectionModal from '../components/ShelterSelectionModal';
import { getShelters, Shelter } from '../services/shelters';
import { getRequests, Request, acceptArrival, resolveRequest } from '../services/requests';
// Agent activity hidden; no agent logs needed
import config from '../config/env';

export default function DashboardPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  // Agent activity hidden; no agent logs state
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isPolling, setIsPolling] = useState(true);
  
  // Modal state for shelter selection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    id: number;
    name: string;
    peopleCount: number;
    currentAssignedShelter?: string;
    currentAssignedShelterId?: number;
  } | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [sheltersData, requestsData] = await Promise.all([
          getShelters(),
          getRequests(50, 0)
        ]);
        
        setShelters(sheltersData);
        setRequests(requestsData);
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
        // Fetch latest data including shelters to keep capacity accurate
        const [latestShelters, latestRequests] = await Promise.all([
          getShelters(),
          getRequests(10, 0)
        ]);
        
        // Update with latest data
        setShelters(latestShelters);
        setRequests(latestRequests.slice(0, 50));
        
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch real-time updates:', error);
      }
    }, config.pollingInterval);

    return () => clearInterval(interval);
  }, [isPolling, lastUpdate]);

  // Handler for resolve request
  const handleResolveRequest = (requestId: number, requestName: string, peopleCount: number, currentAssignedShelter?: string, currentAssignedShelterId?: number) => {
    setSelectedRequest({
      id: requestId,
      name: requestName,
      peopleCount,
      currentAssignedShelter,
      currentAssignedShelterId
    });
    setIsModalOpen(true);
  };

  const handleConfirmResolve = async (shelterId: number) => {
    if (!selectedRequest) {
      return;
    }
    
    try {
      await resolveRequest(selectedRequest.id, shelterId);
      
      // Refresh data
      const [latestShelters, latestRequests] = await Promise.all([
        getShelters(),
        getRequests(50, 0)
      ]);
      setShelters(latestShelters);
      setRequests(latestRequests);
      
      setIsModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to resolve request:', error);
      alert('Failed to resolve request. Please try again.');
    }
  };

  const stats = {
    totalShelters: shelters.length,
    totalCapacity: shelters.reduce((sum, shelter) => sum + shelter.capacity, 0),
    currentOccupancy: shelters.reduce((sum, shelter) => sum + shelter.occupancy, 0),
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    resolvedRequests: requests.filter(r => r.status === 'resolved').length,
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
            Last update: {lastUpdate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} IST
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
              <p className="text-sm font-medium text-slate-600">Resolved Requests</p>
              <p className="text-2xl font-bold text-slate-900">{stats.resolvedRequests}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
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
            <div className="p-4 relative z-10">
              <LeafletMapView 
                shelters={shelters} 
                requests={requests.filter((r: any) => r.status === 'pending')}
                onShelterClick={(shelter: any) => console.log('Selected shelter:', shelter)}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Alerts Only */}
        <div className="space-y-6">
          {/* Rebalance Alerts */}
          <RebalanceAlerts shelters={shelters} />
        </div>
      </div>

      {/* Family Requests Section - Below Map */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Family Requests
          </h2>
          <p className="text-sm text-slate-600">Manage and resolve family shelter requests</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <RequestFeed 
            title="family requests"
            requests={requests.slice(0, 10).map(r => ({
              ...r,
              status: r.status === 'cancelled' ? 'pending' : r.status,
              timestamp: new Date(r.created_at),
              assigned_shelter: r.assigned_shelter_name,
              assigned_shelter_id: r.assigned_shelter_id,
              original_status: r.status
            }))}
            onAcceptArrival={async (requestId: number) => {
              try {
                await acceptArrival(requestId);
                const [latestShelters, latestRequests] = await Promise.all([
                  getShelters(),
                  getRequests(50, 0)
                ]);
                setShelters(latestShelters);
                setRequests(latestRequests);
              } catch (e) {
                console.error('Failed to accept arrival:', e);
              }
            }}
            onResolveRequest={handleResolveRequest}
            onDeleteRequest={async (requestId: number) => {
              try {
                const { deleteRequest } = await import('../services/requests');
                await deleteRequest(requestId);
                const latestRequests = await getRequests(50, 0);
                setRequests(latestRequests);
              } catch (e) {
                console.error('Failed to delete request:', e);
              }
            }}
            onLeavePending={async (requestId: number) => {
              try {
                const { updateRequestStatus } = await import('../services/requests');
                await updateRequestStatus(requestId, 'pending');
                const latestRequests = await getRequests(50, 0);
                setRequests(latestRequests);
              } catch (e) {
                console.error('Failed to leave pending:', e);
              }
            }}
          />
        </div>
      </div>
    </div>

    {/* Shelter Selection Modal */}
    {selectedRequest && (
      <ShelterSelectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleConfirmResolve}
        requestName={selectedRequest.name}
        peopleCount={selectedRequest.peopleCount}
        currentAssignedShelter={selectedRequest.currentAssignedShelter}
        currentAssignedShelterId={selectedRequest.currentAssignedShelterId}
      />
    )}
    </div>
  );
}