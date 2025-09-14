//services/dashboard.ts

import api from './api';

export interface DashboardOverview {
  shelters: {
    total_shelters: number;
    total_capacity: number;
    total_occupancy: number;
    avg_occupancy_rate: number;
    over_capacity_count: number;
  };
  requests: {
    total_requests: number;
    pending_requests: number;
    assigned_requests: number;
    completed_requests: number;
    high_urgency_requests: number;
    medium_urgency_requests: number;
    low_urgency_requests: number;
    avg_family_size: number;
  };
  over_capacity_count: number;
  pending_requests_count: number;
  assignment_rate: string;
}

export interface DashboardAlerts {
  over_capacity_shelters: Array<{
    id: number;
    name: string;
    occupancy_rate: string;
    severity: 'critical' | 'warning';
  }>;
  pending_requests: Array<{
    id: number;
    name: string;
    people_count: number;
    urgency: string;
    created_at: string;
  }>;
}

export interface MapData {
  shelters: Array<{
    id: number;
    name: string;
    lat: number;
    lng: number;
    capacity: number;
    occupancy: number;
    occupancy_rate: string;
    features: string;
    address: string;
    phone: string;
  }>;
  pending_requests: Array<{
    id: number;
    name: string;
    lat: number;
    lng: number;
    people_count: number;
    urgency: string;
    needs: string;
    created_at: string;
  }>;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    avg_occupancy_rate: number;
    assignment_rate: number;
    over_capacity_shelters: number;
    pending_requests: number;
    active_agents: number;
  };
  alerts: Array<{
    type: 'warning' | 'critical';
    message: string;
  }>;
}

export interface SimulationData {
  scenario: string;
  requests_generated: number;
  area: string;
  urgency_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  estimated_assignments: number;
  estimated_pending: number;
}

// Get dashboard overview
export const getDashboardOverview = async (): Promise<{
  overview: DashboardOverview;
  alerts: DashboardAlerts;
  recent_activity: any[];
}> => {
  const response = await api.get<{ success: boolean; overview: DashboardOverview; alerts: DashboardAlerts; recent_activity: any[] }>('/dashboard/overview');
  return {
    overview: response.overview,
    alerts: response.alerts,
    recent_activity: response.recent_activity
  };
};

// Get real-time data
export const getRealtimeData = async (lastUpdate?: string): Promise<{
  timestamp: string;
  updates: {
    new_requests: any[];
    new_logs: any[];
    shelter_status: any[];
  };
}> => {
  const params = lastUpdate ? `?lastUpdate=${lastUpdate}` : '';
  const response = await api.get<{ success: boolean; timestamp: string; updates: any }>(`/dashboard/realtime${params}`);
  return {
    timestamp: response.timestamp,
    updates: response.updates
  };
};

// Get map data
export const getMapData = async (): Promise<MapData> => {
  const response = await api.get<{ success: boolean; map_data: MapData }>('/dashboard/map-data');
  return response.map_data;
};

// Get simulation data
export const getSimulationData = async (scenario?: string): Promise<SimulationData> => {
  const params = scenario ? `?scenario=${scenario}` : '';
  const response = await api.get<{ success: boolean; simulation: SimulationData }>(`/dashboard/simulation${params}`);
  return response.simulation;
};

// Get system health
export const getSystemHealth = async (): Promise<SystemHealth> => {
  const response = await api.get<{ success: boolean; health: SystemHealth }>('/dashboard/health');
  return response.health;
};
