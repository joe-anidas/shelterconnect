import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Brain, MapPin, Users, AlertTriangle, Play, ExternalLink } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-4">
          <Zap className="h-4 w-4 mr-2" />
          TiDB AgentX Hackathon Demo
        </div>
        
        <h1 className="text-5xl font-bold text-slate-900 mb-6">
          ShelterConnect AI
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
          Multi-step agentic workflow that ingests family requests, uses TiDB Serverless for vector + full-text search, 
          and performs real-time dynamic rebalancing when occupancy limits are reached.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link 
            to="/simulate" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Play className="h-5 w-5 mr-2" />
            Run Demo
          </Link>
          <Link 
            to="/intake" 
            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <Users className="h-5 w-5 mr-2" />
            Try Intake Form
          </Link>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
          >
            <Shield className="h-5 w-5 mr-2" />
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Agent Workflow */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">Multi-Step Agent Workflow</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Intake Agent</h3>
            <p className="text-slate-600 text-sm">
              Receives family requests, vectorizes needs, stores in TiDB with metadata + embeddings.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">2. Matching Agent</h3>
            <p className="text-slate-600 text-sm">
              Vector similarity + full-text search to shortlist shelters, scores by distance & capacity.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Routing Agent</h3>
            <p className="text-slate-600 text-sm">
              Calculates routes and ETA using Maps API or haversine distance for optimal assignments.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">4. Rebalance Agent</h3>
            <p className="text-slate-600 text-sm">
              Monitors occupancy; when {'>'}80%, auto-suggests reassignments and pushes notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Highlights */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">TiDB AgentX Integration</h3>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Vector Storage:</strong> Request embeddings stored in TiDB Serverless vector columns</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Full-text Search:</strong> Features and needs matching with FULLTEXT indexes</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Chain LLM Calls:</strong> Human-readable assignment summaries</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>External Tools:</strong> Maps API integration for distance and routing</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Demo Features</h3>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Real-time Dashboard:</strong> Live agent activity and shelter status</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Interactive Map:</strong> Color-coded occupancy and live assignments</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Simulation Controls:</strong> Earthquake scenarios and batch requests</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Agent Logging:</strong> Transparent multi-step decision tracking</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Quick Start Demo</h3>
          <a 
            href="https://github.com/joe-anidas/shelterconnect" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View Repository
          </a>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
            <h4 className="font-semibold mb-2">Submit Family Request</h4>
            <p className="text-sm text-slate-600">Fill out intake form with family needs and location</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
            <h4 className="font-semibold mb-2">Watch Agent Assignment</h4>
            <p className="text-sm text-slate-600">See matching agent find optimal shelter with real-time logs</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
            <h4 className="font-semibold mb-2">Trigger Rebalancing</h4>
            <p className="text-sm text-slate-600">Simulate high occupancy and see automatic rebalancing</p>
          </div>
        </div>
      </div>
    </div>
  );
}