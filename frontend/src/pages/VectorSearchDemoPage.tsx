// Vector Search Demo Page - TiDB Vector Search Showcase (Fixed Version)
import { useState, useEffect } from 'react';
import { 
  Brain, 
  Search, 
  Target, 
  Route, 
  MapPin, 
  Clock, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Database,
  Activity,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play
} from 'lucide-react';
import api from '../services/api';

// TypeScript Interfaces for better type safety
interface Request {
  id: number;
  name: string;
  people_count: number;
  needs: string;
  features_required: string;
  lat: string;
  lng: string;
  phone: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'assigned' | 'completed';
  assigned_shelter_id?: number;
  assigned_at?: string;
  created_at: string;
  updated_at: string;
  assigned_shelter_name?: string;
}

interface VectorMatch {
  shelter_id: number;
  shelter_name: string;
  features: string;
  available_capacity: number;
  distance_km: number;
  vector_similarity: number;
  cosine_distance: number;
  tidb_search_method: string;
  vector_index_used: string;
}

interface WorkflowStepData {
  request_id: string;
  tidb_vector_features_used?: string[];
  search_algorithm?: string;
  matches_found?: number;
  best_match_similarity?: number;
  [key: string]: any;
}

interface WorkflowStep {
  step: string;
  agent: string;
  status: 'completed' | 'failed' | 'in_progress';
  data: WorkflowStepData;
  matches?: VectorMatch[];
  selected_shelter?: VectorMatch;
  execution_time: number;
}

interface TiDBVectorShowcase {
  core_features: string[];
  performance_metrics: {
    vector_search_time_ms: number;
    matches_found: number;
    best_match_similarity?: number;
  };
}

interface WorkflowResults {
  success: boolean;
  message?: string;
  request_id: string;
  workflow_steps: WorkflowStep[];
  total_execution_time: number;
  status: 'completed' | 'failed' | 'in_progress';
  tidb_vector_features_demonstrated: string[];
  tidb_vector_search_showcase?: TiDBVectorShowcase;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  requests?: T;
  error?: string;
  message?: string;
}

export default function VectorSearchDemoPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionProgress, setExecutionProgress] = useState<string>('');
  const [workflowResults, setWorkflowResults] = useState<WorkflowResults | null>(null);
  const [requestsLoading, setRequestsLoading] = useState<boolean>(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const response = await api.get('/requests?status=pending&limit=10') as ApiResponse<Request[]>;
      
      // Handle different response structures - API returns { success: true, requests: [...] }
      let requestsData: Request[] = [];
      
      if (response.requests && Array.isArray(response.requests)) {
        requestsData = response.requests;
      } else if (response.data && Array.isArray(response.data)) {
        requestsData = response.data;
      } else if (Array.isArray(response)) {
        requestsData = response as Request[];
      }
      
      setRequests(requestsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch requests';
      console.error('Failed to fetch requests:', error);
      setRequestsError(errorMessage);
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const executeVectorWorkflow = async (requestId: number) => {
    if (isExecuting) return; // Prevent double-clicks
    
    setIsExecuting(true);
    setExecutionProgress('Initializing multi-step agent workflow...');
    setWorkflowResults(null);

    try {
      // Use environment-based API URL
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/agents/demo-workflow/execute/' 
        : 'http://localhost:3000/api/agents/demo-workflow/execute/';
      
      const response = await fetch(`${apiUrl}${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WorkflowResults = await response.json();
      setWorkflowResults(data);
      setExecutionProgress('Workflow completed successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Workflow execution failed';
      console.error('Workflow execution failed:', error);
      setExecutionProgress(`Workflow execution failed: ${errorMessage}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const getStepIcon = (stepName: string) => {
    const icons: Record<string, JSX.Element> = {
      'intake': <Activity className="h-5 w-5" />,
      'embedding': <Brain className="h-5 w-5" />,
      'vector_search': <Database className="h-5 w-5" />,
      'tidb_vector_search': <Database className="h-5 w-5" />,
      'matching': <Target className="h-5 w-5" />,
      'routing': <Route className="h-5 w-5" />,
      'assignment': <CheckCircle className="h-5 w-5" />,
      'rebalancing': <Zap className="h-5 w-5" />
    };
    
    // Try exact match first, then try to extract the main step name
    const normalizedStep = stepName.split('_')[0];
    return icons[stepName] || icons[normalizedStep] || <Activity className="h-5 w-5" />;
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'failed': return 'text-red-700 bg-red-100 border-red-200';
      case 'in_progress': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const toggleStepExpansion = (stepName: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepName)) {
      newExpanded.delete(stepName);
    } else {
      newExpanded.add(stepName);
    }
    setExpandedSteps(newExpanded);
  };

  const formatJson = (data: any, maxLength: number = 300) => {
    const jsonString = JSON.stringify(data, null, 2);
    if (jsonString.length <= maxLength) {
      return jsonString;
    }
    return jsonString.substring(0, maxLength) + '...';
  };

  const safeBestSimilarity = workflowResults?.tidb_vector_search_showcase?.performance_metrics?.best_match_similarity;
  const safeMatchesFound = workflowResults?.tidb_vector_search_showcase?.performance_metrics?.matches_found;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Database className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">TiDB Vector Search</h1>
            </div>
            <p className="text-xl text-gray-600 mb-2">Multi-Step Agent Workflow Demo</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Brain className="h-4 w-4 mr-1" />
                Vector Embeddings
              </span>
              <span className="flex items-center">
                <Search className="h-4 w-4 mr-1" />
                Semantic Search
              </span>
              <span className="flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                Real-time Processing
              </span>
            </div>
          </div>
        </div>

        {/* Request Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Select Request for Processing</h2>
          
          {requestsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-2" />
              Loading requests...
            </div>
          )}

          {requestsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-700">Error: {requestsError}</span>
              </div>
            </div>
          )}

          {!requestsLoading && !requestsError && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requests.map((request) => (
                <div 
                  key={request.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedRequest === request.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRequest(request.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{request.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.urgency}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="flex items-center mb-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {request.people_count} people
                    </div>
                    <p className="line-clamp-2">{request.needs}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Execute Button */}
          {selectedRequest && !requestsLoading && (
            <div className="mt-6 text-center">
              <button
                onClick={() => executeVectorWorkflow(selectedRequest)}
                disabled={isExecuting}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
                  isExecuting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                }`}
              >
                {isExecuting ? (
                  <span className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Executing Workflow...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Play className="h-5 w-5 mr-2" />
                    Execute TiDB Vector Search Workflow
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Execution Progress */}
        {executionProgress && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-gray-700">{executionProgress}</span>
            </div>
          </div>
        )}

        {/* Workflow Results */}
        {workflowResults && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">TiDB Vector Search Results</h2>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {workflowResults.workflow_steps?.length || 0}
                </div>
                <div className="text-sm text-indigo-700 font-medium">Workflow Steps</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {workflowResults.total_execution_time}ms
                </div>
                <div className="text-sm text-green-700 font-medium">Total Time</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {safeMatchesFound || 0}
                </div>
                <div className="text-sm text-blue-700 font-medium">Vector Matches</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {safeBestSimilarity ? (safeBestSimilarity * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-purple-700 font-medium">Best Similarity</div>
              </div>
            </div>

            {/* TiDB Vector Features Showcase */}
            {workflowResults.tidb_vector_search_showcase && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Database className="h-5 w-5 text-indigo-600 mr-2" />
                  TiDB Vector Search Features Demonstrated
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workflowResults.tidb_vector_search_showcase.core_features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workflow Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Step-by-Step Execution</h3>
              {workflowResults.workflow_steps?.map((step, index) => {
                const stepKey = `${step.step}-${index}`;
                const isExpanded = expandedSteps.has(stepKey);
                const isVectorSearchStep = step.step === 'tidb_vector_search' || step.step === 'vector_search';
                
                return (
                  <div key={stepKey} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg border ${getStepColor(step.status)}`}>
                            {getStepIcon(step.step)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 capitalize">
                              {step.step.replace(/_/g, ' ')} Agent
                            </h4>
                            <p className="text-sm text-gray-600">{step.agent}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {step.execution_time}ms
                            </div>
                            <div className={`text-xs font-medium ${
                              step.status === 'completed' ? 'text-green-600' : 
                              step.status === 'failed' ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {step.status}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleStepExpansion(stepKey)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4 border-t border-gray-200">
                        {/* Special showcase for TiDB Vector Search step */}
                        {isVectorSearchStep && step.matches && (
                          <div className="bg-green-50 rounded-lg p-4 mb-4">
                            <h5 className="font-semibold text-green-900 mb-3 flex items-center">
                              <Database className="h-4 w-4 mr-2" />
                              TiDB Vector Search Results
                            </h5>
                            <div className="space-y-2">
                              {step.matches.slice(0, 3).map((match, matchIndex) => (
                                <div key={matchIndex} className="bg-white rounded p-3 border border-green-200">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h6 className="font-medium text-gray-900">{match.shelter_name}</h6>
                                      <p className="text-sm text-gray-600">
                                        {match.distance_km.toFixed(1)}km • {match.available_capacity} available
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-semibold text-green-600">
                                        {(match.vector_similarity * 100).toFixed(1)}%
                                      </div>
                                      <div className="text-xs text-gray-500">similarity</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Step Data */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h6 className="font-medium text-gray-900 mb-2">Step Data</h6>
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                            {formatJson(step.data)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
