//services/agents.ts

import api from './api';

export interface AgentLog {
  id: number;
  agent_name: 'intake_agent' | 'matching_agent' | 'routing_agent' | 'rebalance_agent';
  timestamp: string;
  action: string;
  status: 'processing' | 'completed' | 'error';
  request_id?: number;
  shelter_id?: number;
  details?: any;
  created_at: string;
}

export interface MatchingResult {
  request_id: number;
  shelter_id: number;
  shelter_name: string;
  distance: number;
  eta_minutes: number;
  score: number;
  new_occupancy: number;
}

export interface RouteResult {
  request_id: number;
  shelter_id: number;
  shelter_name: string;
  shelter_address: string;
  distance: number;
  eta_minutes: number;
  route_instructions: any[];
  urgency: string;
}

export interface RebalancingSuggestion {
  from_shelter: {
    id: number;
    name: string;
    current_occupancy: number;
    capacity: number;
    occupancy_rate: string;
  };
  to_shelter: {
    id: number;
    name: string;
    current_occupancy: number;
    capacity: number;
    available_capacity: number;
  };
  suggested_moves: number;
  distance: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface OccupancyAlert {
  shelter_id: number;
  shelter_name: string;
  current_occupancy: number;
  capacity: number;
  occupancy_rate: string;
  severity: 'critical' | 'warning';
  available_nearby: number;
}

// Matching Agent - Find best shelter match for a request
export const findBestMatch = async (requestId: number): Promise<MatchingResult> => {
  const response = await api.post<{ success: boolean; assignment: MatchingResult }>(`/agents/matching/find-match/${requestId}`);
  return response.assignment;
};

// Matching Agent - Process all pending requests
export const processPendingRequests = async (): Promise<any[]> => {
  const response = await api.post<{ success: boolean; results: any[] }>('/agents/matching/process-pending');
  return response.results;
};

// Routing Agent - Calculate route and ETA
export const calculateRoute = async (requestId: number): Promise<RouteResult> => {
  const response = await api.get<{ success: boolean; route: RouteResult }>(`/agents/routing/calculate/${requestId}`);
  return response.route;
};

// Routing Agent - Calculate routes for multiple requests
export const calculateBulkRoutes = async (requestIds: number[]): Promise<any[]> => {
  const response = await api.post<{ success: boolean; results: any[] }>('/agents/routing/calculate-bulk', { requestIds });
  return response.results;
};

// Rebalance Agent - Monitor occupancy levels
export const monitorOccupancy = async (threshold: number = 0.8): Promise<{
  monitoring: any;
  rebalancing_suggestions: RebalancingSuggestion[];
  alerts: OccupancyAlert[];
}> => {
  const response = await api.get<{ success: boolean; monitoring: any; rebalancing_suggestions: RebalancingSuggestion[]; alerts: OccupancyAlert[] }>(`/agents/rebalance/monitor?threshold=${threshold}`);
  return {
    monitoring: response.monitoring,
    rebalancing_suggestions: response.rebalancing_suggestions,
    alerts: response.alerts
  };
};

// Rebalance Agent - Execute rebalancing suggestions
export const executeRebalancing = async (suggestions: any[]): Promise<any[]> => {
  const response = await api.post<{ success: boolean; results: any[] }>('/agents/rebalance/execute', { suggestions });
  return response.results;
};

// Get agent logs
export const getAgentLogs = async (limit: number = 50, offset: number = 0, agent?: string, status?: string, hours?: number): Promise<AgentLog[]> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  if (agent) params.append('agent', agent);
  if (status) params.append('status', status);
  if (hours) params.append('hours', hours.toString());

  const response = await api.get<{ success: boolean; logs: AgentLog[] }>(`/agents/logs?${params.toString()}`);
  return response.logs;
};

// Get agent statistics
export const getAgentStats = async (): Promise<{
  agent_stats: any[];
  recent_activity: any[];
}> => {
  const response = await api.get<{ success: boolean; agent_stats: any[]; recent_activity: any[] }>('/agents/stats');
  return {
    agent_stats: response.agent_stats,
    recent_activity: response.recent_activity
  };
};

// Get logs by request
export const getRequestLogs = async (requestId: number): Promise<AgentLog[]> => {
  const response = await api.get<{ success: boolean; logs: AgentLog[] }>(`/agents/logs/request/${requestId}`);
  return response.logs;
};

// Get logs by shelter
export const getShelterLogs = async (shelterId: number): Promise<AgentLog[]> => {
  const response = await api.get<{ success: boolean; logs: AgentLog[] }>(`/agents/logs/shelter/${shelterId}`);
  return response.logs;
};
