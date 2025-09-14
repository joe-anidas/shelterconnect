//config/env.ts

export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // App Configuration
  appTitle: import.meta.env.VITE_APP_TITLE || 'ShelterConnect AI',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  
  // Optional External Services
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  
  // Feature Flags
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  enableRealTimeUpdates: import.meta.env.VITE_ENABLE_REAL_TIME !== 'false',
  
  // Polling Configuration
  pollingInterval: parseInt(import.meta.env.VITE_POLLING_INTERVAL || '5000'),
  
  // Debug Configuration
  enableApiLogging: import.meta.env.VITE_ENABLE_API_LOGGING === 'true',
};

// Log configuration in development
if (config.isDevelopment) {
  console.log('🔧 Frontend Configuration:', {
    apiBaseUrl: config.apiBaseUrl,
    appTitle: config.appTitle,
    appVersion: config.appVersion,
    mode: config.mode,
    enableMockData: config.enableMockData,
    enableRealTimeUpdates: config.enableRealTimeUpdates,
    pollingInterval: config.pollingInterval,
  });
}

export default config;
