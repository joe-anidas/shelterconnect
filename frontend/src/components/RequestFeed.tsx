// React import not required in new JSX transform
import { Users, Clock, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

interface Request {
  id: number;
  name: string;
  people_count: number;
  needs: string;
  status: 'pending' | 'assigned' | 'completed';
  timestamp: Date;
  lat?: number;
  lng?: number;
  urgency?: 'low' | 'medium' | 'high';
  assigned_shelter?: string;
}

interface RequestFeedProps {
  requests: Request[];
}

export default function RequestFeed({ requests }: RequestFeedProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'assigned':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const ts = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    if (!(ts instanceof Date) || isNaN(ts.getTime())) {
      return '';
    }
    const now = new Date();
    const diff = now.getTime() - ts.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return 'Just now';
    }
    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }

    return ts.toLocaleDateString();
  };

  if (requests.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">
        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No requests at the moment</p>
        <p className="text-xs mt-1">New requests will appear here in real-time</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200">
      {requests.map((request) => (
        <div key={request.id} className="p-4 hover:bg-slate-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getStatusIcon(request.status)}
                  <h4 className="text-sm font-semibold text-slate-900 ml-2">
                    {request.name}
                  </h4>
                </div>
                
                {request.urgency && (
                  <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{request.people_count} people</span>
                </div>
                
                {request.needs && (
                  <div className="flex items-start">
                    <AlertTriangle className="h-3 w-3 mr-1 mt-0.5" />
                    <span className="line-clamp-2">{request.needs}</span>
                  </div>
                )}
                
                {request.lat != null && request.lng != null && (() => {
                  const latNum = Number(request.lat);
                  const lngNum = Number(request.lng);
                  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
                    return null;
                  }
                  return (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{latNum.toFixed(4)}, {lngNum.toFixed(4)}</span>
                    </div>
                  );
                })()}

                {request.assigned_shelter && (
                  <div className="text-blue-600 font-medium">
                    → Assigned to {request.assigned_shelter}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className="mt-2 text-xs text-slate-400">
                {formatTimestamp(request.timestamp)}
              </div>
            </div>

            {/* Status Badge */}
            <div className={`ml-3 px-2 py-1 text-xs font-medium rounded ${
              request.status === 'completed' 
                ? 'bg-green-100 text-green-700' 
                : request.status === 'assigned'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {request.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}