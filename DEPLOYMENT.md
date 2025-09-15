# 🚀 Deployment Guide

## Issues Fixed

### ❌ CORS Policy Issues
- **Problem**: "Access to fetch at 'backend-url' from origin 'frontend-url' has been blocked by CORS policy"
- **Solution**: Enhanced CORS configuration in backend to allow production domains

### ❌ SPA Routing Issues  
- **Problem**: "404 Not Found" when refreshing pages in production
- **Solution**: Added `vercel.json` for proper client-side routing

### ❌ Network Connectivity
- **Problem**: "Failed to fetch" errors in production
- **Solution**: Added retry logic and better error handling

## 🔧 Backend Deployment (Render)

### Environment Variables to Set in Render:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://shelterconnect.vercel.app

# CORS Configuration
CORS_ORIGINS=https://shelterconnect.vercel.app,https://*.vercel.app

# Database (Your existing TiDB credentials)
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_USER=371QxEcG3DikM1L.root
DB_PASSWORD=VfHf2aIolgWzRBHz
DB_NAME=test
DB_PORT=4000

# Feature Flags
ENABLE_MOCK_DATA=false
ENABLE_API_LOGGING=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500

# Agent Configuration
REBALANCE_THRESHOLD=0.8
```

### Deployment Steps:
1. Push your updated code to GitHub
2. In Render dashboard, trigger a new deployment
3. Check the environment variables are set correctly
4. Monitor the deployment logs for any CORS errors

## 🌐 Frontend Deployment (Vercel)

### Environment Variables to Set in Vercel:

```bash
VITE_API_BASE_URL=https://shelterconnect-qje0.onrender.com/api
VITE_APP_TITLE=ShelterConnect AI
VITE_APP_VERSION=1.0.0
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_API_LOGGING=false
VITE_POLLING_INTERVAL=5000
```

### Files Added:
- ✅ `vercel.json` - Handles client-side routing
- ✅ `.env.production` - Production environment template

### Deployment Steps:
1. Push your code with the new `vercel.json` file
2. Vercel will automatically redeploy
3. Check that all routes work when refreshing pages

## 🔍 Testing the Fixes

### 1. CORS Test
Open browser dev tools and navigate to your deployed frontend:
- ✅ Should see API requests succeed without CORS errors
- ✅ Network tab should show 200 status codes
- ❌ If still seeing CORS errors, check backend environment variables

### 2. SPA Routing Test
- Navigate to different pages in your app
- Refresh the page (Ctrl+R / Cmd+R)
- ✅ Should stay on the same page, not show "404"
- ✅ Direct URL access should work (e.g., `/dashboard`, `/shelters`)

### 3. API Connectivity Test
- Open browser dev tools → Console
- ✅ Should see successful API requests
- ✅ Dashboard should load shelter and request data
- ❌ If seeing "Failed to fetch", check network connectivity

## 🐛 Troubleshooting

### CORS Still Not Working?
1. Check backend logs on Render for CORS errors
2. Verify environment variables are set correctly
3. Make sure both HTTP and HTTPS origins are included
4. Try adding your specific Vercel domain to CORS_ORIGINS

### SPA Routing Still Broken?
1. Ensure `vercel.json` is in the frontend root directory
2. Redeploy on Vercel after adding the file
3. Check Vercel function logs for routing issues

### API Requests Failing?
1. Check if backend is properly deployed and running
2. Verify the API base URL in frontend environment variables
3. Test backend endpoints directly (Postman/curl)
4. Check for network connectivity between services

## 📝 Next Steps

After deployment:
1. Test all major functionality (request submission, resolution, etc.)
2. Monitor error rates in production
3. Set up proper monitoring/logging if needed
4. Consider adding health checks for both services

## 🔗 Deployment URLs

- **Frontend**: https://shelterconnect.vercel.app
- **Backend**: https://shelterconnect-qje0.onrender.com
- **API Health Check**: https://shelterconnect-qje0.onrender.com/health