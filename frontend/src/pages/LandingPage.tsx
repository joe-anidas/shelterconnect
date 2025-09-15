import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Brain, MapPin, Users, AlertTriangle, ExternalLink, ArrowRight, CheckCircle, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                <Zap className="h-4 w-4 mr-2" />
                AI-Powered Disaster Relief Platform
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  ShelterConnect
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI</span>
                </h1>
                
                <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                  Multi-step agentic workflow that intelligently matches families in need with available shelters using advanced AI and real-time data processing.
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Real-time Processing
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    AI-Powered Matching
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Smart Rebalancing
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/intake" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center px-8 py-4 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl transition-all hover:bg-slate-50"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  View Dashboard
                </Link>
              </div>
            </div>
            
            {/* Right Side - Cover Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/cover.png" 
                  alt="ShelterConnect AI Platform Dashboard" 
                  className="w-full h-auto rounded-2xl"
                />

             
         
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Intelligent Multi-Agent System</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our AI-powered platform orchestrates multiple specialized agents to provide seamless disaster relief coordination
            </p>
          </div>
          
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            <div className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Intake Agent</h3>
                <p className="text-slate-600 leading-relaxed">
                  Intelligently processes family requests, extracts key information, and creates structured data for optimal matching.
                </p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Matching Agent</h3>
                <p className="text-slate-600 leading-relaxed">
                  Uses advanced AI algorithms to find optimal shelter matches based on family needs, capacity, and special requirements.
                </p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Routing Agent</h3>
                <p className="text-slate-600 leading-relaxed">
                  Calculates optimal routes and provides real-time directions to ensure families reach their assigned shelters efficiently.
                </p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Rebalance Agent</h3>
                <p className="text-slate-600 leading-relaxed">
                  Continuously monitors capacity and automatically redistributes families when shelters reach critical occupancy levels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Powered by Advanced Technology</h2>
            <p className="text-xl text-slate-600">
              Built with cutting-edge AI and database technologies for reliable, scalable disaster response
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Core Technologies</h3>
                <div className="space-y-4">
                  {[
                    { title: "AI-Powered Matching", desc: "Advanced algorithms for optimal family-shelter pairing", icon: Brain },
                    { title: "Real-time Processing", desc: "Instant data processing and decision making", icon: Zap },
                    { title: "Smart Routing", desc: "Intelligent path optimization and navigation", icon: MapPin },
                    { title: "Predictive Analytics", desc: "Forecasting and proactive resource management", icon: AlertTriangle }
                  ].map((tech, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <tech.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{tech.title}</h4>
                        <p className="text-slate-600 text-sm">{tech.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Key Features</h3>
              <div className="space-y-4">
                {[
                  "Real-time dashboard with live updates",
                  "Multi-agent coordination system",
                  "Intelligent capacity management",
                  "Emergency response automation",
                  "Transparent decision tracking",
                  "Scalable cloud infrastructure"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <a 
                  href="https://github.com/joe-anidas/shelterconnect" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Source Code
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience the Future of Disaster Relief?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join us in revolutionizing how we respond to emergencies with intelligent, AI-powered coordination systems.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/intake" 
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Users className="h-5 w-5 mr-2" />
              Start Demo Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
            <Link 
              to="/shelters" 
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all"
            >
              <Shield className="h-5 w-5 mr-2" />
              Explore Shelters
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">ShelterConnect AI</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Revolutionizing disaster relief through intelligent multi-agent systems and real-time coordination.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/joe-anidas/shelterconnect" className="text-slate-400 hover:text-white transition-colors">
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <div className="space-y-2">
                <Link to="/intake" className="block text-slate-400 hover:text-white transition-colors">Intake System</Link>
                <Link to="/dashboard" className="block text-slate-400 hover:text-white transition-colors">Dashboard</Link>
                <Link to="/shelters" className="block text-slate-400 hover:text-white transition-colors">Shelter Network</Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Technology</h3>
              <div className="space-y-2">
                <span className="block text-slate-400">Multi-Agent AI</span>
                <span className="block text-slate-400">Real-time Processing</span>
                <span className="block text-slate-400">Smart Routing</span>
                <span className="block text-slate-400">Predictive Analytics</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <div className="space-y-2">
                <a href="https://github.com/joe-anidas/shelterconnect" className="block text-slate-400 hover:text-white transition-colors">Documentation</a>
                <a href="https://github.com/joe-anidas/shelterconnect" className="block text-slate-400 hover:text-white transition-colors">API Reference</a>
                <a href="https://github.com/joe-anidas/shelterconnect" className="block text-slate-400 hover:text-white transition-colors">Source Code</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2025 ShelterConnect AI. Built for humanitarian impact.
            </p>
            <p className="text-slate-400 text-sm mt-4 md:mt-0">
              Powered by AI • Made with ❤️ for disaster relief
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}