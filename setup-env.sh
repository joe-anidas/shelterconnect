#!/bin/bash

# ShelterConnect AI Environment Setup Script

echo "🚀 Setting up ShelterConnect AI environment files..."

# Create backend .env file
cat > backend/.env << EOF
# ShelterConnect AI Backend Environment Variables

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration (TiDB Serverless)
# Replace with your actual TiDB Serverless credentials
DB_HOST=your-tidb-host
DB_USER=your-tidb-username
DB_PASSWORD=your-tidb-password
DB_NAME=shelterconnect_ai
DB_PORT=4000

# OpenAI API (for embeddings and LLM features)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your-openai-api-key

# Google Maps API (for geocoding and routing)
# Get your API key from: https://console.cloud.google.com/
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Optional: External Services
# PERPLEXITY_API_KEY=your-perplexity-api-key
# SUPABASE_URL=your-supabase-url
# SUPABASE_ANON_KEY=your-supabase-anon-key
EOF

# Create frontend .env file
cat > frontend/.env << EOF
# ShelterConnect AI Frontend Environment Variables

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Optional: External Services
# VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
# VITE_OPENAI_API_KEY=your-openai-api-key

# Development Configuration
VITE_APP_TITLE=ShelterConnect AI
VITE_APP_VERSION=1.0.0
EOF

echo "✅ Environment files created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your actual API keys and database credentials"
echo "2. Edit frontend/.env if you need to change the API URL"
echo "3. Run 'npm install' in both backend/ and frontend/ directories"
echo "4. Start the backend: 'cd backend && npm run dev'"
echo "5. Start the frontend: 'cd frontend && npm run dev'"
echo ""
echo "🔑 Required API Keys:"
echo "- OpenAI API Key: https://platform.openai.com/api-keys"
echo "- Google Maps API Key: https://console.cloud.google.com/"
echo "- TiDB Serverless: https://tidbcloud.com/"
echo ""
echo "🎯 For demo purposes, the system will work with mock data if API keys are not provided."
