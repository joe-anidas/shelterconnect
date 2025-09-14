//controllers/rebalanceController.js

import Request from '../models/Request.js';
import Shelter from '../models/Shelter.js';
import AgentLog from '../models/AgentLog.js';
import { calculateDistance } from '../utils/geocode.js';

// Monitor shelter occupancy and trigger rebalancing
export const monitorOccupancy = async (req, res) => {
  try {
    const { threshold = 0.8 } = req.query;

    // Create agent log entry
    const logEntry = await AgentLog.create({
      agent_name: 'rebalance_agent',
      action: `Monitoring shelter occupancy levels (threshold: ${threshold * 100}%)`,
      status: 'processing'
    });

    // Get all shelters
    const shelters = await Shelter.findAll();
    
    // Find over-capacity shelters
    const overCapacityShelters = shelters.filter(shelter => 
      (shelter.occupancy / shelter.capacity) > parseFloat(threshold)
    );

    // Find under-utilized shelters
    const underUtilizedShelters = shelters.filter(shelter => 
      (shelter.occupancy / shelter.capacity) < 0.5
    );

    // Generate rebalancing suggestions
    const rebalancingSuggestions = [];

    for (const overloadedShelter of overCapacityShelters) {
      const excessOccupancy = overloadedShelter.occupancy - Math.floor(overloadedShelter.capacity * 0.75);
      
      if (excessOccupancy > 0) {
        // Find best target shelters
        const targetShelters = underUtilizedShelters
          .filter(shelter => shelter.id !== overloadedShelter.id)
          .map(shelter => ({
            ...shelter,
            distance: calculateDistance(
              overloadedShelter.lat, overloadedShelter.lng,
              shelter.lat, shelter.lng
            ),
            available_capacity: shelter.capacity - shelter.occupancy
          }))
          .filter(shelter => shelter.available_capacity >= Math.min(5, excessOccupancy))
          .sort((a, b) => a.distance - b.distance);

        if (targetShelters.length > 0) {
          const targetShelter = targetShelters[0];
          const suggestedMoves = Math.min(5, excessOccupancy, targetShelter.available_capacity);

          rebalancingSuggestions.push({
            from_shelter: {
              id: overloadedShelter.id,
              name: overloadedShelter.name,
              current_occupancy: overloadedShelter.occupancy,
              capacity: overloadedShelter.capacity,
              occupancy_rate: (overloadedShelter.occupancy / overloadedShelter.capacity * 100).toFixed(1)
            },
            to_shelter: {
              id: targetShelter.id,
              name: targetShelter.name,
              current_occupancy: targetShelter.occupancy,
              capacity: targetShelter.capacity,
              available_capacity: targetShelter.available_capacity
            },
            suggested_moves: suggestedMoves,
            distance: targetShelter.distance,
            reason: `${overloadedShelter.name} at ${(overloadedShelter.occupancy / overloadedShelter.capacity * 100).toFixed(1)}% capacity`,
            priority: excessOccupancy > 10 ? 'high' : 'medium'
          });
        }
      }
    }

    // Log monitoring results
    await AgentLog.updateStatus(logEntry.id, 'completed', {
      total_shelters: shelters.length,
      over_capacity_count: overCapacityShelters.length,
      under_utilized_count: underUtilizedShelters.length,
      suggestions_generated: rebalancingSuggestions.length
    });

    // Create summary log
    if (overCapacityShelters.length > 0) {
      await AgentLog.create({
        agent_name: 'rebalance_agent',
        action: `Alert: ${overCapacityShelters.length} shelter(s) over ${threshold * 100}% capacity. Generated ${rebalancingSuggestions.length} rebalancing suggestions.`,
        status: 'completed',
        details: {
          over_capacity_shelters: overCapacityShelters.map(s => ({
            id: s.id,
            name: s.name,
            occupancy_rate: (s.occupancy / s.capacity * 100).toFixed(1)
          })),
          suggestions_count: rebalancingSuggestions.length
        }
      });
    } else {
      await AgentLog.create({
        agent_name: 'rebalance_agent',
        action: `All shelters operating within normal capacity limits`,
        status: 'completed',
        details: {
          total_shelters: shelters.length,
          max_occupancy_rate: Math.max(...shelters.map(s => s.occupancy / s.capacity * 100)).toFixed(1)
        }
      });
    }

    res.json({
      success: true,
      monitoring: {
        total_shelters: shelters.length,
        over_capacity_shelters: overCapacityShelters.length,
        under_utilized_shelters: underUtilizedShelters.length,
        threshold: parseFloat(threshold)
      },
      rebalancing_suggestions: rebalancingSuggestions,
      alerts: overCapacityShelters.map(shelter => ({
        shelter_id: shelter.id,
        shelter_name: shelter.name,
        occupancy_rate: (shelter.occupancy / shelter.capacity * 100).toFixed(1),
        severity: (shelter.occupancy / shelter.capacity) > 0.9 ? 'critical' : 'warning'
      }))
    });

  } catch (error) {
    console.error('Rebalance agent error:', error);
    
    // Log error
    await AgentLog.create({
      agent_name: 'rebalance_agent',
      action: `Error monitoring occupancy: ${error.message}`,
      status: 'error',
      details: { error: error.message }
    });

    res.status(500).json({ 
      error: 'Failed to monitor occupancy',
      details: error.message 
    });
  }
};

// Execute rebalancing suggestions
export const executeRebalancing = async (req, res) => {
  try {
    const { suggestions } = req.body;

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return res.status(400).json({ 
        error: 'suggestions must be a non-empty array' 
      });
    }

    const results = [];

    for (const suggestion of suggestions) {
      try {
        const { from_shelter_id, to_shelter_id, move_count } = suggestion;

        // Validate shelters exist
        const fromShelter = await Shelter.findById(from_shelter_id);
        const toShelter = await Shelter.findById(to_shelter_id);

        if (!fromShelter || !toShelter) {
          results.push({
            suggestion_id: suggestion.id || 'unknown',
            success: false,
            error: 'Source or target shelter not found'
          });
          continue;
        }

        // Validate capacity
        if (fromShelter.occupancy < move_count) {
          results.push({
            suggestion_id: suggestion.id || 'unknown',
            success: false,
            error: 'Insufficient occupancy in source shelter'
          });
          continue;
        }

        if ((toShelter.capacity - toShelter.occupancy) < move_count) {
          results.push({
            suggestion_id: suggestion.id || 'unknown',
            success: false,
            error: 'Insufficient capacity in target shelter'
          });
          continue;
        }

        // Get requests to move (simplified - in reality would be more sophisticated)
        const requestsToMove = await Request.findByShelter(from_shelter_id);
        const selectedRequests = requestsToMove.slice(0, move_count);

        // Update shelter occupancies
        await Shelter.updateOccupancy(from_shelter_id, fromShelter.occupancy - move_count);
        await Shelter.updateOccupancy(to_shelter_id, toShelter.occupancy + move_count);

        // Update request assignments
        for (const request of selectedRequests) {
          await Request.assignToShelter(request.id, to_shelter_id);
        }

        // Log the rebalancing action
        await AgentLog.create({
          agent_name: 'rebalance_agent',
          action: `Rebalanced ${move_count} families from ${fromShelter.name} to ${toShelter.name}`,
          status: 'completed',
          shelter_id: from_shelter_id,
          details: {
            from_shelter: fromShelter.name,
            to_shelter: toShelter.name,
            families_moved: move_count,
            request_ids: selectedRequests.map(r => r.id)
          }
        });

        results.push({
          suggestion_id: suggestion.id || 'unknown',
          success: true,
          from_shelter: fromShelter.name,
          to_shelter: toShelter.name,
          families_moved: move_count,
          new_from_occupancy: fromShelter.occupancy - move_count,
          new_to_occupancy: toShelter.occupancy + move_count
        });

      } catch (error) {
        results.push({
          suggestion_id: suggestion.id || 'unknown',
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Executed ${successCount}/${results.length} rebalancing suggestions`,
      results
    });

  } catch (error) {
    console.error('Error executing rebalancing:', error);
    res.status(500).json({ 
      error: 'Failed to execute rebalancing',
      details: error.message 
    });
  }
};

// Get rebalancing history
export const getRebalancingHistory = async (req, res) => {
  try {
    const { limit = 50, hours = 24 } = req.query;

    // Get recent rebalancing logs
    const rebalancingLogs = await AgentLog.findByAgent('rebalance_agent', parseInt(limit));
    
    // Filter logs from the specified time period
    const cutoffTime = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);
    const recentLogs = rebalancingLogs.filter(log => new Date(log.timestamp) >= cutoffTime);

    // Get shelter statistics
    const shelterStats = await Shelter.getStats();

    res.json({
      success: true,
      history: {
        time_period_hours: parseInt(hours),
        total_actions: recentLogs.length,
        completed_actions: recentLogs.filter(log => log.status === 'completed').length,
        error_actions: recentLogs.filter(log => log.status === 'error').length
      },
      recent_actions: recentLogs,
      current_shelter_stats: shelterStats
    });

  } catch (error) {
    console.error('Error fetching rebalancing history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch rebalancing history',
      details: error.message 
    });
  }
};

// Get shelter capacity alerts
export const getCapacityAlerts = async (req, res) => {
  try {
    const { threshold = 0.8 } = req.query;

    const overCapacityShelters = await Shelter.findOverCapacity(parseFloat(threshold));
    const availableShelters = await Shelter.findAvailable(10); // At least 10 available spots

    const alerts = overCapacityShelters.map(shelter => ({
      shelter_id: shelter.id,
      shelter_name: shelter.name,
      current_occupancy: shelter.occupancy,
      capacity: shelter.capacity,
      occupancy_rate: (shelter.occupancy / shelter.capacity * 100).toFixed(1),
      severity: (shelter.occupancy / shelter.capacity) > 0.9 ? 'critical' : 'warning',
      available_nearby: availableShelters.filter(s => 
        calculateDistance(shelter.lat, shelter.lng, s.lat, s.lng) < 10000
      ).length
    }));

    res.json({
      success: true,
      alerts,
      summary: {
        total_alerts: alerts.length,
        critical_alerts: alerts.filter(a => a.severity === 'critical').length,
        warning_alerts: alerts.filter(a => a.severity === 'warning').length,
        available_shelters: availableShelters.length
      }
    });

  } catch (error) {
    console.error('Error fetching capacity alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch capacity alerts',
      details: error.message 
    });
  }
};
