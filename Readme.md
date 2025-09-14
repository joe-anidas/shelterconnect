# ShelterConnect AI

**Multi-step agentic disaster relief coordination system built for TiDB AgentX Hackathon**

ShelterConnect AI demonstrates how multi-step AI agents, powered by TiDB Serverless, can coordinate disaster relief more efficiently. By combining vector search, full-text filters, external tools, and agentic workflows, it provides a robust, transparent, and scalable system for humanitarian impact.

## 🎯 Problem Statement

During disasters (floods, earthquakes, cyclones), displaced families struggle to find nearby available shelters. Relief coordinators face challenges such as:

- **Inefficient matching** – Families may be directed to shelters that are already full
- **Scattered data** – Shelter availability, family needs, and logistics are tracked manually
- **Slow response** – High-urgency requests get delayed due to lack of automated triaging
- **Poor resource allocation** – Some shelters remain underutilized while others overflow

## 🚀 Solution

ShelterConnect AI is a multi-step agentic platform that:

1. **Collects and indexes** family requests with embeddings + full-text metadata
2. **Uses vector search** + full-text filters in TiDB to find best-fit shelters
3. **Invokes external tools** (maps API) for ETA and routing calculations
4. **Chains LLM calls** for human-readable assignment summaries
5. **Runs Rebalance Agent** to monitor occupancy and suggest relocations when shelters exceed 80% capacity

## 🤖 Multi-Step Agent Workflow

### 1. Intake Agent
- Receives family requests, vectorizes needs
- Stores in TiDB with metadata + embeddings
- Creates agent log entries for transparency

### 2. Matching Agent
- Vector similarity search with shelter embeddings
- Full-text filtering for required features
- Distance and capacity scoring
- Automatic shelter assignment

### 3. Routing Agent
- Calculates ETA based on distance and urgency
- Generates route instructions
- Bulk route optimization

### 4. Rebalance Agent
- Monitors shelter occupancy in real-time
- Triggers rebalancing when shelters exceed 80% capacity
- Generates reassignment suggestions

## 🏗️ Architecture

```
Frontend (React + TypeScript)     Backend (Node.js + Express)
├── Intake Form                   ├── Intake Agent Controller
├── Coordinator Dashboard         ├── Matching Agent Controller
├── Interactive Map               ├── Routing Agent Controller
├── Simulation Controls           ├── Rebalance Agent Controller
└── Real-time Updates            └── Agent Activity Logs

Database (TiDB Serverless)
├── Shelters Table
├── Requests Table
├── Vector Embeddings
├── Agent Logs
└── Rebalancing Suggestions

External APIs
├── OpenAI (Embeddings)
├── Google Maps (Geocoding/Routing)
└── TiDB Cloud (Vector Search)
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MySQL2** for TiDB connectivity
- **OpenAI API** for embeddings
- **Google Maps API** for geocoding

### Database
- **TiDB Serverless** for vector + full-text search
- **Vector columns** for embeddings
- **Full-text indexes** for feature matching
- **Structured queries** for occupancy tracking

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- TiDB Serverless account
- OpenAI API key (optional for demo)
- Google Maps API key (optional for demo)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd shelterconnect
   ```

2. **Set up environment variables**:
   ```bash
   ./setup-env.sh
   ```

3. **Install dependencies**:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Set up the database**:
   ```bash
   # Run the migration script in your TiDB Serverless instance
   mysql -h your-tidb-host -u your-username -p < backend/migrations/create_shelterconnect_schema.sql
   ```

5. **Start the development servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# TiDB Serverless
DB_HOST=your-tidb-host
DB_USER=your-tidb-username
DB_PASSWORD=your-tidb-password
DB_NAME=shelterconnect_ai
DB_PORT=4000

# OpenAI API (optional)
OPENAI_API_KEY=your-openai-api-key

# Google Maps API (optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=ShelterConnect AI
VITE_APP_VERSION=1.0.0
```

## 🎮 Demo Features

### 3-Minute Demo Script

1. **0:00 - 0:45**: Run "Earthquake Scenario" → Show intake processing → Watch agent assignments in dashboard
2. **0:45 - 1:30**: Go to Shelters page → Set occupancy to 85% → Return to dashboard → See rebalance alerts
3. **1:30 - 3:00**: Click "Trigger Rebalancing" → Show agent logs → Explain TiDB integration → Show repository

### Key Demo Features
- **Real-time Dashboard**: Live agent activity and shelter status
- **Interactive Map**: Color-coded occupancy and live assignments
- **Simulation Controls**: Earthquake scenarios and batch requests
- **Agent Logging**: Transparent multi-step decision tracking

## 📊 API Endpoints

### Shelters
- `GET /api/shelters` - Get all shelters
- `POST /api/shelters` - Create new shelter
- `GET /api/shelters/nearby/:lat/:lng` - Find nearby shelters
- `GET /api/shelters/over-capacity/:threshold` - Find over-capacity shelters

### Requests
- `POST /api/requests` - Process new family request (Intake Agent)
- `GET /api/requests/status/pending` - Get pending requests
- `PATCH /api/requests/:id/status` - Update request status

### Agents
- `POST /api/agents/matching/find-match/:requestId` - Find best shelter match
- `GET /api/agents/routing/calculate/:requestId` - Calculate route and ETA
- `GET /api/agents/rebalance/monitor` - Monitor occupancy levels
- `POST /api/agents/rebalance/execute` - Execute rebalancing suggestions
- `GET /api/agents/logs` - Get agent activity logs

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/realtime` - Get real-time updates
- `GET /api/dashboard/map-data` - Get map visualization data
- `GET /api/dashboard/health` - Get system health status

## 🗄️ Database Schema

### Core Tables
- **shelters**: Shelter information with capacity and features
- **requests**: Family requests with needs and location
- **request_vectors**: Vector embeddings for requests (TiDB vector columns)
- **shelter_vectors**: Vector embeddings for shelters
- **agent_logs**: Activity logs for all agents
- **rebalance_suggestions**: Rebalancing recommendations

### Key Features
- **Vector Search**: TiDB Serverless vector columns for semantic matching
- **Full-text Search**: MySQL FULLTEXT indexes for feature filtering
- **Real-time Updates**: Timestamp-based change tracking
- **Agent Transparency**: Complete audit trail of all agent decisions

## 🚀 Deployment

### Production Deployment

1. **Set up TiDB Serverless database**
2. **Configure environment variables**
3. **Deploy backend** to Railway/Render/etc.
4. **Deploy frontend** to Vercel/Netlify/etc.
5. **Configure CORS** for your domain

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🧪 Development

### Mock Data Mode
The system includes comprehensive mock data and fallback functionality for development without external API keys:

- Mock embeddings when OpenAI API key is not provided
- Mock coordinates when Google Maps API key is not provided
- Sample shelter and request data for testing

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TiDB** for providing the vector search capabilities
- **OpenAI** for embedding generation
- **Google Maps** for geocoding and routing
- **React** and **Node.js** communities for excellent tooling

## 📞 Support

For support, email support@shelterconnect.ai or join our Slack channel.

## 🔮 Future Scope

- SMS/WhatsApp chatbot integration for intake
- IoT sensor data ingestion (shelter occupancy auto-updates)
- Cross-region coordination (multi-database setup)
- Predictive analytics (forecast shelter overflow before it happens)
- Mobile app for families and coordinators
- Integration with emergency services APIs

---

**Built with ❤️ for the TiDB AgentX Hackathon**

*Demonstrating the power of multi-step AI agents in humanitarian relief coordination*
