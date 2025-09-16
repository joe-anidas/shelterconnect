//config/env.js

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Database Configuration
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 4000,
  },
  
  // API Keys
  geminiApiKey: process.env.GEMINI_API_KEY,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  
  // Optional External Services
  perplexityApiKey: process.env.PERPLEXITY_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  
  // Feature Flags
  enableMockData: process.env.ENABLE_MOCK_DATA === 'true',
  enableApiLogging: process.env.ENABLE_API_LOGGING === 'true' || process.env.NODE_ENV === 'development',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
  
  // Agent Configuration
  // Agent Polling Interval (milliseconds) - optimized for faster rebalancing
  agentPollingInterval: parseInt(process.env.AGENT_POLL_INTERVAL_MS || '2000'),
  // Rebalancing threshold (75% occupancy trigger for faster response)
  rebalanceThreshold: parseFloat(process.env.REBALANCE_THRESHOLD || '0.75'),
  // Critical threshold for immediate action
  criticalThreshold: parseFloat(process.env.CRITICAL_THRESHOLD || '0.85'),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Security
  corsOrigins: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',') : 
    [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://shelterconnect.vercel.app',
      'https://*.vercel.app'
    ],
};

// Validate required configuration
const requiredConfig = ['database.host', 'database.user', 'database.password', 'database.database'];

for (const configPath of requiredConfig) {
  const value = configPath.split('.').reduce((obj, key) => obj?.[key], config);
  if (!value) {
    console.warn(`⚠️  Missing required configuration: ${configPath}`);
  }
}

// Log configuration in development
if (config.nodeEnv === 'development') {
  console.log('🔧 Backend Configuration:', {
    port: config.port,
    nodeEnv: config.nodeEnv,
    frontendUrl: config.frontendUrl,
    database: {
      host: config.database.host,
      database: config.database.database,
      port: config.database.port,
    },
    enableMockData: config.enableMockData,
    enableApiLogging: config.enableApiLogging,
    rebalanceThreshold: config.rebalanceThreshold,
  });
}

export default config;
