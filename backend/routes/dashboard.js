//routes/dashboard.js

import express from 'express';
import Shelter from '../models/Shelter.js';
import Request from '../models/Request.js';
import AgentLog from '../models/AgentLog.js';

const router = express.Router();

// Get dashboard overview data
router.get('/overview', async (req, res) => {
  try {
    // Get statistics from all models
    const [shelterStats, requestStats, recentLogs] = await Promise.all([
      Shelter.getStats(),
      Request.getStats(),
      AgentLog.getRecent(24, 20)
    ]);

    // Get over-capacity shelters
    const overCapacityShelters = await Shelter.findOverCapacity(0.8);
    
    // Get pending requests
    const pendingRequests = await Request.findPending();

    res.json({
      success: true,
      overview: {
        shelters: shelterStats,
        requests: requestStats,
        over_capacity_count: overCapacityShelters.length,
        pending_requests_count: pendingRequests.length,
        assignment_rate: requestStats.total_requests > 0 
          ? (requestStats.assigned_requests / requestStats.total_requests * 100).toFixed(2)
          : 0
      },
      alerts: {
        over_capacity_shelters: overCapacityShelters.map(shelter => ({
          id: shelter.id,
          name: shelter.name,
          occupancy_rate: (shelter.occupancy / shelter.capacity * 100).toFixed(1),
          severity: (shelter.occupancy / shelter.capacity) > 0.9 ? 'critical' : 'warning'
        })),
        pending_requests: pendingRequests.slice(0, 5).map(request => ({
          id: request.id,
          name: request.name,
          people_count: request.people_count,
          urgency: request.urgency,
          created_at: request.created_at
        }))
      },
      recent_activity: recentLogs
    });

  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard overview',
      details: error.message 
    });
  }
});

// Get real-time data for dashboard
router.get('/realtime', async (req, res) => {
  try {
    const { lastUpdate } = req.query;
    
    // Get recent requests (last 5 minutes)
    const recentRequests = await Request.findAll(50, 0);
    const newRequests = lastUpdate 
      ? recentRequests.filter(req => new Date(req.created_at) > new Date(lastUpdate))
      : recentRequests.slice(0, 10);

    // Get recent agent logs (last 5 minutes)
    const recentLogs = await AgentLog.getRecent(1, 50); // Last hour, but we'll filter
    const newLogs = lastUpdate 
      ? recentLogs.filter(log => new Date(log.timestamp) > new Date(lastUpdate))
      : recentLogs.slice(0, 10);

    // Get current shelter status
    const shelters = await Shelter.findAll();
    const shelterUpdates = shelters.map(shelter => ({
      id: shelter.id,
      name: shelter.name,
      occupancy: shelter.occupancy,
      capacity: shelter.capacity,
      occupancy_rate: (shelter.occupancy / shelter.capacity * 100).toFixed(1),
      updated_at: shelter.updated_at
    }));

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      updates: {
        new_requests: newRequests,
        new_logs: newLogs,
        shelter_status: shelterUpdates
      }
    });

  } catch (error) {
    console.error('Error fetching real-time data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch real-time data',
      details: error.message 
    });
  }
});

// Get map data for dashboard
router.get('/map-data', async (req, res) => {
  try {
    const [shelters, pendingRequests] = await Promise.all([
      Shelter.findAll(),
      Request.findPending()
    ]);

    const mapData = {
      shelters: shelters.map(shelter => ({
        id: shelter.id,
        name: shelter.name,
        lat: shelter.lat,
        lng: shelter.lng,
        capacity: shelter.capacity,
        occupancy: shelter.occupancy,
        occupancy_rate: (shelter.occupancy / shelter.capacity * 100).toFixed(1),
        features: shelter.features,
        address: shelter.address,
        phone: shelter.phone
      })),
      pending_requests: pendingRequests.map(request => ({
        id: request.id,
        name: request.name,
        lat: request.lat,
        lng: request.lng,
        people_count: request.people_count,
        urgency: request.urgency,
        needs: request.needs,
        created_at: request.created_at
      }))
    };

    res.json({
      success: true,
      map_data: mapData
    });

  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch map data',
      details: error.message 
    });
  }
});

// Get simulation data
router.get('/simulation', async (req, res) => {
  try {
    const { scenario } = req.query;
    
    // Generate mock simulation data based on scenario
    let mockData = {};
    
    switch (scenario) {
      case 'earthquake':
        mockData = {
          scenario: 'earthquake',
          requests_generated: 20,
          area: 'concentrated',
          urgency_distribution: { high: 12, medium: 6, low: 2 },
          estimated_assignments: 18,
          estimated_pending: 2
        };
        break;
      case 'flooding':
        mockData = {
          scenario: 'flooding',
          requests_generated: 15,
          area: 'scattered',
          urgency_distribution: { high: 5, medium: 8, low: 2 },
          estimated_assignments: 14,
          estimated_pending: 1
        };
        break;
      case 'random':
        mockData = {
          scenario: 'random',
          requests_generated: 10,
          area: 'random',
          urgency_distribution: { high: 3, medium: 5, low: 2 },
          estimated_assignments: 9,
          estimated_pending: 1
        };
        break;
      default:
        mockData = {
          scenario: 'default',
          requests_generated: 5,
          area: 'mixed',
          urgency_distribution: { high: 1, medium: 3, low: 1 },
          estimated_assignments: 5,
          estimated_pending: 0
        };
    }

    res.json({
      success: true,
      simulation: mockData
    });

  } catch (error) {
    console.error('Error generating simulation data:', error);
    res.status(500).json({ 
      error: 'Failed to generate simulation data',
      details: error.message 
    });
  }
});

// Get system health status
router.get('/health', async (req, res) => {
  try {
    const [shelterStats, requestStats, agentStats] = await Promise.all([
      Shelter.getStats(),
      Request.getStats(),
      AgentLog.getAgentStats()
    ]);

    // Calculate system health metrics
    const avgOccupancyRate = shelterStats.total_capacity > 0 
      ? (shelterStats.total_occupancy / shelterStats.total_capacity * 100).toFixed(1)
      : 0;

    const assignmentRate = requestStats.total_requests > 0 
      ? (requestStats.assigned_requests / requestStats.total_requests * 100).toFixed(1)
      : 0;

    const systemHealth = {
      status: 'healthy',
      metrics: {
        avg_occupancy_rate: parseFloat(avgOccupancyRate),
        assignment_rate: parseFloat(assignmentRate),
        over_capacity_shelters: shelterStats.over_capacity_count,
        pending_requests: requestStats.pending_requests,
        active_agents: agentStats.length
      },
      alerts: []
    };

    // Add alerts based on metrics
    if (parseFloat(avgOccupancyRate) > 80) {
      systemHealth.alerts.push({
        type: 'warning',
        message: 'High average occupancy rate across shelters'
      });
    }

    if (shelterStats.over_capacity_count > 0) {
      systemHealth.alerts.push({
        type: 'critical',
        message: `${shelterStats.over_capacity_count} shelter(s) over capacity`
      });
    }

    if (requestStats.pending_requests > 10) {
      systemHealth.alerts.push({
        type: 'warning',
        message: 'High number of pending requests'
      });
    }

    if (systemHealth.alerts.length > 0) {
      systemHealth.status = systemHealth.alerts.some(a => a.type === 'critical') ? 'critical' : 'warning';
    }

    res.json({
      success: true,
      health: systemHealth
    });

  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({ 
      error: 'Failed to check system health',
      details: error.message 
    });
  }
});

export default router;
