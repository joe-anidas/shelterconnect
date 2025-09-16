# 🏠 ShelterConnect AI

**Multi-Agent Disaster Relief Coordination System with TiDB Vector Search & Real-Time Resolution Management**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TiDB](https://img.shields.io/badge/TiDB-Vector%20Search-orange.svg)](https://tidb.cloud/)
[![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-blue.svg)](https://ai.google.dev/)

> **🏆 TiDB AgentX Hackathon Project - Forge Agentic AI for Real-World Impact**

ShelterConnect AI is an intelligent disaster relief coordination platform that leverages **TiDB Vector Search**, multi-agent architecture, and Google Gemini embeddings to semantically match displaced families with optimal shelters during emergencies. Built specifically for the **TiDB AgentX Hackathon**, this system demonstrates the power of combining vector databases with agentic AI for real-world humanitarian impact.

## 🎯 Problem Statement

During disasters (floods, earthquakes, cyclones), displaced families face critical challenges:

- **Inefficient Shelter Matching** – Families directed to full shelters or inappropriate facilities
- **Manual Coordination** – Relief coordinators overwhelmed with scattered data and manual processes
- **Resource Misallocation** – Some shelters overflow while others remain underutilized
- **Delayed Response** – High-urgency requests get lost in manual triaging processes
- **Capacity Management** – No real-time tracking of shelter occupancy and availability

## 🚀 Solution Overview

ShelterConnect AI provides:

1. **🤖 Multi-Agent Architecture** – 7-step AI agent workflow with comprehensive logging and state management
2. **🔍 TiDB Vector Search** – Semantic matching using VECTOR(1536) columns, VEC_COSINE_DISTANCE, and HNSW indexing
3. **🧠 Google Gemini Integration** – text-embedding-004 model with intelligent dimension padding (768→1536)
4. **📍 Real-Time Mapping** – Interactive shelter maps with live occupancy status and geographic optimization
5. **⚡ Smart Resolution** – One-click request resolution with automatic occupancy management
6. **🔄 Dynamic Rebalancing** – Automated suggestions for optimal shelter utilization with capacity monitoring
7. **📊 Live Dashboard** – Real-time monitoring, agent logs, and comprehensive analytics interface

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    ShelterConnect AI                        │
├─────────────────────┬───────────────────┬───────────────────┤
│   Frontend (React)  │  Backend (Node.js) │  Database (TiDB)  │
│                     │                   │                   │
│ • Dashboard UI      │ • Multi-Agent API │ • Vector Storage  │
│ • Interactive Maps  │ • Request Handler │ • Full-Text Search│
│ • Resolution Modal  │ • Shelter Manager │ • Occupancy Data  │
│ • Real-Time Updates │ • Agent Orchestr. │ • Agent Logs      │
└─────────────────────┴───────────────────┴───────────────────┘
```

### 🤖 7-Step Multi-Agent Workflow

```
📝 Intake → 🧠 Embedding → 🔍 Vector Search → 🎯 Matching → 🗺️ Routing → 📋 Assignment → ⚖️ Rebalancing
     ↓          ↓             ↓               ↓            ↓            ↓            ↓
Family Data  Gemini API    TiDB Vector    Smart Match   Route Calc   Shelter      Load Balance
+ Validation + Embeddings  + Similarity   + Scoring    + ETA        Assignment   + Monitoring
+ Storage    + 1536-dim    + Distance     + Filtering  + Navigation + Occupancy  + Suggestions
```

### 🏗️ TiDB Vector Search Architecture

```sql
-- TiDB Vector Schema Implementation
CREATE TABLE shelter_vectors (
  id INT PRIMARY KEY,
  shelter_id INT,
  embedding VECTOR(1536),     -- 1536-dimensional vectors
  text_content TEXT,
  created_at TIMESTAMP,
  INDEX hnsw_idx USING HNSW (embedding)  -- HNSW indexing for fast similarity search
);

-- Vector similarity search with distance calculation
SELECT s.*, sv.embedding, 
       VEC_COSINE_DISTANCE(sv.embedding, ?) as similarity_score
FROM shelters s 
JOIN shelter_vectors sv ON s.id = sv.shelter_id 
ORDER BY similarity_score ASC 
LIMIT 5;
```

## 🤖 Multi-Agent System

### 1. 📝 Intake Agent
- **Purpose**: Process and validate incoming family requests
- **TiDB Integration**: Store family data with comprehensive metadata
- **Actions**: 
  - Validate and sanitize family request data
  - Store requests in TiDB with status tracking
  - Generate unique request IDs and timestamps
  - Log intake activities for audit trail

### 2. 🧠 Embedding Agent
- **Purpose**: Generate semantic embeddings for vector search
- **Google Gemini Integration**: text-embedding-004 model with fallback support
- **Actions**:
  - Generate embeddings using Google Generative AI
  - Pad 768-dimensional Gemini vectors to 1536 dimensions for TiDB compatibility
  - Store embeddings in TiDB VECTOR(1536) columns
  - Fallback to deterministic mock embeddings for demo/development

### 3. 🔍 Vector Search Agent
- **Purpose**: Perform semantic similarity search in TiDB
- **TiDB Vector Features**: VEC_COSINE_DISTANCE, HNSW indexing
- **Actions**:
  - Execute vector similarity queries against shelter embeddings
  - Utilize TiDB's native vector functions for optimal performance
  - Return ranked results with similarity scores
  - Support both semantic and feature-based filtering

### 4. 🎯 Matching Agent  
- **Purpose**: Intelligent shelter-to-family matching
- **Smart Scoring Algorithm**: Combines multiple factors for optimal matches
- **Actions**:
  - Analyze vector search results with similarity scoring
  - Apply capacity and feature filters (medical, wheelchair accessible, etc.)
  - Calculate composite scores: similarity + distance + availability
  - Rank shelter options and select best match

### 5. 🗺️ Routing Agent
- **Purpose**: Optimize travel logistics and route planning
- **Geographic Intelligence**: Distance calculation and ETA estimation
- **Actions**:
  - Calculate distance between family location and shelter
  - Generate estimated travel time based on urgency level
  - Provide routing recommendations
  - Consider geographic constraints and emergency protocols

### 6. 📋 Assignment Agent
- **Purpose**: Execute shelter assignments and capacity management
- **Real-time Occupancy**: Live shelter capacity tracking
- **Actions**:
  - Assign families to optimal shelters
  - Update shelter occupancy in real-time
  - Generate confirmation and contact information
  - Handle assignment conflicts and capacity overflow

### 7. ⚖️ Rebalancing Agent
- **Purpose**: Maintain optimal shelter utilization across the network
- **Proactive Monitoring**: Capacity threshold monitoring (>80% triggers alerts)
- **Actions**:
  - Monitor real-time occupancy across all shelters
  - Generate rebalancing suggestions when capacity exceeds thresholds
  - Recommend optimal family transfers to underutilized shelters
  - Predict and prevent capacity bottlenecks before they occur

## ✨ Key Features

### 🎯 Smart Request Resolution
- **One-Click Resolution**: Resolve requests with shelter assignment in a single action
- **Capacity Management**: Automatic occupancy updates when resolving requests
- **Reassignment Logic**: Smart handling of shelter changes with proper capacity adjustments
- **Real-Time Updates**: Live dashboard updates across all connected clients

### 📍 Interactive Mapping
- **Live Shelter Status**: Real-time occupancy visualization on interactive maps
- **Color-Coded Indicators**: Green (available), Yellow (near capacity), Red (full)
- **Request Tracking**: Visual representation of pending and resolved requests
- **Geographic Optimization**: Distance-based matching and routing

### 📊 Comprehensive Dashboard
- **Real-Time Statistics**: Live tracking of requests, occupancy, and resolution rates
- **Agent Activity Logs**: Transparent view of all automated actions
- **Rebalance Alerts**: Proactive notifications for capacity management
- **Historical Analytics**: Track performance and identify optimization opportunities

## 🛠️ Technology Stack

### Backend
- **Node.js + Express**: RESTful API server with comprehensive middleware stack
- **TiDB Serverless**: Vector database with VECTOR(1536) columns, VEC_COSINE_DISTANCE functions, HNSW indexes
- **Google Gemini API**: text-embedding-004 model for semantic embeddings with intelligent dimension padding
- **MySQL2**: Optimized database connection with prepared statements and connection pooling
- **@google/generative-ai**: Official Google Generative AI SDK for embedding generation
- **Security**: Helmet, CORS, rate limiting, input validation, API key management

### Frontend  
- **React 18 + TypeScript**: Modern React with type safety
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first styling framework
- **Leaflet**: Interactive mapping with shelter visualization
- **Lucide React**: Consistent icon library

### 🗄️ TiDB Vector Database Schema
- **Shelters**: Location, capacity, features, real-time occupancy tracking with geographic coordinates
- **Requests**: Family data, needs, status workflow (pending→assigned→resolved), priority scoring
- **Shelter_Vectors**: VECTOR(1536) embeddings with HNSW indexing for semantic shelter search
- **Request_Vectors**: VECTOR(1536) embeddings for family needs matching with TiDB vector functions
- **Agent_Logs**: Comprehensive audit trail of all 7-step agent workflow executions
- **Rebalance_Suggestions**: Automated capacity management recommendations with threshold monitoring

### 🔍 TiDB Vector Search Features
- **Native Vector Functions**: VEC_COSINE_DISTANCE(), VEC_L2_DISTANCE(), VEC_INNER_PRODUCT()
- **HNSW Indexing**: Hierarchical Navigable Small World indexes for sub-second similarity search
- **1536-Dimensional Vectors**: Compatible with both Gemini (768) and OpenAI (1536) embeddings
- **Hybrid Search**: Combine vector similarity with traditional SQL filtering for optimal results

## � Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **TiDB Serverless** account with Vector Search enabled ([Sign up here](https://tidbcloud.com/))
- **Google Gemini API key** (optional, system includes intelligent mock embeddings for development)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/joe-anidas/shelterconnect.git
   cd shelterconnect
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy and configure environment variables
   cp .env.example .env
   # Edit .env with your TiDB and Google Gemini API credentials
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Copy and configure environment variables  
   cp .env.example .env
   # Edit .env with your API endpoints
   ```

4. **TiDB Vector Database Setup**
   ```bash
   # Run TiDB vector search migrations (creates VECTOR columns and HNSW indexes)
   cd backend
   node run_migration.js
   
   # Optional: Populate with sample shelter and vector data
   node setup_tidb_vectors.js
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend (Port 3000)
   cd backend && npm start
   
   # Terminal 2 - Frontend (Port 5173)
   cd frontend && npm run dev
   ```

6. **Access the Application**
   - 🌐 **Frontend**: http://localhost:5173
   - 🔌 **Backend API**: http://localhost:3000
   - 📊 **Dashboard**: http://localhost:5173/dashboard

## ⚙️ Configuration

### Backend Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# TiDB Serverless Database
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=test
DB_PORT=4000

# Google Gemini API (for semantic vector embeddings)
GEMINI_API_KEY=your_gemini_api_key_from_ai_google_dev

# Feature Flags
ENABLE_MOCK_DATA=false
ENABLE_API_LOGGING=true
```

### Frontend Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=ShelterConnect AI
VITE_APP_VERSION=1.0.0

# Maps Configuration (optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 📊 API Endpoints

### 🏠 Shelters
```
GET    /api/shelters              # Get all shelters with occupancy
POST   /api/shelters              # Create new shelter
GET    /api/shelters/:id          # Get shelter by ID
PUT    /api/shelters/:id          # Update shelter information
GET    /api/shelters/nearby       # Find shelters near coordinates
```

### 👥 Requests
```
POST   /api/requests              # Submit new family request
GET    /api/requests              # Get all requests (with pagination)
GET    /api/requests/:id          # Get specific request details
POST   /api/requests/:id/resolve  # Resolve request with shelter assignment
DELETE /api/requests/:id          # Delete request
POST   /api/requests/:id/arrival  # Mark family arrival (complete request)
POST   /api/requests/match        # Find best shelter match
POST   /api/requests/route        # Calculate route and ETA
```

### 🤖 Multi-Step Agents & Vector Search
```
POST   /api/agents/multi-step     # Execute complete 7-step agent workflow
GET    /api/agents/logs           # Get comprehensive agent activity logs  
POST   /api/agents/rebalance      # Trigger intelligent rebalancing suggestions
GET    /api/agents/status         # Monitor agent execution status
POST   /api/vector/search         # Direct TiDB vector similarity search
POST   /api/vector/embed          # Generate Gemini embeddings for text
GET    /api/dashboard/overview    # Real-time dashboard with vector search analytics
GET    /api/dashboard/realtime    # Live updates with agent workflow monitoring
```

## 🗄️ Database Schema

### Core Tables
- **`shelters`**: Location, capacity, features, current occupancy
- **`requests`**: Family data, needs, status (pending→assigned→resolved)
- **`request_vectors`**: Vector embeddings for semantic matching
- **`shelter_vectors`**: Vector embeddings for shelter features
- **`agent_logs`**: Complete audit trail of agent activities
- **`rebalance_suggestions`**: Automated load balancing recommendations

### 🔍 Advanced TiDB Vector Search Features
- **📊 Native Vector Functions**: VEC_COSINE_DISTANCE(), VEC_L2_DISTANCE() with optimized performance
- **🚀 HNSW Indexing**: Hierarchical Navigable Small World indexes for sub-second similarity search at scale
- **🧠 Hybrid Search**: Combine semantic vector search with traditional SQL filtering for precise results
- **� Multi-Dimensional Support**: VECTOR(1536) columns with intelligent dimension padding (768→1536)
- **⏱️ Real-Time Vector Updates**: Live embedding generation and storage during agent workflow execution
- **🔍 Agent Transparency**: Complete audit trail of vector search results, similarity scores, and decision logic
- **📈 Performance Analytics**: Vector search timing, similarity score distributions, and search quality metrics

## 🎯 Usage Guide

### For Coordinators
1. **Monitor Dashboard**: View real-time shelter status and family requests
2. **Resolve Requests**: Click "Resolved" → select shelter → confirm assignment
3. **Capacity Management**: Watch alerts for overcrowded shelters
4. **Track Progress**: Review resolved requests and occupancy statistics

### For Families (Intake)
1. **Submit Request**: Use intake form to register shelter needs
2. **Track Status**: Monitor request status (pending → assigned → resolved)
3. **Get Directions**: Receive shelter assignment with location details

### For Administrators
1. **Manage Shelters**: Add/update shelter information and capacity
2. **Monitor Agents**: Review automated decision-making in agent logs
3. **Rebalancing**: Approve or reject rebalancing suggestions
4. **System Health**: Monitor API performance and database connectivity

## 🧪 Development & Testing

### Running Tests
```bash
# Backend API tests
cd backend && npm test

# Frontend component tests  
cd frontend && npm test

# Database integration tests
cd backend && npm run test:db
```

### 🧪 Development & Demo Features
- ✅ **Intelligent Mock Embeddings**: Deterministic 1536-dimensional vectors for consistent development
- 🔄 **Sample TiDB Data**: Pre-populated shelters and requests with real vector embeddings
- 🎯 **Gemini Fallbacks**: Automatic fallback to mock embeddings when API keys are unavailable
- 📍 **Geographic Simulation**: Realistic coordinates and distance calculations for shelter matching
- 🤖 **Complete Agent Demo**: Full 7-step workflow execution with comprehensive logging

## 🚀 Deployment

### Production Checklist
- [ ] Set up TiDB Serverless database
- [ ] Configure environment variables
- [ ] Set up gemini API key (optional)
- [ ] Deploy backend (Railway/Render/DigitalOcean)
- [ ] Deploy frontend (Vercel/Netlify/CloudFlare)
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and logging

### Docker Deployment
```bash
# Quick deployment with Docker
docker-compose up -d --build

# Access application
open http://localhost:3000  # Backend
open http://localhost:5173  # Frontend
```

## 🏆 Project Accomplishments

### ✅ **TiDB Vector Search Implementation**
- **VECTOR(1536) Schema**: Fully implemented TiDB vector columns with proper indexing
- **VEC_COSINE_DISTANCE Queries**: Native TiDB vector similarity search with optimized performance
- **HNSW Indexing**: Hierarchical Navigable Small World indexes for sub-second search at scale
- **Hybrid Search**: Combined vector similarity with traditional SQL filtering for precise matches

### ✅ **Google Gemini API Integration**
- **text-embedding-004 Model**: Latest Google embedding model with 768-dimensional vectors
- **Intelligent Dimension Padding**: Automatic 768→1536 dimension conversion for TiDB compatibility
- **Robust Error Handling**: Graceful fallback to deterministic mock embeddings for development
- **API Key Management**: Secure configuration with environment variable best practices

### ✅ **7-Step Multi-Agent Workflow**
- **Complete Agent Chain**: Intake → Embedding → Vector Search → Matching → Routing → Assignment → Rebalancing
- **Comprehensive Logging**: Full audit trail of agent decisions and vector search results
- **State Management**: Proper workflow state tracking with database persistence
- **Real-time Execution**: Live agent workflow monitoring with performance metrics

### ✅ **Production-Ready Backend**
- **Express.js API**: RESTful endpoints with comprehensive middleware stack
- **TiDB Integration**: Optimized MySQL2 connection with prepared statements and pooling
- **Security Hardening**: Helmet, CORS, rate limiting, input validation, API key protection
- **Error Handling**: Robust error management with proper HTTP status codes and logging

### ✅ **Advanced Database Architecture**
- **Vector Storage**: Efficient VECTOR(1536) storage with proper normalization
- **Similarity Search**: Optimized queries using TiDB's native vector functions
- **Real-time Tracking**: Live occupancy management with capacity monitoring
- **Agent Audit Trail**: Comprehensive logging of all multi-step agent activities

### ✅ **Intelligent Matching System**
- **Semantic Understanding**: Vector embeddings capture nuanced family needs and shelter capabilities
- **Multi-factor Scoring**: Combines similarity, distance, capacity, and feature matching
- **Capacity Management**: Real-time occupancy tracking with overflow prevention
- **Geographic Optimization**: Distance-based routing with emergency protocol consideration

## 📈 Performance & Scalability

- **� Vector Search Performance**: Sub-second semantic matching with TiDB HNSW indexing
- **🧠 Embedding Generation**: Efficient Gemini API calls with intelligent caching and fallbacks
- **⚡ Real-Time Updates**: Live dashboard updates with agent workflow monitoring
- **🏗️ Horizontal Scaling**: Stateless backend design with TiDB Serverless auto-scaling
- **📊 Optimized Queries**: Prepared statements, connection pooling, and indexed vector operations
- **🔄 Intelligent Caching**: Vector embedding caching to minimize API calls and improve response times

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/shelterconnect.git`
3. Create a feature branch: `git checkout -b feature/awesome-feature`
4. Make your changes and test thoroughly
5. Commit with clear messages: `git commit -m "Add awesome feature"`
6. Push to your fork: `git push origin feature/awesome-feature`
7. Create a Pull Request with detailed description

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[TiDB Cloud](https://tidbcloud.com/)** - Vector database and serverless infrastructure with native VECTOR support
- **[Google AI](https://ai.google.dev/)** - Gemini API and text-embedding-004 model for semantic understanding
- **[Leaflet](https://leafletjs.com/)** - Open-source mapping library for interactive shelter visualization
- **[React](https://reactjs.org/)** & **[Node.js](https://nodejs.org/)** communities for excellent development frameworks
- **[TiDB AgentX Hackathon](https://tidb.io/agentic-ai-hackathon)** - Platform for showcasing agentic AI solutions with real-world impact

## 📞 Support & Community

- 📧 **Email**: [joe@anidas.dev](mailto:joe@anidas.dev)
- � **GitHub Issues**: [Report bugs or request features](https://github.com/joe-anidas/shelterconnect/issues)
- 📖 **Documentation**: [Comprehensive guides](./documentation.md)
- 🔧 **Environment Setup**: [Detailed setup guide](./ENVIRONMENT_SETUP.md)

---

<div align="center">
  <p><strong>Built with ❤️ for humanitarian impact</strong></p>
  <p>ShelterConnect AI - Connecting families with safety through intelligent coordination</p>
</div>

- SMS/WhatsApp chatbot integration for intake
- IoT sensor data ingestion (shelter occupancy auto-updates)
- Cross-region coordination (multi-database setup)
- Predictive analytics (forecast shelter overflow before it happens)
- Mobile app for families and coordinators
- Integration with emergency services APIs

---

## 🎯 **TiDB AgentX Hackathon Showcase**

**ShelterConnect AI demonstrates the complete integration of:**

### 🔍 **TiDB Vector Search Excellence**
- Native VECTOR(1536) columns with optimized storage and retrieval
- VEC_COSINE_DISTANCE functions for semantic similarity search
- HNSW indexing for sub-second performance at scale
- Hybrid vector + SQL queries for precise shelter matching

### 🤖 **Multi-Step Agentic AI Workflow**
- 7-step intelligent agent chain with comprehensive state management
- Google Gemini integration with intelligent dimension padding
- Complete audit trail and decision transparency
- Real-world humanitarian impact through disaster relief coordination

### 🚀 **Production-Ready Implementation**
- Robust backend with security hardening and error handling
- Real-time dashboard with live agent monitoring
- Scalable architecture with TiDB Serverless auto-scaling
- Comprehensive testing with mock data and fallback systems

---

<div align="center">
  <h3>🏆 Built for TiDB AgentX Hackathon: Forge Agentic AI for Real-World Impact</h3>
  <p><strong>Demonstrating the power of TiDB Vector Search + Multi-Agent AI in humanitarian relief coordination</strong></p>
  <p><em>Connecting displaced families with safety through intelligent, semantic shelter matching</em></p>
</div>
