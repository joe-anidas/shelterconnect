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
import { computeRebalanceSuggestions, executeRebalancingDirect } from './controllers/rebalanceController.js';
import { sendEmail } from './utils/email.js';

const app = express();

// Security middleware
app.use(helmet());

// Enhanced CORS configuration for production
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list or matches pattern
    const allowedOrigins = config.corsOrigins;
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Handle wildcard patterns
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
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
  // Auto-rebalancing scheduler (optimized for faster response)
  const intervalMs = parseInt(process.env.REBALANCE_POLL_INTERVAL_MS || '15000');
  const threshold = parseFloat(process.env.REBALANCE_THRESHOLD || '0.75');
  setInterval(async () => {
    try {
      const { rebalancingSuggestions, alerts, overCapacityShelters } = await computeRebalanceSuggestions(threshold);
      
      // Check for critical capacity shelters (>85%) for immediate action
      const criticalShelters = overCapacityShelters.filter(s => (s.occupancy / s.capacity) > 0.85);
      
      if (overCapacityShelters.length === 0 || rebalancingSuggestions.length === 0) return;

      // Prioritize critical shelter suggestions
      const prioritizedSuggestions = rebalancingSuggestions.sort((a, b) => {
        const aPriority = a.priority === 'high' ? 0 : 1;
        const bPriority = b.priority === 'high' ? 0 : 1;
        return aPriority - bPriority;
      });

      // Execute suggestions automatically (process high priority first)
      const results = await executeRebalancingDirect(prioritizedSuggestions);

      // Email summary
      try {
        const adminEmail = process.env.ADMIN_EMAIL || 'joeben2211@gmail.com';
        const criticalCount = criticalShelters.length;
        const subject = `Auto-Rebalance Executed${criticalCount > 0 ? ' (CRITICAL)' : ''}: ${results.filter(r => r.success).length}/${results.length} actions`;
        const criticalWarning = criticalCount > 0 ? `⚠️ CRITICAL: ${criticalCount} shelter(s) above 85% capacity!\n\n` : '';
        const body = `${criticalWarning}Alerts:\n${alerts.map(a => `- ${a.shelter_name} at ${a.occupancy_rate}% (${a.severity})`).join('\n')}\n\nResults:\n${results.map(r => r.success ? `✅ Moved ${r.families_moved} from ${r.from_shelter} to ${r.to_shelter}` : `❌ Failed: ${r.error}`).join('\n')}`;
        await sendEmail({ to: adminEmail, subject, text: body });
      } catch (e) {
        console.warn('Failed to send auto-rebalance email:', e.message);
      }
    } catch (e) {
      console.warn('Auto-rebalance scheduler error:', e.message);
    }
  }, intervalMs);
});