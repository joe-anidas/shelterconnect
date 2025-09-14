//controllers/routingController.js

import Request from '../models/Request.js';
import Shelter from '../models/Shelter.js';
import AgentLog from '../models/AgentLog.js';
import { calculateDistance, calculateETA } from '../utils/geocode.js';

// Calculate route and ETA for a request assignment
export const calculateRoute = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Get request details
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ 
        error: 'Request not found' 
      });
    }

    if (!request.assigned_shelter_id) {
      return res.status(400).json({ 
        error: 'Request is not assigned to a shelter' 
      });
    }

    // Get shelter details
    const shelter = await Shelter.findById(request.assigned_shelter_id);
    if (!shelter) {
      return res.status(404).json({ 
        error: 'Assigned shelter not found' 
      });
    }

    // Create agent log entry
    const logEntry = await AgentLog.create({
      agent_name: 'routing_agent',
      action: `Calculating route for request ${requestId} to shelter ${shelter.name}`,
      status: 'processing',
      request_id: parseInt(requestId),
      shelter_id: shelter.id
    });

    // Calculate distance and ETA
    const distance = calculateDistance(
      request.lat, request.lng, 
      shelter.lat, shelter.lng
    );

    const eta = calculateETA(distance, request.urgency);

    // Generate route instructions (simplified)
    const routeInstructions = generateRouteInstructions(
      request.lat, request.lng,
      shelter.lat, shelter.lng,
      distance
    );

    // Log successful calculation
    await AgentLog.updateStatus(logEntry.id, 'completed', {
      distance: distance,
      eta_minutes: eta,
      route_instructions: routeInstructions.length
    });

    // Create route summary log
    await AgentLog.create({
      agent_name: 'routing_agent',
      action: `Route calculated: ${distance}m distance, ${eta} minutes ETA via ${routeInstructions[0]?.road || 'Main Street'}`,
      status: 'completed',
      request_id: parseInt(requestId),
      shelter_id: shelter.id,
      details: {
        distance: distance,
        eta: eta,
        route_instructions: routeInstructions
      }
    });

    res.json({
      success: true,
      route: {
        request_id: parseInt(requestId),
        shelter_id: shelter.id,
        shelter_name: shelter.name,
        shelter_address: shelter.address,
        distance: distance,
        eta_minutes: eta,
        route_instructions: routeInstructions,
        urgency: request.urgency
      }
    });

  } catch (error) {
    console.error('Routing agent error:', error);
    
    // Log error
    await AgentLog.create({
      agent_name: 'routing_agent',
      action: `Error calculating route: ${error.message}`,
      status: 'error',
      request_id: req.params.requestId ? parseInt(req.params.requestId) : null,
      details: { error: error.message }
    });

    res.status(500).json({ 
      error: 'Failed to calculate route',
      details: error.message 
    });
  }
};

// Calculate routes for multiple requests
export const calculateBulkRoutes = async (req, res) => {
  try {
    const { requestIds } = req.body;

    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({ 
        error: 'requestIds must be a non-empty array' 
      });
    }

    const results = [];

    for (const requestId of requestIds) {
      try {
        const request = await Request.findById(requestId);
        if (!request || !request.assigned_shelter_id) {
          results.push({
            request_id: requestId,
            success: false,
            error: 'Request not found or not assigned'
          });
          continue;
        }

        const shelter = await Shelter.findById(request.assigned_shelter_id);
        if (!shelter) {
          results.push({
            request_id: requestId,
            success: false,
            error: 'Assigned shelter not found'
          });
          continue;
        }

        const distance = calculateDistance(
          request.lat, request.lng, 
          shelter.lat, shelter.lng
        );

        const eta = calculateETA(distance, request.urgency);

        results.push({
          request_id: requestId,
          success: true,
          shelter_id: shelter.id,
          shelter_name: shelter.name,
          distance: distance,
          eta_minutes: eta
        });

      } catch (error) {
        results.push({
          request_id: requestId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Calculated routes for ${results.length} requests`,
      results
    });

  } catch (error) {
    console.error('Error calculating bulk routes:', error);
    res.status(500).json({ 
      error: 'Failed to calculate bulk routes',
      details: error.message 
    });
  }
};

// Get route optimization suggestions
export const getRouteOptimization = async (req, res) => {
  try {
    const { shelterId } = req.params;

    // Get all assigned requests for this shelter
    const requests = await Request.findByShelter(shelterId);
    const shelter = await Shelter.findById(shelterId);

    if (!shelter) {
      return res.status(404).json({ 
        error: 'Shelter not found' 
      });
    }

    // Calculate routes and group by proximity
    const routeData = requests.map(request => {
      const distance = calculateDistance(
        request.lat, request.lng, 
        shelter.lat, shelter.lng
      );
      
      return {
        request_id: request.id,
        name: request.name,
        people_count: request.people_count,
        distance: distance,
        eta: calculateETA(distance, request.urgency),
        urgency: request.urgency
      };
    });

    // Sort by urgency and distance
    routeData.sort((a, b) => {
      const urgencyOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }
      return a.distance - b.distance;
    });

    // Generate pickup suggestions
    const pickupSuggestions = generatePickupSuggestions(routeData);

    res.json({
      success: true,
      shelter: {
        id: shelter.id,
        name: shelter.name,
        address: shelter.address
      },
      total_assignments: requests.length,
      route_optimization: {
        prioritized_routes: routeData,
        pickup_suggestions: pickupSuggestions,
        total_distance: routeData.reduce((sum, route) => sum + route.distance, 0),
        avg_eta: routeData.reduce((sum, route) => sum + route.eta, 0) / routeData.length
      }
    });

  } catch (error) {
    console.error('Error getting route optimization:', error);
    res.status(500).json({ 
      error: 'Failed to get route optimization',
      details: error.message 
    });
  }
};

// Helper function to generate route instructions
function generateRouteInstructions(startLat, startLng, endLat, endLng, distance) {
  // Simplified route instructions - in a real implementation, this would use a maps API
  const instructions = [];
  
  if (distance < 1000) {
    instructions.push({
      step: 1,
      instruction: "Walk to the shelter",
      distance: distance,
      duration: Math.round(distance / 80) // Walking speed ~80m/min
    });
  } else if (distance < 5000) {
    instructions.push({
      step: 1,
      instruction: "Head north on Main Street",
      distance: Math.round(distance * 0.6),
      duration: Math.round(distance * 0.6 / 200) // Driving speed ~200m/min
    });
    instructions.push({
      step: 2,
      instruction: "Turn right and continue to shelter",
      distance: Math.round(distance * 0.4),
      duration: Math.round(distance * 0.4 / 200)
    });
  } else {
    instructions.push({
      step: 1,
      instruction: "Take Highway 1 north",
      distance: Math.round(distance * 0.7),
      duration: Math.round(distance * 0.7 / 300) // Highway speed ~300m/min
    });
    instructions.push({
      step: 2,
      instruction: "Exit and follow local roads",
      distance: Math.round(distance * 0.3),
      duration: Math.round(distance * 0.3 / 150) // Local road speed ~150m/min
    });
  }

  return instructions;
}

// Helper function to generate pickup suggestions
function generatePickupSuggestions(routeData) {
  const suggestions = [];
  
  // Group nearby requests for potential shared transport
  for (let i = 0; i < routeData.length - 1; i++) {
    for (let j = i + 1; j < routeData.length; j++) {
      const distance = calculateDistance(
        routeData[i].lat, routeData[i].lng,
        routeData[j].lat, routeData[j].lng
      );
      
      if (distance < 2000) { // Within 2km
        suggestions.push({
          type: 'shared_transport',
          requests: [routeData[i].request_id, routeData[j].request_id],
          distance_between: distance,
          potential_savings: Math.round(distance * 0.5), // Rough estimate
          description: `Requests ${routeData[i].request_id} and ${routeData[j].request_id} are close and could share transport`
        });
      }
    }
  }

  return suggestions.slice(0, 5); // Limit to 5 suggestions
}
