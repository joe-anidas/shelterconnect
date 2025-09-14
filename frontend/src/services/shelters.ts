//services/shelters.ts

import api from './api';

export interface Shelter {
  id: number;
  name: string;
  capacity: number;
  occupancy: number;
  features: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface ShelterStats {
  total_shelters: number;
  total_capacity: number;
  total_occupancy: number;
  avg_occupancy_rate: number;
  over_capacity_count: number;
}

// Get all shelters
export const getShelters = async (): Promise<Shelter[]> => {
  const response = await api.get<{ success: boolean; shelters: Shelter[] }>('/shelters');
  return response.shelters;
};

// Get shelter by ID
export const getShelterById = async (id: number): Promise<Shelter> => {
  const response = await api.get<{ success: boolean; shelter: Shelter }>(`/shelters/${id}`);
  return response.shelter;
};

// Create new shelter
export const createShelter = async (shelterData: Partial<Shelter>): Promise<Shelter> => {
  const response = await api.post<{ success: boolean; shelter: Shelter }>('/shelters', shelterData);
  return response.shelter;
};

// Update shelter
export const updateShelter = async (id: number, shelterData: Partial<Shelter>): Promise<void> => {
  await api.put(`/shelters/${id}`, shelterData);
};

// Update shelter occupancy
export const updateShelterOccupancy = async (id: number, occupancy: number): Promise<void> => {
  await api.patch(`/shelters/${id}/occupancy`, { occupancy });
};

// Get nearby shelters
export const getNearbyShelters = async (lat: number, lng: number, distance: number = 10000): Promise<Shelter[]> => {
  const response = await api.get<{ success: boolean; shelters: Shelter[] }>(`/shelters/nearby/${lat}/${lng}?distance=${distance}`);
  return response.shelters;
};

// Get available shelters
export const getAvailableShelters = async (minCapacity: number = 1): Promise<Shelter[]> => {
  const response = await api.get<{ success: boolean; shelters: Shelter[] }>(`/shelters/available/${minCapacity}`);
  return response.shelters;
};

// Search shelters by features
export const searchSheltersByFeatures = async (features: string[]): Promise<Shelter[]> => {
  const response = await api.post<{ success: boolean; shelters: Shelter[] }>('/shelters/search/features', { features });
  return response.shelters;
};

// Get over-capacity shelters
export const getOverCapacityShelters = async (threshold: number = 0.8): Promise<Shelter[]> => {
  const response = await api.get<{ success: boolean; shelters: Shelter[] }>(`/shelters/over-capacity/${threshold}`);
  return response.shelters;
};

// Get shelter statistics
export const getShelterStats = async (): Promise<ShelterStats> => {
  const response = await api.get<{ success: boolean; stats: ShelterStats }>('/shelters/stats/overview');
  return response.stats;
};
