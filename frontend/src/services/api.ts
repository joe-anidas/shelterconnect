//services/api.ts

import config from '../config/env';

const API_BASE_URL = config.apiBaseUrl;

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Add credentials for CORS
      credentials: 'include',
      // Add mode for CORS
      mode: 'cors',
      ...options,
    };

    // Log API requests in development
    if (config.enableApiLogging) {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      console.log(`🔧 Request config:`, requestConfig);
    }

    try {
      const response = await fetch(url, requestConfig);
      
      if (!response.ok) {
        // Handle specific CORS and network errors
        if (response.status === 0 && retryCount < 2) {
          console.log(`🔄 Retrying request (${retryCount + 1}/3)...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.request(endpoint, options, retryCount + 1);
        }
        
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        
        if (config.enableApiLogging) {
          console.error(`❌ API Error: ${errorMessage}`, {
            status: response.status,
            statusText: response.statusText,
            url,
            errorData
          });
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (config.enableApiLogging) {
        console.log(`✅ API Response: ${options.method || 'GET'} ${url}`, data);
      }
      
      return data;
    } catch (error) {
      if (config.enableApiLogging) {
        console.error('❌ API request failed:', error);
        console.error('🔧 Request details:', { url, method: options.method || 'GET', retryCount });
      }
      
      // Handle network errors and CORS issues
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        const corsError = new Error(`Network error: Unable to reach ${this.baseURL}. This might be due to CORS policy or server being down.`);
        corsError.name = 'NetworkError';
        throw corsError;
      }
      
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create and export the API service instance
const api = new ApiService(API_BASE_URL);
export default api;
