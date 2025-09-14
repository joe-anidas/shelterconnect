
ShelterConnect AI – Agentic Disaster Relief Coordination

1. Problem Statement
During disasters (floods, earthquakes, cyclones), displaced families struggle to find nearby available shelters. Relief coordinators face challenges such as:
Inefficient matching – Families may be directed to shelters that are already full.


Scattered data – Shelter availability, family needs, and logistics are tracked manually or across multiple systems.


Slow response – High-urgency requests get delayed due to lack of automated triaging.


Poor resource allocation – Some shelters remain underutilized while others overflow.



2. Proposed Solution
ShelterConnect AI is a multi-step agentic platform built on TiDB Serverless that:
Collects and indexes family requests with embeddings + full-text metadata.


Uses vector search + full-text filters in TiDB to find best-fit shelters based on needs, capacity, and distance.


Invokes external tools (e.g., maps API or haversine logic) for ETA and routing.


Chains an LLM for human-readable assignment summaries.


Runs a Rebalance Agent to continuously monitor occupancy and suggest relocations when shelters exceed 80% capacity.



3. Objectives
For families: quick assignment to the safest, nearest, and most suitable shelter.


For coordinators: centralized dashboard to monitor occupancy, track requests, and see AI recommendations.


For organizations: transparent, data-driven allocation process to maximize resource utilization.



4. Key Features
Intake Agent – Collects family data, vectorizes needs, stores in TiDB.


Matching Agent – Multi-step workflow combining vector search, full-text, and distance scoring.


Routing Agent – Calculates ETA and suggested path to shelter.


Rebalance Agent – Triggers reallocation when shelters exceed safe thresholds.


Coordinator Dashboard – Live feed with maps, shelter status, request assignments, and logs.


Simulation Tools – Generate mock disaster requests for demo/testing.



5. Architecture Overview
Components
Frontend: React vite + Tailwind (forms, dashboard, map view).


Backend: FastAPI (APIs, agent logic, TiDB queries).


Database: TiDB Serverless (vector storage + full-text search).


LLM: Optional (OpenAI API for assignment summaries).


Maps API: External distance/ETA calculation (or haversine fallback).


Workflow
Intake → TiDB ingestion (requests + vector embeddings).


Search & Match (vector similarity + full-text needs + filters).


Route Calculation (maps API for ETA).


Assignment Log (write results in TiDB, visible on dashboard).


Rebalance Agent (monitor shelters >80% occupancy, trigger reallocation).



6. Tech Stack
Frontend:
React vite 


Tailwind CSS (UI styling)


React-Leaflet (maps visualization)


Backend:
FastAPI (Python API framework)


Agent modules (matching, rebalance, routing)


Database:
TiDB Serverless


Vector search for embeddings


Full-text search for needs/features


Structured queries for occupancy tracking


External Tools:
Maps API (distance + ETA)


OpenAI API (optional human-readable summaries)


Deployment:
TiDB Cloud (database)


Vercel / Netlify (frontend)


Render / Railway (backend)



7. Data Model (Simplified)
Shelters: id, name, capacity, occupancy, features, lat, lng


Requests: id, name, people_count, needs, lat, lng, assigned_shelter_id, status


Vectors: request_vectors, shelter_vectors


Agent Logs: id, agent_name, action, timestamp



8. Example Use Case Flow
A family of 4 submits a request: “Need medical help and wheelchair access.”


Intake Agent stores request in TiDB and creates embedding vector.


Matching Agent:


Vector similarity search with shelter embeddings.


Filter: wheelchair + medical features.


Score: similarity + capacity + distance.


Assigns to Shelter B (capacity 100, occupancy 65, 2.3 km away).


Routing Agent calculates ETA = 12 minutes.


LLM generates log summary: “Family of 4 (wheelchair, medical) assigned to Shelter B, 12 min ETA.”


Rebalance Agent detects occupancy >80% later → suggests reallocation.



9. Benefits
Real-world impact – can be extended for NGOs, municipalities, or disaster management authorities.


Scalable – TiDB handles structured + vector + full-text queries in one place.


Explainable – Agent logs show exactly why a decision was made.


Open-source – Transparent and reusable for humanitarian organizations.



10. Future Scope
SMS/WhatsApp chatbot integration for intake.


IoT sensor data ingestion (shelter occupancy auto-updates).


Cross-region coordination (multi-database setup).


Predictive analytics (forecast shelter overflow before it happens).



11. Conclusion
ShelterConnect AI demonstrates how multi-step AI agents, powered by TiDB Serverless, can coordinate disaster relief more efficiently. By combining vector search, full-text filters, external tools, and agentic workflows, it provides a robust, transparent, and scalable system for humanitarian impact.

👉 Do you want me to convert this into a formatted .docx Word file (with headings, subheadings, and table of contents), so you can directly submit it for the hackathon?

