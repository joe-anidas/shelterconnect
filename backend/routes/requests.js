//routes/requests.js

import express from 'express';
import { 
  processRequest, 
  getRequests, 
  getRequestById, 
  getPendingRequests, 
  updateRequestStatus, 
  getRequestStats 
} from '../controllers/intakeController.js';

import { findBestMatch as findMatch } from '../controllers/matchingController.js';
import { calculateRoute } from '../controllers/routingController.js';

const router = express.Router();

// Process new family request (Intake Agent)
router.post('/', processRequest);

// Get all requests
router.get('/', getRequests);

// Get request by ID
router.get('/:id', getRequestById);

// Get pending requests
router.get('/status/pending', getPendingRequests);

// Update request status
router.patch('/:id/status', updateRequestStatus);

// Get request statistics
router.get('/stats/overview', getRequestStats);

// Find best shelter match (Matching Agent)
router.post('/match', async (req, res) => {
  try {
    const { lat, lng, people_count, features_required, urgency } = req.body;
    
    // Create a temporary request-like object for matching
    const requestData = { lat, lng, people_count, features_required, urgency };
    
    // Find best match using the matching controller logic
    const nearbyShelters = await import('../models/Shelter.js').then(m => m.default.findNearby(lat, lng, 20000));
    
    if (nearbyShelters.length === 0) {
      return res.status(404).json({ 
        error: 'No nearby shelters found within 20km' 
      });
    }
    
    // Simple scoring algorithm
    let bestMatch = null;
    let bestScore = -1;
    
    for (const shelter of nearbyShelters) {
      if (shelter.capacity - shelter.occupancy >= people_count) {
        // Calculate distance score (closer is better)
        const distance = Math.sqrt(Math.pow(lat - shelter.lat, 2) + Math.pow(lng - shelter.lng, 2)) * 111; // rough km conversion
        const distanceScore = Math.max(0, 20 - distance) / 20; // normalize to 0-1
        
        // Calculate feature match score
        const shelterFeatures = (shelter.features || '').split(',').map(f => f.trim());
        const requiredFeatures = Array.isArray(features_required) ? features_required : [];
        const matchedFeatures = requiredFeatures.filter(f => shelterFeatures.includes(f));
        const featureScore = requiredFeatures.length > 0 ? matchedFeatures.length / requiredFeatures.length : 1;
        
        // Calculate capacity score (more available space is better)
        const availableSpace = shelter.capacity - shelter.occupancy;
        const capacityScore = Math.min(availableSpace / people_count, 2) / 2; // normalize, capped at 2x needed
        
        // Overall score
        const overallScore = (distanceScore * 0.4) + (featureScore * 0.4) + (capacityScore * 0.2);
        
        if (overallScore > bestScore) {
          bestScore = overallScore;
          bestMatch = {
            shelter_id: shelter.id,
            shelter_name: shelter.name,
            distance_km: parseFloat(distance.toFixed(2)),
            capacity_match: capacityScore,
            feature_match: featureScore,
            overall_score: parseFloat(overallScore.toFixed(3)),
            lat: shelter.lat,
            lng: shelter.lng,
            available_beds: availableSpace,
            features: shelterFeatures
          };
        }
      }
    }
    
    if (!bestMatch) {
      return res.status(404).json({ 
        error: 'No suitable shelters found with available capacity' 
      });
    }
    
    res.json({ success: true, match: bestMatch });
    
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({ error: 'Failed to find shelter match', details: error.message });
  }
});

// Calculate route (Routing Agent)
router.post('/route', async (req, res) => {
  try {
    const { origin_lat, origin_lng, destination_lat, destination_lng } = req.body;
    
    // Simple distance and time calculation
    const distance = Math.sqrt(
      Math.pow(destination_lat - origin_lat, 2) + Math.pow(destination_lng - origin_lng, 2)
    ) * 111; // rough km conversion
    
    // Estimate duration (assuming average speed of 30 km/h in emergency conditions)
    const duration = (distance / 30) * 60; // minutes
    
    const route = {
      distance_km: parseFloat(distance.toFixed(2)),
      duration_minutes: Math.ceil(duration),
      route_points: [
        { lat: origin_lat, lng: origin_lng },
        { lat: destination_lat, lng: destination_lng }
      ],
      instructions: [
        `Head towards shelter location (${distance.toFixed(1)} km away)`,
        `Estimated travel time: ${Math.ceil(duration)} minutes`,
        'Follow main roads and emergency routes if available',
        'Contact shelter upon arrival'
      ]
    };
    
    res.json({ success: true, route });
    
  } catch (error) {
    console.error('Routing error:', error);
    res.status(500).json({ error: 'Failed to calculate route', details: error.message });
  }
});

export default router;
