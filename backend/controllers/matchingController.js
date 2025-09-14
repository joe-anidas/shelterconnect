//controllers/matchingController.js

import Request from '../models/Request.js';
import Shelter from '../models/Shelter.js';
import AgentLog from '../models/AgentLog.js';
import { calculateDistance } from '../utils/geocode.js';

// Find best shelter match for a request
export const findBestMatch = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Get request details
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ 
        error: 'Request not found' 
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Request is not pending' 
      });
    }

    // Create agent log entry
    const logEntry = await AgentLog.create({
      agent_name: 'matching_agent',
      action: `Starting matching process for request ${requestId}`,
      status: 'processing',
      request_id: parseInt(requestId)
    });

    // Step 1: Find nearby shelters
    const nearbyShelters = await Shelter.findNearby(request.lat, request.lng, 20000); // 20km radius

    if (nearbyShelters.length === 0) {
      await AgentLog.updateStatus(logEntry.id, 'error', {
        error: 'No nearby shelters found',
        search_radius: 20000
      });
      
      return res.status(404).json({ 
        error: 'No nearby shelters found within 20km' 
      });
    }

    // Step 2: Filter by capacity
    const availableShelters = nearbyShelters.filter(shelter => 
      (shelter.capacity - shelter.occupancy) >= request.people_count
    );

    if (availableShelters.length === 0) {
      await AgentLog.updateStatus(logEntry.id, 'error', {
        error: 'No shelters with sufficient capacity',
        required_capacity: request.people_count
      });
      
      return res.status(404).json({ 
        error: 'No shelters with sufficient capacity found' 
      });
    }

    // Step 3: Filter by required features
    let featureFilteredShelters = availableShelters;
    if (request.features_required) {
      const requiredFeatures = request.features_required.split(',').map(f => f.trim());
      featureFilteredShelters = availableShelters.filter(shelter => {
        if (!shelter.features) return false;
        return requiredFeatures.every(feature => 
          shelter.features.toLowerCase().includes(feature.toLowerCase())
        );
      });
    }

    // Step 4: Score and rank shelters
    const scoredShelters = featureFilteredShelters.map(shelter => {
      const distance = calculateDistance(
        request.lat, request.lng, 
        shelter.lat, shelter.lng
      );
      
      const capacityScore = (shelter.capacity - shelter.occupancy) / shelter.capacity;
      const distanceScore = Math.max(0, 1 - (distance / 20000)); // Normalize to 20km
      const urgencyMultiplier = request.urgency === 'high' ? 1.2 : request.urgency === 'medium' ? 1.0 : 0.8;
      
      const totalScore = (capacityScore * 0.4 + distanceScore * 0.6) * urgencyMultiplier;
      
      return {
        ...shelter,
        distance: Math.round(distance),
        capacity_score: capacityScore,
        distance_score: distanceScore,
        total_score: totalScore
      };
    });

    // Sort by total score
    scoredShelters.sort((a, b) => b.total_score - a.total_score);

    // Step 5: Select best match
    const bestMatch = scoredShelters[0];

    if (!bestMatch) {
      await AgentLog.updateStatus(logEntry.id, 'error', {
        error: 'No suitable shelter found after filtering',
        filters_applied: ['capacity', 'features', 'distance']
      });
      
      return res.status(404).json({ 
        error: 'No suitable shelter found' 
      });
    }

    // Step 6: Assign request to shelter
    await Request.assignToShelter(requestId, bestMatch.id);

    // Update shelter occupancy
    const newOccupancy = bestMatch.occupancy + request.people_count;
    await Shelter.updateOccupancy(bestMatch.id, newOccupancy);

    // Log successful assignment
    await AgentLog.updateStatus(logEntry.id, 'completed', {
      assigned_shelter_id: bestMatch.id,
      distance: bestMatch.distance,
      total_score: bestMatch.total_score,
      new_occupancy: newOccupancy
    });

    // Create assignment summary log
    await AgentLog.create({
      agent_name: 'matching_agent',
      action: `Assigned ${request.name} to ${bestMatch.name} - Distance: ${bestMatch.distance}m, Score: ${bestMatch.total_score.toFixed(3)}`,
      status: 'completed',
      request_id: parseInt(requestId),
      shelter_id: bestMatch.id,
      details: {
        distance: bestMatch.distance,
        score: bestMatch.total_score,
        capacity_after: newOccupancy
      }
    });

    res.json({
      success: true,
      message: 'Request assigned successfully',
      assignment: {
        request_id: parseInt(requestId),
        shelter_id: bestMatch.id,
        shelter_name: bestMatch.name,
        distance: bestMatch.distance,
        eta: Math.round(bestMatch.distance / 1000 * 3), // Rough ETA in minutes
        score: bestMatch.total_score,
        new_occupancy: newOccupancy
      }
    });

  } catch (error) {
    console.error('Matching agent error:', error);
    
    // Log error
    await AgentLog.create({
      agent_name: 'matching_agent',
      action: `Error in matching process: ${error.message}`,
      status: 'error',
      request_id: req.params.requestId ? parseInt(req.params.requestId) : null,
      details: { error: error.message }
    });

    res.status(500).json({ 
      error: 'Failed to find shelter match',
      details: error.message 
    });
  }
};

// Process all pending requests
export const processPendingRequests = async (req, res) => {
  try {
    const pendingRequests = await Request.findPending();
    const results = [];

    for (const request of pendingRequests) {
      try {
        // Find best match for this request
        const nearbyShelters = await Shelter.findNearby(request.lat, request.lng, 20000);
        const availableShelters = nearbyShelters.filter(shelter => 
          (shelter.capacity - shelter.occupancy) >= request.people_count
        );

        if (availableShelters.length > 0) {
          // Simple assignment to closest available shelter
          const closestShelter = availableShelters.reduce((closest, current) => {
            const closestDist = calculateDistance(request.lat, request.lng, closest.lat, closest.lng);
            const currentDist = calculateDistance(request.lat, request.lng, current.lat, current.lng);
            return currentDist < closestDist ? current : closest;
          });

          await Request.assignToShelter(request.id, closestShelter.id);
          await Shelter.updateOccupancy(closestShelter.id, closestShelter.occupancy + request.people_count);

          results.push({
            request_id: request.id,
            assigned: true,
            shelter_id: closestShelter.id,
            shelter_name: closestShelter.name
          });
        } else {
          results.push({
            request_id: request.id,
            assigned: false,
            reason: 'No available shelters'
          });
        }
      } catch (error) {
        results.push({
          request_id: request.id,
          assigned: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${pendingRequests.length} pending requests`,
      results
    });

  } catch (error) {
    console.error('Error processing pending requests:', error);
    res.status(500).json({ 
      error: 'Failed to process pending requests',
      details: error.message 
    });
  }
};

// Get matching statistics
export const getMatchingStats = async (req, res) => {
  try {
    const requestStats = await Request.getStats();
    const shelterStats = await Shelter.getStats();

    res.json({
      success: true,
      stats: {
        requests: requestStats,
        shelters: shelterStats,
        assignment_rate: requestStats.total_requests > 0 
          ? (requestStats.assigned_requests / requestStats.total_requests * 100).toFixed(2)
          : 0
      }
    });

  } catch (error) {
    console.error('Error fetching matching statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch matching statistics',
      details: error.message 
    });
  }
};
