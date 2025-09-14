
1) Project — TiDB-AgentX compliant, trimmed for 48-hour MVP
Name: ShelterConnect AI — Agentic Shelter Coordination (TiDB AgentX Demo)
Tagline: Real-time multi-step agent that ingests family requests, searches TiDB (vectors + full-text), assigns shelters, and triggers rebalancing when occupancy crosses thresholds — demoable with mock data.
Agent building blocks used (minimum 2 as required):
Ingest & Index Data — vector + full-text into TiDB Serverless


Search Your Data — vector similarity + full-text filters in queries


Chain LLM Calls — LLM summarization (optional but useful for human-readable assignment notes)


Invoke External Tools — Maps API for distance & ETA (or mocked)


Automated Workflow (multi-step):
Intake agent: receive family request (form/SMS mock) → vectorize → store in TiDB (metadata + vector)


Matching agent: vector search + full-text constraints → shortlist shelters → score by distance & capacity


Routing agent: call Maps API (or calculate haversine) → ETA and route suggestion


Rebalance watcher agent: monitors occupancy; when shelter > 80%, auto-suggest reassignments and push notifications to coordinator dashboard


This satisfies “chain together at least two building blocks” and is demonstrable.

2) Website flow (user journeys & page-by-page)
Goal: Judges should immediately see the multi-step flow in the demo: Intake → Match → Assigned → Rebalance.
Pages
Landing / Project Overview


Short pitch, demo video, “Run in 1 click” instructions, TiDB account Email field for submission.


Intake (Public) — /intake


Simple form: Name, #people, needs (medical, elderly, children, pets), location (lat/lng or address), contact (phone), urgency, optional note.


On submit: creates a request in TiDB and shows “Assigned to Shelter X” once agent completes.


Coordinator Dashboard — /dashboard (main judge UI)


Map view with shelters (pins color-coded by occupancy: green/yellow/red).


Live incoming requests feed (stream).


Agent actions log (e.g., “Matched Request #123 → Shelter B: 2.4 km, ETA 12m”).


Rebalance alerts panel (items that triggered >80% threshold).


Manual confirm / override buttons on assignments.


Shelter Admin — /shelters


CRUD list of shelters (name, capacity, features, coords, current occupancy).


Quick update occupancy control (simulate occupancy changes during demo).


Simulations / Demo Controls — /simulate


Buttons to “simulate earthquake cluster”, “simulate 20 random family requests”, or toggle “auto-increment occupancy” — use for demo video.


Docs / README — /docs


Link to repository, run instructions, TiDB account email field, license.


Primary flows (what judges will watch)
Demo 1: Submit an intake → watch matching agent assign a shelter → map pan & pin highlight → arrival ETA shown in feed.


Demo 2: Increase occupancy on assigned shelter to >80% (via Shelter Admin or simulate) → Rebalance agent recommends moving some families → dashboard shows suggestions and confirms after click.


Demo 3 (optional): Show LLM summary for an assignment (human readable text: “Family of 5 (two kids) assigned to Shelter B — wheelchair access + medical tent available”).



3) Full Documentation / README (copy into README.md)
Below is the README content ready to paste to your repo. It’s structured so judges can run quickly.

README.md — ShelterConnect AI (TiDB AgentX Hackathon)
1. One-line summary
ShelterConnect AI — an agentic multi-step demo that ingests family shelter requests, uses TiDB Serverless (vector + full-text) to match to shelters, and performs real-time dynamic rebalancing when occupancy limits are hit.
2. Why it matches TiDB AgentX
Uses TiDB Serverless for vector storage and full-text search.


Demonstrates multi-step agents: ingestion → search → routing → rebalance.


Invokes external tool (Maps) and chains LLM summaries for human-readable outputs.


3. Repo contents
shelterconnect-ai/
├── backend/
│   ├── ingest/        # vectorization + intake handlers
│   ├── agents/        # matching_agent.py, rebalance_agent.py, routing_agent.py
│   ├── db/            # TiDB schema & helper queries
│   └── api/           # FastAPI endpoints
├── frontend/
│   ├── pages/         # Next.js pages (landing, intake, dashboard)
│   └── components/    # Map, ShelterCard, RequestFeed, AgentLog
├── demo/
│   └── demo-script.md
├── README.md
└── .env.example

4. Architecture (brief)
Frontend (Next.js + Tailwind) — intake form, dashboard, map, simulation controls.


Backend (FastAPI) — exposes endpoints for intake, shelter CRUD, simulation, and agent triggers.


TiDB Serverless — stores shelters, requests, vectors, and agent logs.


LLM — optional, for generating human-readable assignment summaries.


Maps API — route distance & ETA (can be mocked during hackathon if keys unavailable).


5. TiDB Schema (example SQL)
Note: adapt vector column type & index to TiDB Serverless vector support. Below are example SQL statements (pseudo-SQL where TiDB vector syntax may vary slightly).
-- shelters table
CREATE TABLE shelters (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  capacity INT,
  occupancy INT DEFAULT 0,
  features TEXT,          -- comma-separated: "medical,wheelchair,pet-friendly"
  lat DOUBLE,
  lng DOUBLE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- family requests (metadata)
CREATE TABLE requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  people_count INT,
  needs TEXT,             -- free-text needs
  features_required TEXT, -- e.g., "wheelchair,medical"
  lat DOUBLE,
  lng DOUBLE,
  status ENUM('pending','assigned','rebalanced','completed') DEFAULT 'pending',
  assigned_shelter_id BIGINT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- vectors: embeddings stored in vector column
CREATE TABLE request_vectors (
  request_id BIGINT PRIMARY KEY,
  embedding VECTOR(1536), -- size depends on LLM/vectorizer
  FOREIGN KEY (request_id) REFERENCES requests(id)
);

CREATE TABLE shelter_vectors (
  shelter_id BIGINT PRIMARY KEY,
  embedding VECTOR(1536),
  FOREIGN KEY (shelter_id) REFERENCES shelters(id)
);

-- agent logs
CREATE TABLE agent_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  agent_name VARCHAR(100),
  request_id BIGINT NULL,
  shelter_id BIGINT NULL,
  action TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- index examples (full-text)
CREATE FULLTEXT INDEX idx_shelter_features ON shelters(features);
CREATE FULLTEXT INDEX idx_request_needs ON requests(needs);

6. Example queries (pseudo SQL + comments)
Vector similarity search (find top 5 shelters similar to request embedding)
-- Pseudo: assumes TiDB supports `VECTOR_SIMILARITY` / `ORDER BY vector_cosine_distance(...)`
SELECT s.*, SIMILARITY(sv.embedding, rv.embedding) AS sim
FROM shelter_vectors sv
JOIN shelters s ON sv.shelter_id = s.id
JOIN request_vectors rv ON rv.request_id = :request_id
ORDER BY sim DESC
LIMIT 5;

Full-text + filter (restrict by features)
SELECT * FROM shelters
WHERE MATCH(features) AGAINST ('+wheelchair +medical' IN BOOLEAN MODE)
AND capacity - occupancy > 0
ORDER BY (capacity - occupancy) DESC
LIMIT 10;

Occupancy update
UPDATE shelters SET occupancy = occupancy + :num WHERE id = :shelter_id;

7. API Endpoints (FastAPI style)
POST /api/intake
 Request body:
{
  "name":"Ravi",
  "people_count":4,
  "needs":"medical aid, child",
  "features_required":["medical","child-friendly"],
  "lat":13.0827,
  "lng":80.2707
}

Behavior:
Store request in requests


Vectorize needs text using embedder → store in request_vectors


Trigger matching_agent (async) which writes assignment & logs


GET /api/dashboard
 Response: list of shelters + occupancy + pending requests + agent logs
POST /api/simulate
 Body: { "scenario":"earthquake","count":20 } → creates N mock requests
POST /api/shelter/:id/update-occupancy
 Body: { "occupancy": 45 } → direct update (for demo).
8. Agents (pseudo code / behavior)
matching_agent(request_id):
Load request embedding from request_vectors.


Vector similarity search against shelter_vectors → top N candidates.


Filter candidates by capacity and full-text match on features_required.


Score candidates by: (similarity * 0.6) + (distance score * 0.3) + (free capacity ratio * 0.1).


Pick top candidate and update requests.assigned_shelter_id and status='assigned'.


Insert agent log: Assigned request X to Shelter Y — score Z.


Optionally call LLM to produce human summary and store in logs.


rebalance_agent(): (runs every 30s or triggered)
Query shelters where occupancy >= 0.8 * capacity.


For all requests assigned to that shelter with status='assigned' and ETA > X, find alternative shelter using same matching logic (excluding overloaded shelter).


Suggest reassignments: log suggestions to dashboard; auto-apply if auto_rebalance=true in config.


routing_agent(request_id, shelter_id):
Compute route & ETA using Maps API or haversine + speed assumption.


Store ETA in agent_logs for display.


9. Run instructions (quick)
Create TiDB Serverless instance and get connection string. (Paste into .env)


cd backend


create virtualenv, pip install -r requirements.txt


set env vars: TIDB_DSN, OPENAI_API_KEY (optional), MAPS_API_KEY (optional)


uvicorn api.main:app --reload


cd frontend


npm install (Next.js + Tailwind)


npm run dev


Open http://localhost:3000 → Dashboard → Simulate → see intake → matching → rebalancing


10. Demo script (3 minutes)
0:00–0:15: Intro + problem statement.


0:15–0:45: Submit intake form (Family of 4, medical need) → show POST to /api/intake.


0:45–1:15: Watch matching_agent assign to Shelter B, map highlights and ETA appears.


1:15–1:50: Increase occupancy of Shelter B to 85% → rebalance_agent suggests moving some assigned families → show confirmation click.


1:50–2:30: Show agent logs, LLM summary, open-source repo, instructions to run. End.


11. Licensing & submission
Add MIT license to repo for Best Open Source eligibility if you want that prize.



4) Prompts to make an AI completely create the frontend (Next.js + Tailwind) — use sequentially
Below are ready-to-run prompts for a code-generation assistant. Use them in order. I include the system prompt (set once), and then per-task prompts that produce specific files. Each prompt also includes test instructions & expected outputs so you can validate quickly.
Note: If you use an agent that can run commands, ask it to create a git branch feat/frontend and commit each file.

System prompt (use once at start)
SYSTEM:
You are a senior full-stack developer assistant. Produce complete Next.js (app directory optional) code with Tailwind CSS for a small production-like frontend. Keep code modular, well-documented, and ready-to-run. Output only the files requested (no extra explanation). When asked to create a page or component, return the file path and full file content inside a fenced code block. Assume backend API endpoints exist (see spec). Avoid proprietary map SDKs—use leaflet/react-leaflet for maps with a fallback static map if leaflet isn't available. Ensure pages are responsive. Use semantic HTML and accessibility attributes. When components require sample data, include a sample `mockData.js` in `frontend/data/`. Use default exports. If asked to create many files, respond with multiple file blocks in one message.


Prompt 1 — scaffold project (run first)
TASK:
Create Next.js project files required to run the frontend. Output the following files with exact file paths and full contents:

1. frontend/package.json — include scripts: dev, build, start.
2. frontend/tailwind.config.js — minimal config.
3. frontend/postcss.config.js
4. frontend/next.config.js — minimal
5. frontend/pages/_app.js — Tailwind import and basic layout wrapper.
6. frontend/pages/index.js — Landing page (small).
7. frontend/pages/intake.js — Intake form page (component imports allowed).
8. frontend/pages/dashboard.js — Dashboard layout page (map + feed).
9. frontend/components/ShelterCard.js — shows shelter info, occupancy bar, features.
10. frontend/components/RequestFeed.js — shows incoming request list.
11. frontend/components/MapView.js — react-leaflet Map component that displays shelter pins and centers to a given lat/lng prop.
12. frontend/data/mockData.js — simple sample shelters and requests.

Make sure imports/exports match. Use React functional components. Keep styling with Tailwind classes. Return all files in one message as separate fenced code blocks.

Expected result: a runnable Next.js skeleton. Validate: npm install & npm run dev should start (you may need to run npx create-next-app normally; but files are ready to drop into a Next project).

Prompt 2 — Intake page behavior & API call
TASK:
Create frontend/pages/intake.js with a form that POSTs to /api/intake. Use client-side fetch. After successful submit, show a toast/confirmation panel with the assigned shelter returned by the backend. Include basic form validation. If backend returns { assigned_shelter: {...} } show assignment card with shelter details. Use Tailwind classes. Assume backend API base path is same origin.
Output the full file content only.

Expected result: form that submits and handles the response JSON.

Prompt 3 — Dashboard: polling & agent logs
TASK:
Create frontend/pages/dashboard.js. This page should:
- Poll GET /api/dashboard every 5 seconds and update UI.
- Render MapView with shelters props.
- Render RequestFeed with requests.
- Render Agent action log panel that shows agent log entries.
- Show a Rebalance Alerts panel listing suggestions from backend (if any).
Make the file robust to missing backend (show placeholders).
Output full file.


Prompt 4 — MapView & interactivity
TASK:
Create frontend/components/MapView.js using react-leaflet. It should:
- Accept props: shelters (array), focusedRequest (optional), onShelterClick callback.
- For each shelter, render a CircleMarker with color depending on occupancy ratio (green <=60%, yellow 60-80%, red >80%).
- On marker click call onShelterClick(shelter).
- If focusedRequest provided, center map on the request location and show request icon.
- Include a fallback message if window or leaflet isn't present (server-side).
Output full file.

Note: If react-leaflet packages are not installed, the user can npm i react-leaflet leaflet.

Prompt 5 — UI components & polish
TASK:
Create:
- frontend/components/ShelterCard.js (if not yet)
- frontend/components/RequestFeed.js (if not yet)
- frontend/components/AgentLog.js
Each component should be small, documented, and export default. Use Tailwind and props-driven rendering.
Output each file in its own code block.


Prompt 6 — Mock simulator page
TASK:
Create frontend/pages/simulate.js — a page with three buttons:
- "Create 10 random requests" → POST /api/simulate {scenario:"random","count":10}
- "Increase Shelter occupancy" → opens modal to select shelter and set occupancy
- "Run rebalance" → POST /api/agents/rebalance
Add UI feedback on result. Output full file.


Prompt 7 — index page polish & demo video link
TASK:
Update frontend/pages/index.js to include one-click demo controls: link to /simulate and embedded demo script text explaining the 3-minute demo. Output full file.


Prompt 8 — production build check
TASK:
Generate a short script file: frontend/scripts/check-build.sh (executable) that runs `npm run build` and exits non-zero on error. Output full file contents.


How to run these prompts
Use the system prompt once.


Run Prompt 1 → it will produce all base files. Commit them.


Run Prompt 2..7 sequentially to fill in features.


npm install (add react-leaflet, leaflet, swr optional).


npm run dev.



5) Example files (two compact samples you can paste now)
Below are two small, ready-to-use frontend files to get you started quickly — drop them into frontend/components/ShelterCard.js and frontend/pages/intake.js. These are intentionally concise, well-commented, and use Tailwind.

frontend/components/ShelterCard.js
// frontend/components/ShelterCard.js
import React from "react";

export default function ShelterCard({ shelter, onClick }) {
  const ratio = shelter.capacity ? (shelter.occupancy / shelter.capacity) : 0;
  const percent = Math.round(ratio * 100);
  const barColor =
    ratio > 0.8 ? "bg-red-500" : ratio > 0.6 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className="p-4 rounded-lg shadow-sm border hover:shadow-md transition cursor-pointer" onClick={() => onClick?.(shelter)}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{shelter.name}</h3>
          <p className="text-sm text-gray-600">{shelter.features || "No features listed"}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Occupancy</div>
          <div className="text-sm font-medium">{shelter.occupancy}/{shelter.capacity}</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="w-full h-3 bg-gray-200 rounded">
          <div className={`${barColor} h-3 rounded`} style={{ width: `${Math.min(percent,100)}%` }} />
        </div>
        <div className="mt-1 text-xs text-gray-500">{percent}% full</div>
      </div>
    </div>
  );
}


frontend/pages/intake.js
// frontend/pages/intake.js
import React, { useState } from "react";
import ShelterCard from "../components/ShelterCard";

export default function IntakePage() {
  const [form, setForm] = useState({ name:"", people_count:1, needs:"", lat:"", lng:"" });
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/intake", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // expected { assigned_shelter: {...} }
      setAssignment(data.assigned_shelter || null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Family Intake Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input className="w-full mt-1 border rounded p-2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm font-medium">People count</label>
          <input type="number" min="1" className="w-32 mt-1 border rounded p-2" value={form.people_count} onChange={e=>setForm({...form,people_count:parseInt(e.target.value||1)})} />
        </div>
        <div>
          <label className="block text-sm font-medium">Needs (brief)</label>
          <input className="w-full mt-1 border rounded p-2" value={form.needs} onChange={e=>setForm({...form,needs:e.target.value})} placeholder="medical, wheelchair, child" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">Latitude</label>
            <input className="w-full border rounded p-2" value={form.lat} onChange={e=>setForm({...form,lat:e.target.value})} placeholder="13.0827" />
          </div>
          <div>
            <label className="block text-sm">Longitude</label>
            <input className="w-full border rounded p-2" value={form.lng} onChange={e=>setForm({...form,lng:e.target.value})} placeholder="80.2707" />
          </div>
        </div>

        <div>
          <button className="bg-sky-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}
      </form>

      {assignment && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Assigned Shelter</h2>
          <div className="mt-3">
            <ShelterCard shelter={assignment} onClick={()=>{}} />
          </div>
        </div>
      )}
    </div>
  );
}


6) Quick dev tips, priorities for 48-hour build
Prioritize backend endpoints (/api/intake, /api/dashboard, /api/simulate, /api/agents/rebalance) and simple in-memory mock if TiDB access isn't ready. Judges accept mock data if agent logic is clear. But show TiDB queries in README.


Polish Dashboard visuals: map + occupancy color bars + an agent log — judges love visible agent chain logs.


Demo script: rehearse to hit the “rebalance >80%” moment — visually strong.


Open-source: commit early, add MIT LICENSE, set repo public or give judge access.



7) Anything else you want now?
I can:
generate all frontend files (full code) and paste them here (large).


or generate a ready-to-drop frontend.zip (I can produce the file contents as code blocks for you to copy).


or write the backend FastAPI skeleton + sample matching_agent code (TiDB queries included).


Tell me which of the three you want next — I’ll generate the files directly (no waiting).


