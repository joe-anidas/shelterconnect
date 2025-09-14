//utils/geocode.js

import fetch from 'node-fetch';

// Geocode an address to get coordinates
export async function geocodeAddress(address) {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.log('No Google Maps API key found, returning mock coordinates');
      // Return mock coordinates for demo purposes
      return {
        lat: 13.0827 + (Math.random() - 0.5) * 0.1,
        lng: 80.2707 + (Math.random() - 0.5) * 0.1
      };
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].geometry.location; // { lat, lng }
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
}

// Calculate ETA based on distance and urgency
export function calculateETA(distance, urgency = 'medium') {
  const baseSpeed = {
    'high': 200,    // 200 meters per minute (12 km/h)
    'medium': 150,  // 150 meters per minute (9 km/h)
    'low': 100      // 100 meters per minute (6 km/h)
  };
  
  const speed = baseSpeed[urgency] || baseSpeed['medium'];
  return Math.round(distance / speed); // ETA in minutes
}

// Get directions between two points (simplified)
export async function getDirections(origin, destination) {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.log('No Google Maps API key found, returning mock directions');
      const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
      return {
        distance: { text: `${Math.round(distance/1000)} km`, value: distance },
        duration: { text: `${Math.round(distance/150)} mins`, value: Math.round(distance/150) * 60 },
        steps: [
          {
            instruction: `Head towards destination`,
            distance: { text: `${Math.round(distance/1000)} km`, value: distance },
            duration: { text: `${Math.round(distance/150)} mins`, value: Math.round(distance/150) * 60 }
          }
        ]
      };
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0].legs[0];
      return {
        distance: route.distance,
        duration: route.duration,
        steps: route.steps.map(step => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
          distance: step.distance,
          duration: step.duration
        }))
      };
    }
    return null;
  } catch (error) {
    console.error("Directions error:", error);
    return null;
  }
}

// Find nearby places (simplified for shelters)
export async function findNearbyPlaces(lat, lng, radius = 5000, type = 'lodging') {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.log('No Google Maps API key found, returning mock places');
      return [
        {
          name: 'Mock Shelter 1',
          place_id: 'mock_1',
          geometry: { location: { lat: lat + 0.01, lng: lng + 0.01 } },
          rating: 4.5,
          vicinity: 'Mock Area'
        }
      ];
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    
    if (data.results) {
      return data.results.map(place => ({
        name: place.name,
        place_id: place.place_id,
        geometry: place.geometry,
        rating: place.rating,
        vicinity: place.vicinity
      }));
    }
    return [];
  } catch (error) {
    console.error("Nearby places error:", error);
    return [];
  }
}