import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, Home, Users, BarChart3, Zap, Database } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import IntakePage from './pages/IntakePage';
import DashboardPage from './pages/DashboardPage';
import SheltersPage from './pages/SheltersPage';
import SimulatePage from './pages/SimulatePage';
import VectorSearchDemoPage from './pages/VectorSearchDemoPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <span className="text-xl font-bold text-slate-900">ShelterConnect AI</span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-8">
                <Link 
                  to="/" 
                  className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Overview</span>
                </Link>
                <Link 
                  to="/intake" 
                  className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Intake</span>
                </Link>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/shelters" 
                  className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Shelters</span>
                </Link>
                <Link 
                  to="/vector-demo" 
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <Database className="h-4 w-4" />
                  <span>TiDB Vector</span>
                </Link>
                <Link 
                  to="/simulate" 
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  <span>Demo</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/intake" element={<IntakePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/shelters" element={<SheltersPage />} />
          <Route path="/vector-demo" element={<VectorSearchDemoPage />} />
          <Route path="/simulate" element={<SimulatePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;