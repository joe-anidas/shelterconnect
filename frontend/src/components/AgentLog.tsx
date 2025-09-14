// React import not required in new JSX transform
import { Bot, CheckCircle, Clock, AlertCircle, Brain, Users, MapPin, RotateCcw } from 'lucide-react';

interface AgentLogEntry {
  id: number;
  agent_name: string;
  timestamp: Date;
  action: string;
  status: 'processing' | 'completed' | 'error';
  request_id?: number;
  shelter_id?: number;
  details?: string;
}

interface AgentLogProps {
  logs: AgentLogEntry[];
}

export default function AgentLog({ logs }: AgentLogProps) {
  const getAgentIcon = (agentName: string) => {
    switch (agentName) {
      case 'intake_agent':
        return <Users className="h-4 w-4" />;
      case 'matching_agent':
        return <Brain className="h-4 w-4" />;
      case 'routing_agent':
        return <MapPin className="h-4 w-4" />;
      case 'rebalance_agent':
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getAgentColor = (agentName: string) => {
    switch (agentName) {
      case 'intake_agent':
        return 'bg-blue-100 text-blue-700';
      case 'matching_agent':
        return 'bg-green-100 text-green-700';
      case 'routing_agent':
        return 'bg-purple-100 text-purple-700';
      case 'rebalance_agent':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-yellow-500 animate-pulse" />;
    }
  };

  const formatAgentName = (name: string) => {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const ts = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    if (!(ts instanceof Date) || isNaN(ts.getTime())) {
      return '';
    }
    return ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const renderDetails = (details: any) => {
    if (details == null) {
      return null;
    }
    // If it's already a string, render directly (but truncate long strings)
    if (typeof details === 'string') {
      const short = details.length > 300 ? details.slice(0, 300) + '…' : details;
      return <>{short}</>;
    }

    // If it's an object/array, prefer a small key/value preview
    if (typeof details === 'object') {
      try {
        // Pick a few interesting keys if present
        const previewKeys = ['families_moved', 'from_shelter', 'to_shelter', 'reason', 'request_ids'];
        const entries: Array<[string, any]> = [];
        for (const k of previewKeys) {
          if (k in details) {
            entries.push([k, details[k]]);
          }
        }
        // Fallback to first 3 keys if none of the previewKeys matched
        if (entries.length === 0) {
          const keys = Object.keys(details).slice(0, 3);
          for (const k of keys) entries.push([k, details[k]]);
        }

        return (
          <div className="text-xs text-slate-500 space-y-0.5">
            {entries.map(([k, v]) => (
              <div key={k} className="flex items-baseline space-x-2">
                <span className="font-medium text-slate-600">{k}:</span>
                <span className="text-slate-400">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
              </div>
            ))}
          </div>
        );
      } catch (err) {
        // Last resort: stringify safely
        try {
          return <>{JSON.stringify(details)}</>;
        } catch (e) {
          return <>[unrenderable details]</>;
        }
      }
    }

    // Fallback for other primitive types
    return <>{String(details)}</>;
  };

  if (logs.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">
        <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No agent activity yet</p>
        <p className="text-xs mt-1">Agent actions will appear here as they process requests</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200">
      {logs.map((log) => (
        <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
          <div className="flex items-start space-x-3">
            {/* Agent Icon */}
            <div className={`p-2 rounded-lg ${getAgentColor(log.agent_name)}`}>
              {getAgentIcon(log.agent_name)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-900">
                    {formatAgentName(log.agent_name)}
                  </span>
                  {getStatusIcon(log.status)}
                </div>
                <span className="text-xs text-slate-500">
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>

              {/* Action Description */}
              <p className="text-sm text-slate-700 mb-1">
                {log.action}
              </p>

              {/* Details */}
              {log.details && (
                <div className="mt-1">
                  {renderDetails(log.details)}
                </div>
              )}

              {/* IDs for debugging */}
              {(log.request_id || log.shelter_id) && (
                <div className="flex items-center space-x-3 mt-2 text-xs text-slate-400">
                  {log.request_id && (
                    <span>Request: #{log.request_id}</span>
                  )}
                  {log.shelter_id && (
                    <span>Shelter: #{log.shelter_id}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}