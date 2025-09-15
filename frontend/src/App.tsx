import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Shield, Home, Users, BarChart3 } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import IntakePage from './pages/IntakePage';
import DashboardPage from './pages/DashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import SheltersPage from './pages/SheltersPage';
// import SimulatePage from './pages/SimulatePage';
// import VectorSearchDemoPage from './pages/VectorSearchDemoPage';

function App() {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('sc_is_admin') === 'true');

  useEffect(() => {
    const sync = () => setIsAdmin(localStorage.getItem('sc_is_admin') === 'true');
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sc_is_admin') {
        sync();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('sc_admin_change', sync as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('sc_admin_change', sync as EventListener);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('sc_is_admin');
    setIsAdmin(false);
    try {
      window.dispatchEvent(new Event('sc_admin_change'));
    } catch {}
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        {/* Navigation */}
        <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200/50 sticky top-0 z-[2000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-3 group">
        
                  <img src="/logo.png" alt="Logo" className="h-8 w-8 border border-slate-300 rounded-lg p-1" />
            
                  <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    ShelterConnect AI
                  </span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link 
                  to="/" 
                  className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link 
                  to="/intake" 
                  className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
                >
                  <Users className="h-4 w-4" />
                  <span>Intake</span>
                </Link>
                {isAdmin ? (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link 
                  to="/shelters" 
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold transform hover:scale-105"
                >
                  <Shield className="h-4 w-4" />
                  <span>Shelters</span>
                </Link>
                {isAdmin && (
                  <button
                    onClick={logout}
                    className="ml-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                  >
                    Logout
                  </button>
                )}
                {/* 
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
                */}
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/intake" element={<IntakePage />} />
          <Route path="/dashboard" element={isAdmin ? <DashboardPage /> : <Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/shelters" element={<SheltersPage />} />
          {/* <Route path="/vector-demo" element={<VectorSearchDemoPage />} /> */}
          {/* <Route path="/simulate" element={<SimulatePage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;