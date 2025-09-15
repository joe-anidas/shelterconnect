# 🏠 ShelterConnect AI

**Multi-Agent Disaster Relief Coordination System with Real-Time Resolution Management**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TiDB](https://img.shields.io/badge/TiDB-Serverless-orange.svg)](https://tidb.cloud/)

ShelterConnect AI is an intelligent disaster relief coordination platform that uses multi-agent architecture, vector search, and real-time occupancy management to efficiently match displaced families with available shelters during emergencies.

## 🎯 Problem Statement

During disasters (floods, earthquakes, cyclones), displaced families face critical challenges:

- **Inefficient Shelter Matching** – Families directed to full shelters or inappropriate facilities
- **Manual Coordination** – Relief coordinators overwhelmed with scattered data and manual processes
- **Resource Misallocation** – Some shelters overflow while others remain underutilized
- **Delayed Response** – High-urgency requests get lost in manual triaging processes
- **Capacity Management** – No real-time tracking of shelter occupancy and availability

## 🚀 Solution Overview

ShelterConnect AI provides:

1. **🤖 Multi-Agent Architecture** – Specialized AI agents for intake, matching, routing, and rebalancing
2. **🔍 Vector Search** – Semantic matching of family needs with shelter capabilities using TiDB Serverless
3. **📍 Real-Time Mapping** – Interactive shelter maps with live occupancy status
4. **⚡ Smart Resolution** – One-click request resolution with automatic occupancy management
5. **🔄 Dynamic Rebalancing** – Automated suggestions for optimal shelter utilization
6. **📊 Live Dashboard** – Real-time monitoring and coordination interface

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

### Multi-Agent Workflow

```
📝 Intake Agent → 🎯 Matching Agent → 🗺️ Routing Agent → ⚖️ Rebalance Agent
     ↓               ↓                 ↓                    ↓
  Family Request   Shelter Match    Route Planning     Load Balancing
  + Vector Store   + Vector Search  + ETA Calculation  + Occupancy Monitor
```

## 🤖 Multi-Agent System

### 1. 📝 Intake Agent
- **Purpose**: Process incoming family requests
- **Actions**: 
  - Vectorize family needs using OpenAI embeddings
  - Store requests in TiDB with metadata + semantic vectors
  - Log all activities for transparency and auditing
  - Validate and sanitize input data

### 2. 🎯 Matching Agent  
- **Purpose**: Find optimal shelter matches
- **Actions**:
  - Perform vector similarity search against shelter embeddings
  - Apply full-text filters for required features (medical, wheelchair, etc.)
  - Calculate composite scores (distance + capacity + feature match)
  - Automatic shelter assignment based on availability

### 3. 🗺️ Routing Agent
- **Purpose**: Optimize travel logistics
- **Actions**:
  - Calculate ETA based on distance and urgency level
  - Generate turn-by-turn route instructions
  - Optimize bulk routing for multiple requests
  - Consider traffic and emergency route preferences

### 4. ⚖️ Rebalance Agent
- **Purpose**: Maintain optimal shelter utilization  
- **Actions**:
  - Monitor real-time occupancy across all shelters
  - Trigger rebalancing alerts when capacity exceeds 80%
  - Generate relocation suggestions with minimal disruption
  - Predict capacity issues before they occur

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
- **Node.js + Express**: RESTful API server with middleware
- **TiDB Serverless**: Vector database for embeddings + traditional SQL
- **OpenAI API**: Text embedding generation for semantic search
- **MySQL2**: Database connection with prepared statements
- **Security**: Helmet, CORS, rate limiting, input validation

### Frontend  
- **React 18 + TypeScript**: Modern React with type safety
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first styling framework
- **Leaflet**: Interactive mapping with shelter visualization
- **Lucide React**: Consistent icon library

### Database Schema
- **Shelters**: Location, capacity, features, occupancy tracking
- **Requests**: Family data, needs, status, resolution tracking  
- **Vectors**: Semantic embeddings for both shelters and requests
- **Agent Logs**: Comprehensive audit trail of all agent actions

## � Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **TiDB Serverless** account ([Sign up here](https://tidbcloud.com/))
- **OpenAI API key** (optional, for vector embeddings)

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
   # Edit .env with your TiDB and OpenAI credentials
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Copy and configure environment variables  
   cp .env.example .env
   # Edit .env with your API endpoints
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   cd backend
   node run_migration.js
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

# OpenAI API (for vector embeddings)
OPENAI_API_KEY=your_openai_api_key

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

### 🤖 Agents & Dashboard
```
GET    /api/agents/logs           # Get agent activity logs
POST   /api/agents/rebalance      # Trigger rebalance suggestions
GET    /api/dashboard/overview    # Dashboard statistics
GET    /api/dashboard/realtime    # Real-time updates
```

## 🗄️ Database Schema

### Core Tables
- **`shelters`**: Location, capacity, features, current occupancy
- **`requests`**: Family data, needs, status (pending→assigned→resolved)
- **`request_vectors`**: Vector embeddings for semantic matching
- **`shelter_vectors`**: Vector embeddings for shelter features
- **`agent_logs`**: Complete audit trail of agent activities
- **`rebalance_suggestions`**: Automated load balancing recommendations

### Key Database Features
- **📊 Vector Search**: TiDB Serverless vector columns for semantic matching
- **🔍 Full-Text Search**: MySQL FULLTEXT indexes for feature filtering  
- **⏱️ Real-Time Tracking**: Timestamp-based change tracking
- **🔍 Agent Transparency**: Complete audit trail of all decisions

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

### Mock Data Mode
- ✅ **Works offline**: Full functionality without external APIs
- 🔄 **Sample data**: Pre-loaded shelters and requests for testing
- 🎯 **Vector fallbacks**: Mock embeddings for development
- 📍 **Location mocks**: Simulated coordinates and routing

## 🚀 Deployment

### Production Checklist
- [ ] Set up TiDB Serverless database
- [ ] Configure environment variables
- [ ] Set up OpenAI API key (optional)
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

## 📈 Performance & Scalability

- **🔍 Vector Search**: Sub-second semantic matching with TiDB vectors
- **⚡ Real-Time Updates**: WebSocket connections for live dashboard updates
- **🏗️ Horizontal Scaling**: Stateless backend design for easy scaling
- **📊 Efficient Queries**: Optimized database indexes and prepared statements
- **🔄 Caching**: Redis integration for frequently accessed data

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

- **[TiDB Cloud](https://tidbcloud.com/)** - Vector database and serverless infrastructure
- **[OpenAI](https://openai.com/)** - Embedding generation for semantic search
- **[Leaflet](https://leafletjs.com/)** - Open-source mapping library
- **[React](https://reactjs.org/)** & **[Node.js](https://nodejs.org/)** communities

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

**Built with ❤️ for the TiDB AgentX Hackathon**

*Demonstrating the power of multi-step AI agents in humanitarian relief coordination*
