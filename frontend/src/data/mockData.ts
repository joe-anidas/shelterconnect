export const mockShelters = [
  {
    id: 1,
    name: 'Central Relief Center',
    capacity: 150,
    occupancy: 78,
    features: 'medical,wheelchair,child-friendly',
    address: '123 Main Street, Downtown',
    lat: 13.0827,
    lng: 80.2707,
    phone: '(555) 123-4567'
  },
  {
    id: 2,
    name: 'Community Sports Complex',
    capacity: 200,
    occupancy: 145,
    features: 'pet-friendly,large-families,recreational',
    address: '456 Sports Ave, North District',
    lat: 13.0950,
    lng: 80.2600,
    phone: '(555) 234-5678'
  },
  {
    id: 3,
    name: 'St. Mary\'s Community Hall',
    capacity: 100,
    occupancy: 42,
    features: 'elderly-care,medical,quiet',
    address: '789 Church Road, West Side',
    lat: 13.0700,
    lng: 80.2800,
    phone: '(555) 345-6789'
  },
  {
    id: 4,
    name: 'Tech Campus Emergency Center',
    capacity: 300,
    occupancy: 89,
    features: 'wifi,charging-stations,tech-support,wheelchair',
    address: '101 Innovation Drive, Tech Park',
    lat: 13.1000,
    lng: 80.2500,
    phone: '(555) 456-7890'
  },
  {
    id: 5,
    name: 'Riverside Community Center',
    capacity: 80,
    occupancy: 71,
    features: 'waterfront,medical,child-friendly',
    address: '202 River Road, East Side',
    lat: 13.0650,
    lng: 80.2900,
    phone: '(555) 567-8901'
  },
  {
    id: 6,
    name: 'Metro School Gymnasium',
    capacity: 120,
    occupancy: 34,
    features: 'large-space,sports-facilities,child-friendly',
    address: '303 Education Blvd, Central',
    lat: 13.0850,
    lng: 80.2650,
    phone: '(555) 678-9012'
  }
];

export const mockRequests = [
  {
    id: 1,
    name: 'Ravi Kumar',
    people_count: 4,
    needs: 'Medical aid for elderly parent, infant formula',
    status: 'assigned',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    lat: 13.0827,
    lng: 80.2707,
    urgency: 'high',
    assigned_shelter: 'Central Relief Center'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    people_count: 2,
    needs: 'Wheelchair access required',
    status: 'pending',
    timestamp: new Date(Date.now() - 180000), // 3 minutes ago
    lat: 13.0900,
    lng: 80.2600,
    urgency: 'medium'
  },
  {
    id: 3,
    name: 'Ahmed Hassan',
    people_count: 6,
    needs: 'Large family with children, pet dog',
    status: 'assigned',
    timestamp: new Date(Date.now() - 120000), // 2 minutes ago
    lat: 13.0750,
    lng: 80.2850,
    urgency: 'medium',
    assigned_shelter: 'Community Sports Complex'
  },
  {
    id: 4,
    name: 'Lisa Chen',
    people_count: 1,
    needs: 'Quiet space needed, anxiety condition',
    status: 'assigned',
    timestamp: new Date(Date.now() - 60000), // 1 minute ago
    lat: 13.0700,
    lng: 80.2800,
    urgency: 'low',
    assigned_shelter: 'St. Mary\'s Community Hall'
  },
  {
    id: 5,
    name: 'David Johnson',
    people_count: 3,
    needs: 'Need charging station for medical device',
    status: 'pending',
    timestamp: new Date(Date.now() - 30000), // 30 seconds ago
    lat: 13.1000,
    lng: 80.2500,
    urgency: 'high'
  }
];

export const mockAgentLogs = [
  {
    id: 1,
    agent_name: 'intake_agent',
    timestamp: new Date(Date.now() - 300000),
    action: 'Processed intake request from Ravi Kumar (4 people)',
    status: 'completed',
    request_id: 1
  },
  {
    id: 2,
    agent_name: 'matching_agent',
    timestamp: new Date(Date.now() - 295000),
    action: 'Vector search completed: 6 shelter candidates found',
    status: 'completed',
    request_id: 1
  },
  {
    id: 3,
    agent_name: 'matching_agent',
    timestamp: new Date(Date.now() - 290000),
    action: 'Assigned Ravi Kumar to Central Relief Center - Score: 0.89, Distance: 2.4km',
    status: 'completed',
    request_id: 1,
    shelter_id: 1
  },
  {
    id: 4,
    agent_name: 'routing_agent',
    timestamp: new Date(Date.now() - 285000),
    action: 'Calculated route: ETA 12 minutes via Main Street',
    status: 'completed',
    request_id: 1,
    shelter_id: 1
  },
  {
    id: 5,
    agent_name: 'intake_agent',
    timestamp: new Date(Date.now() - 180000),
    action: 'Processed intake request from Priya Sharma (2 people)',
    status: 'completed',
    request_id: 2
  },
  {
    id: 6,
    agent_name: 'matching_agent',
    timestamp: new Date(Date.now() - 175000),
    action: 'Searching for wheelchair accessible shelters...',
    status: 'processing',
    request_id: 2
  },
  {
    id: 7,
    agent_name: 'rebalance_agent',
    timestamp: new Date(Date.now() - 60000),
    action: 'Monitoring occupancy levels - Community Sports Complex at 73%',
    status: 'completed',
    shelter_id: 2
  },
  {
    id: 8,
    agent_name: 'intake_agent',
    timestamp: new Date(Date.now() - 30000),
    action: 'Processed intake request from David Johnson (3 people)',
    status: 'completed',
    request_id: 5
  },
  {
    id: 9,
    agent_name: 'matching_agent',
    timestamp: new Date(Date.now() - 25000),
    action: 'Prioritizing high-urgency request - searching for tech-equipped shelters',
    status: 'processing',
    request_id: 5
  },
  {
    id: 10,
    agent_name: 'rebalance_agent',
    timestamp: new Date(Date.now() - 10000),
    action: 'Alert: Community Sports Complex approaching 75% capacity',
    status: 'completed',
    shelter_id: 2
  }
];