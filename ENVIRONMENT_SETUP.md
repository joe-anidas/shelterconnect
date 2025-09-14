# Environment Configuration Guide

This guide explains how to properly configure the ShelterConnect AI application using environment variables.

## 📁 Environment Files Structure

```
shelterconnect/
├── backend/
│   ├── .env                 # Backend environment variables
│   └── config/
│       └── env.js          # Centralized config management
├── frontend/
│   ├── .env                # Frontend environment variables
│   └── src/
│       └── config/
│           └── env.ts      # Centralized config management
└── setup-env.sh            # Automated setup script
```

## 🔧 Backend Environment Variables

### Required Configuration

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration (TiDB Serverless)
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_USER=371QxEcG3DikM1L.root
DB_PASSWORD=VfHf2aIolgWzRBHz
DB_NAME=test
DB_PORT=4000
```

### Optional Configuration

```env
# Feature Flags
ENABLE_MOCK_DATA=false
ENABLE_API_LOGGING=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000

# Agent Configuration
AGENT_POLLING_INTERVAL=5000
REBALANCE_THRESHOLD=0.8

# Logging
LOG_LEVEL=info

# External APIs (Optional)
OPENAI_API_KEY=your-openai-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🎨 Frontend Environment Variables

### Required Configuration

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# App Configuration
VITE_APP_TITLE=ShelterConnect AI
VITE_APP_VERSION=1.0.0
```

### Optional Configuration

```env
# Feature Flags
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_API_LOGGING=true

# Polling Configuration
VITE_POLLING_INTERVAL=5000

# External Services (Optional)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_OPENAI_API_KEY=your-openai-api-key
```

## 🚀 Quick Setup

### 1. Automated Setup
```bash
./setup-env.sh
```

### 2. Manual Setup
```bash
# Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with your values
nano backend/.env
nano frontend/.env
```

## 🔑 API Keys Setup

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to backend `.env`:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key
   ```

### Google Maps API Key
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API and Geocoding API
3. Create credentials
4. Add to backend `.env`:
   ```env
   GOOGLE_MAPS_API_KEY=your-actual-api-key
   ```

### TiDB Serverless
1. Visit [TiDB Cloud](https://tidbcloud.com/)
2. Create a cluster
3. Get connection details
4. Add to backend `.env`:
   ```env
   DB_HOST=your-cluster-host
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_NAME=your-database
   ```

## 🎯 Configuration Modes

### Development Mode
```env
NODE_ENV=development
ENABLE_API_LOGGING=true
ENABLE_MOCK_DATA=false
```

### Production Mode
```env
NODE_ENV=production
ENABLE_API_LOGGING=false
ENABLE_MOCK_DATA=false
```

### Demo Mode (No API Keys)
```env
ENABLE_MOCK_DATA=true
OPENAI_API_KEY=
GOOGLE_MAPS_API_KEY=
```

## 🔍 Configuration Validation

### Backend Validation
The backend automatically validates configuration on startup:
```javascript
// config/env.js
const requiredConfig = ['database.host', 'database.user', 'database.password', 'database.database'];

for (const configPath of requiredConfig) {
  const value = configPath.split('.').reduce((obj, key) => obj?.[key], config);
  if (!value) {
    console.warn(`⚠️  Missing required configuration: ${configPath}`);
  }
}
```

### Frontend Validation
The frontend logs configuration in development mode:
```typescript
// config/env.ts
if (config.isDevelopment) {
  console.log('🔧 Frontend Configuration:', {
    apiBaseUrl: config.apiBaseUrl,
    appTitle: config.appTitle,
    // ... other config
  });
}
```

## 🛠️ Environment-Specific Configurations

### Local Development
```env
# Backend
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ENABLE_API_LOGGING=true

# Frontend
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_API_LOGGING=true
```

### Staging
```env
# Backend
PORT=3000
NODE_ENV=staging
FRONTEND_URL=https://staging.shelterconnect.ai
ENABLE_API_LOGGING=true

# Frontend
VITE_API_BASE_URL=https://api-staging.shelterconnect.ai/api
VITE_ENABLE_API_LOGGING=false
```

### Production
```env
# Backend
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://shelterconnect.ai
ENABLE_API_LOGGING=false

# Frontend
VITE_API_BASE_URL=https://api.shelterconnect.ai/api
VITE_ENABLE_API_LOGGING=false
```

## 🔒 Security Best Practices

### Environment File Security
1. **Never commit .env files** to version control
2. **Use .env.example** files for documentation
3. **Rotate API keys** regularly
4. **Use different keys** for different environments

### Production Security
```env
# Use strong passwords
DB_PASSWORD=very-strong-random-password

# Limit rate limiting
RATE_LIMIT_MAX=100

# Disable debug logging
LOG_LEVEL=error
ENABLE_API_LOGGING=false
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
❌ Database connection failed: ER_ACCESS_DENIED_ERROR
```
**Solution**: Check database credentials in `.env`

#### API Base URL Not Found
```bash
❌ API Error: Failed to fetch
```
**Solution**: Verify `VITE_API_BASE_URL` in frontend `.env`

#### CORS Errors
```bash
❌ CORS policy: No 'Access-Control-Allow-Origin' header
```
**Solution**: Check `FRONTEND_URL` in backend `.env`

### Debug Mode
Enable debug logging:
```env
# Backend
ENABLE_API_LOGGING=true
LOG_LEVEL=debug

# Frontend
VITE_ENABLE_API_LOGGING=true
```

## 📊 Configuration Monitoring

### Health Check Endpoint
```bash
curl http://localhost:3000/health
```

Response includes configuration status:
```json
{
  "status": "healthy",
  "service": "ShelterConnect AI Backend",
  "environment": "development",
  "features": {
    "mockData": false,
    "apiLogging": true,
    "realTimeUpdates": true
  }
}
```

### Frontend Console
Check browser console for configuration logs:
```
🔧 Frontend Configuration: {
  apiBaseUrl: "http://localhost:3000/api",
  appTitle: "ShelterConnect AI",
  enableMockData: false,
  enableRealTimeUpdates: true
}
```

## 🚀 Deployment

### Environment Variables in Production

#### Railway/Render
Set environment variables in dashboard:
```env
NODE_ENV=production
DB_HOST=your-production-host
DB_USER=your-production-user
# ... other variables
```

#### Docker
```dockerfile
ENV NODE_ENV=production
ENV DB_HOST=your-production-host
# ... other variables
```

#### Vercel/Netlify
Set in project settings:
```env
VITE_API_BASE_URL=https://api.shelterconnect.ai/api
VITE_APP_TITLE=ShelterConnect AI
```

---

**Need help?** Check the main README.md or create an issue in the repository.
