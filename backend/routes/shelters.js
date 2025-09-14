//routes/shelters.js

import express from 'express';
import Shelter from '../models/Shelter.js';
import AgentLog from '../models/AgentLog.js';

const router = express.Router();

// Get all shelters
router.get('/', async (req, res) => {
  try {
    const shelters = await Shelter.findAll();
    res.json({
      success: true,
      shelters,
      count: shelters.length
    });
  } catch (error) {
    console.error('Error fetching shelters:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shelters',
      details: error.message 
    });
  }
});

// Get shelter by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const shelter = await Shelter.findById(id);

    if (!shelter) {
      return res.status(404).json({ 
        error: 'Shelter not found' 
      });
    }

    res.json({
      success: true,
      shelter
    });
  } catch (error) {
    console.error('Error fetching shelter:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shelter',
      details: error.message 
    });
  }
});

// Create new shelter
router.post('/', async (req, res) => {
  try {
    const shelterData = req.body;
    const shelter = await Shelter.create(shelterData);

    // Log the creation
    await AgentLog.create({
      agent_name: 'intake_agent',
      action: `New shelter created: ${shelter.name} (capacity: ${shelter.capacity})`,
      status: 'completed',
      shelter_id: shelter.id
    });

    res.status(201).json({
      success: true,
      message: 'Shelter created successfully',
      shelter
    });
  } catch (error) {
    console.error('Error creating shelter:', error);
    res.status(500).json({ 
      error: 'Failed to create shelter',
      details: error.message 
    });
  }
});

// Update shelter
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const shelterData = req.body;
    
    const updated = await Shelter.update(id, shelterData);

    if (!updated) {
      return res.status(404).json({ 
        error: 'Shelter not found' 
      });
    }

    // Log the update
    await AgentLog.create({
      agent_name: 'intake_agent',
      action: `Shelter updated: ${shelterData.name || 'ID ' + id}`,
      status: 'completed',
      shelter_id: parseInt(id)
    });

    res.json({
      success: true,
      message: 'Shelter updated successfully'
    });
  } catch (error) {
    console.error('Error updating shelter:', error);
    res.status(500).json({ 
      error: 'Failed to update shelter',
      details: error.message 
    });
  }
});

// Update shelter occupancy
router.patch('/:id/occupancy', async (req, res) => {
  try {
    const { id } = req.params;
    const { occupancy } = req.body;

    if (occupancy === undefined || occupancy < 0) {
      return res.status(400).json({ 
        error: 'Valid occupancy value is required' 
      });
    }

    const updated = await Shelter.updateOccupancy(id, occupancy);

    if (!updated) {
      return res.status(404).json({ 
        error: 'Shelter not found' 
      });
    }

    // Log the occupancy change
    await AgentLog.create({
      agent_name: 'rebalance_agent',
      action: `Shelter occupancy updated to ${occupancy}`,
      status: 'completed',
      shelter_id: parseInt(id),
      details: { new_occupancy: occupancy }
    });

    res.json({
      success: true,
      message: 'Shelter occupancy updated successfully'
    });
  } catch (error) {
    console.error('Error updating shelter occupancy:', error);
    res.status(500).json({ 
      error: 'Failed to update shelter occupancy',
      details: error.message 
    });
  }
});

// Get nearby shelters
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { distance = 10000 } = req.query;

    const shelters = await Shelter.findNearby(
      parseFloat(lat), 
      parseFloat(lng), 
      parseInt(distance)
    );

    res.json({
      success: true,
      shelters,
      count: shelters.length,
      search_radius: parseInt(distance)
    });
  } catch (error) {
    console.error('Error finding nearby shelters:', error);
    res.status(500).json({ 
      error: 'Failed to find nearby shelters',
      details: error.message 
    });
  }
});

// Get available shelters
router.get('/available/:minCapacity', async (req, res) => {
  try {
    const { minCapacity } = req.params;
    const shelters = await Shelter.findAvailable(parseInt(minCapacity));

    res.json({
      success: true,
      shelters,
      count: shelters.length,
      min_capacity: parseInt(minCapacity)
    });
  } catch (error) {
    console.error('Error finding available shelters:', error);
    res.status(500).json({ 
      error: 'Failed to find available shelters',
      details: error.message 
    });
  }
});

// Get shelters by features
router.post('/search/features', async (req, res) => {
  try {
    const { features } = req.body;

    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).json({ 
        error: 'Features array is required' 
      });
    }

    const shelters = await Shelter.findByFeatures(features);

    res.json({
      success: true,
      shelters,
      count: shelters.length,
      required_features: features
    });
  } catch (error) {
    console.error('Error searching shelters by features:', error);
    res.status(500).json({ 
      error: 'Failed to search shelters by features',
      details: error.message 
    });
  }
});

// Get over-capacity shelters
router.get('/over-capacity/:threshold', async (req, res) => {
  try {
    const { threshold } = req.params;
    const shelters = await Shelter.findOverCapacity(parseFloat(threshold));

    res.json({
      success: true,
      shelters,
      count: shelters.length,
      threshold: parseFloat(threshold)
    });
  } catch (error) {
    console.error('Error finding over-capacity shelters:', error);
    res.status(500).json({ 
      error: 'Failed to find over-capacity shelters',
      details: error.message 
    });
  }
});

// Get shelter statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Shelter.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching shelter statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shelter statistics',
      details: error.message 
    });
  }
});

// Delete shelter
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Shelter.delete(id);

    if (!deleted) {
      return res.status(404).json({ 
        error: 'Shelter not found' 
      });
    }

    // Log the deletion
    await AgentLog.create({
      agent_name: 'intake_agent',
      action: `Shelter deleted: ID ${id}`,
      status: 'completed',
      shelter_id: parseInt(id)
    });

    res.json({
      success: true,
      message: 'Shelter deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shelter:', error);
    res.status(500).json({ 
      error: 'Failed to delete shelter',
      details: error.message 
    });
  }
});

export default router;
