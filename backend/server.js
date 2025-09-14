//server.js

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/env.js';

// ShelterConnect AI Routes
import shelterRoutes from './routes/shelters.js';
import requestRoutes from './routes/requests.js';
import agentRoutes from './routes/agents.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.rateLimitWindowMs / 1000)
  }
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'ShelterConnect AI Backend',
    timestamp: new Date().toISOString(),
    version: config.appVersion || '1.0.0',
    environment: config.nodeEnv,
    features: {
      mockData: config.enableMockData,
      apiLogging: config.enableApiLogging,
      realTimeUpdates: true
    }
  });
});

// API Routes
app.use('/api/shelters', shelterRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ShelterConnect AI Backend API',
    version: '1.0.0',
    description: 'Multi-step agentic disaster relief coordination system',
    endpoints: {
      shelters: '/api/shelters',
      requests: '/api/requests',
      agents: '/api/agents',
      dashboard: '/api/dashboard',
      health: '/health'
    },
    documentation: 'https://github.com/your-repo/shelterconnect-ai'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

app.listen(config.port, () => {
  console.log(`🚀 ShelterConnect AI Backend running on port ${config.port}`);
  console.log(`📊 Dashboard: http://localhost:${config.port}/api/dashboard`);
  console.log(`🏠 Shelters: http://localhost:${config.port}/api/shelters`);
  console.log(`👥 Requests: http://localhost:${config.port}/api/requests`);
  console.log(`🤖 Agents: http://localhost:${config.port}/api/agents`);
  console.log(`💚 Health: http://localhost:${config.port}/health`);
  
  if (config.nodeEnv === 'development') {
    console.log(`🔧 Development mode - Environment: ${config.nodeEnv}`);
    console.log(`🔧 Mock data: ${config.enableMockData ? 'enabled' : 'disabled'}`);
    console.log(`🔧 API logging: ${config.enableApiLogging ? 'enabled' : 'disabled'}`);
  }
});