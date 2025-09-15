//services/requests.ts

import api from './api';

export interface Request {
  id: number;
  name: string;
  people_count: number;
  needs: string;
  features_required: string;
  lat: number;
  lng: number;
  phone: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'assigned' | 'completed' | 'cancelled' | 'resolved';
  assigned_shelter_id?: number;
  assigned_shelter_name?: string;
  assigned_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RequestStats {
  total_requests: number;
  pending_requests: number;
  assigned_requests: number;
  completed_requests: number;
  high_urgency_requests: number;
  medium_urgency_requests: number;
  low_urgency_requests: number;
  avg_family_size: number;
}

export interface CreateRequestData {
  name: string;
  people_count: number;
  needs?: string;
  features_required?: string[];
  lat: number;
  lng: number;
  phone?: string;
  urgency?: 'low' | 'medium' | 'high';
}

// Process new family request (Intake Agent)
export const createRequest = async (requestData: CreateRequestData): Promise<Request> => {
  const response = await api.post<{ success: boolean; request: Request }>('/requests', requestData);
  return response.request;
};

// Get all requests
export const getRequests = async (limit: number = 50, offset: number = 0): Promise<Request[]> => {
  const response = await api.get<{ success: boolean; requests: Request[] }>(`/requests?limit=${limit}&offset=${offset}`);
  return response.requests;
};

// Get request by ID
export const getRequestById = async (id: number): Promise<Request> => {
  const response = await api.get<{ success: boolean; request: Request }>(`/requests/${id}`);
  return response.request;
};

// Get pending requests
export const getPendingRequests = async (): Promise<Request[]> => {
  const response = await api.get<{ success: boolean; requests: Request[] }>('/requests/status/pending');
  return response.requests;
};

// Update request status
export const updateRequestStatus = async (id: number, status: string, assignedShelterId?: number): Promise<void> => {
  await api.patch(`/requests/${id}/status`, { status, assigned_shelter_id: assignedShelterId });
};

// Get request statistics
export const getRequestStats = async (): Promise<RequestStats> => {
  const response = await api.get<{ success: boolean; stats: RequestStats }>('/requests/stats/overview');
  return response.stats;
};

// Find best shelter match for a request (Matching Agent)
export interface MatchResult {
  shelter_id: number;
  shelter_name: string;
  distance_km: number;
  capacity_match: number;
  feature_match: number;
  overall_score: number;
  lat: number;
  lng: number;
  available_beds: number;
  features: string[];
  phone?: string;
}

export const findBestMatch = async (requestData: {
  lat: number;
  lng: number;
  people_count: number;
  features_required?: string[];
  urgency?: string;
}): Promise<MatchResult> => {
  const response = await api.post<{ success: boolean; match: MatchResult }>('/requests/match', requestData);
  return response.match;
};

// Calculate route between two points (Routing Agent)
export interface RouteResult {
  distance_km: number;
  duration_minutes: number;
  route_points: Array<{ lat: number; lng: number }>;
  instructions: string[];
}

export const calculateRoute = async (requestData: {
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
}): Promise<RouteResult> => {
  const response = await api.post<{ success: boolean; route: RouteResult }>('/requests/route', requestData);
  return response.route;
};

// Accept arrival: mark request completed and increment shelter occupancy
export const acceptArrival = async (id: number): Promise<{ new_occupancy: number } | void> => {
  const response = await api.post<{ success: boolean; new_occupancy: number }>(`/requests/${id}/arrival`);
  return { new_occupancy: response.new_occupancy };
};

// Resolve request with shelter assignment
export const resolveRequest = async (id: number, shelterId: number): Promise<{ newOccupancy: number }> => {
  const response = await api.post<{ success: boolean; newOccupancy: number }>(`/requests/${id}/resolve`, { shelterId });
  return { newOccupancy: response.newOccupancy };
};

// Delete request
export const deleteRequest = async (id: number): Promise<void> => {
  await api.delete(`/requests/${id}`);
};
