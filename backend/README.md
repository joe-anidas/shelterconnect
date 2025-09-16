# ShelterConnect AI Backend

Multi-step agentic disaster relief coordination system built with Node.js, Express, and TiDB Serverless.

## Features

### 🤖 Multi-Step Agent Workflow
- **Intake Agent**: Processes family requests and generates embeddings
- **Matching Agent**: Vector similarity search + full-text filtering for optimal shelter matching
- **Routing Agent**: Calculates ETA and route optimization
- **Rebalance Agent**: Monitors occupancy and triggers rebalancing when shelters exceed 80% capacity

### 🏠 Core Functionality
- Shelter management with capacity tracking
- Family request processing with urgency classification
- Real-time occupancy monitoring
- Vector search for intelligent matching
- Agent activity logging and transparency

### 📊 Dashboard & Monitoring
- Real-time coordinator dashboard
- System health monitoring
- Agent performance statistics
- Rebalancing alerts and suggestions

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: TiDB Serverless (vector + full-text search)
- **AI/ML**: gemini API for embeddings
- **Maps**: Google Maps API for geocoding and routing
- **Security**: Helmet, CORS, Rate limiting

## API Endpoints

### Shelters
- `GET /api/shelters` - Get all shelters
- `GET /api/shelters/:id` - Get shelter by ID
- `POST /api/shelters` - Create new shelter
- `PUT /api/shelters/:id` - Update shelter
- `PATCH /api/shelters/:id/occupancy` - Update occupancy
- `GET /api/shelters/nearby/:lat/:lng` - Find nearby shelters
- `GET /api/shelters/available/:minCapacity` - Find available shelters
- `POST /api/shelters/search/features` - Search by features
- `GET /api/shelters/over-capacity/:threshold` - Find over-capacity shelters

### Requests
- `POST /api/requests` - Process new family request (Intake Agent)
- `GET /api/requests` - Get all requests
- `GET /api/requests/:id` - Get request by ID
- `GET /api/requests/status/pending` - Get pending requests
- `PATCH /api/requests/:id/status` - Update request status

### Agents
- `POST /api/agents/matching/find-match/:requestId` - Find best shelter match
- `POST /api/agents/matching/process-pending` - Process all pending requests
- `GET /api/agents/routing/calculate/:requestId` - Calculate route and ETA
- `GET /api/agents/rebalance/monitor` - Monitor occupancy levels
- `POST /api/agents/rebalance/execute` - Execute rebalancing suggestions
- `GET /api/agents/logs` - Get agent activity logs

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/realtime` - Get real-time updates
- `GET /api/dashboard/map-data` - Get map visualization data
- `GET /api/dashboard/health` - Get system health status

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database**:
   ```bash
   # Run the migration script
   mysql -h your-tidb-host -u your-username -p < migrations/create_shelterconnect_schema.sql
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration (TiDB Serverless)
DB_HOST=your-tidb-host
DB_USER=your-tidb-username
DB_PASSWORD=your-tidb-password
DB_NAME=shelterconnect_ai
DB_PORT=4000

# gemini API (for embeddings and LLM features)
gemini_API_KEY=your-gemini-api-key

# Google Maps API (for geocoding and routing)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Database Schema

The system uses the following main tables:

- **shelters**: Shelter information with capacity and features
- **requests**: Family requests with needs and location
- **request_vectors**: Vector embeddings for requests (TiDB vector columns)
- **shelter_vectors**: Vector embeddings for shelters
- **agent_logs**: Activity logs for all agents
- **rebalance_suggestions**: Rebalancing recommendations

## Agent Workflow

1. **Intake Agent**: Receives family request → Generates embedding → Stores in TiDB
2. **Matching Agent**: Vector similarity search → Feature filtering → Distance scoring → Assignment
3. **Routing Agent**: Calculates ETA → Generates route instructions
4. **Rebalance Agent**: Monitors occupancy → Triggers rebalancing when >80% capacity

## Development

The backend includes mock data and fallback functionality for development without external API keys:

- Mock embeddings when gemini API key is not provided
- Mock coordinates when Google Maps API key is not provided
- Sample shelter and request data for testing

## Production Deployment

For production deployment:

1. Set up TiDB Serverless database
2. Configure environment variables
3. Set up proper API keys
4. Deploy to your preferred platform (Railway, Render, etc.)
5. Configure CORS for your frontend domain

## API Documentation

The API follows RESTful conventions with JSON responses. All endpoints return:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
