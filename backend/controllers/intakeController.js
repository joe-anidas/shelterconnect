//controllers/intakeController.js

import Request from '../models/Request.js';
import AgentLog from '../models/AgentLog.js';
import Shelter from '../models/Shelter.js';
import { generateEmbedding } from '../utils/embeddings.js';

// Process new family request
export const processRequest = async (req, res) => {
  try {
    const { name, people_count, needs, features_required, lat, lng, phone, urgency } = req.body;

    // Validate required fields
    if (!name || !people_count || !lat || !lng) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, people_count, lat, lng' 
      });
    }

    // Create agent log entry
    const logEntry = await AgentLog.create({
      agent_name: 'intake_agent',
      action: `Processing intake request from ${name} (${people_count} people)`,
      status: 'processing',
      details: { people_count, urgency, needs }
    });

    // Create request
    const requestData = {
      name,
      people_count: parseInt(people_count),
      needs: needs || '',
      features_required: Array.isArray(features_required) ? features_required.join(',') : features_required || '',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      phone: phone || '',
      urgency: urgency || 'medium'
    };

    const request = await Request.create(requestData);

    // Generate embedding for vector search
    try {
      const embeddingText = `${needs} ${features_required}`.trim();
      if (embeddingText) {
        const embedding = await generateEmbedding(embeddingText);
        // Store embedding in request_vectors table
        // This would be implemented with TiDB Serverless vector columns
        console.log('Generated embedding for request:', request.id);
      }
    } catch (embeddingError) {
      console.warn('Failed to generate embedding:', embeddingError.message);
    }

    // Update log entry
    await AgentLog.updateStatus(logEntry.id, 'completed', {
      request_id: request.id,
      embedding_generated: true
    });

    res.status(201).json({
      success: true,
      message: 'Request processed successfully',
      request: {
        id: request.id,
        name: request.name,
        people_count: request.people_count,
        status: request.status,
        urgency: request.urgency,
        created_at: request.created_at
      }
    });

  } catch (error) {
    console.error('Intake agent error:', error);
    
    // Log error
    await AgentLog.create({
      agent_name: 'intake_agent',
      action: `Error processing request: ${error.message}`,
      status: 'error',
      details: { error: error.message }
    });

    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
};

// Get all requests
export const getRequests = async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, urgency } = req.query;
    
    // Parse and validate limit/offset values
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);
    
    let requests;
    if (status) {
      requests = await Request.findByStatus(status);
    } else if (urgency) {
      requests = await Request.findByUrgency(urgency);
    } else {
      requests = await Request.findAll(parsedLimit, parsedOffset);
    }

    res.json({
      success: true,
      requests,
      count: requests.length
    });

  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ 
      error: 'Failed to fetch requests',
      details: error.message 
    });
  }
};

// Get request by ID
export const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({ 
        error: 'Request not found' 
      });
    }

    res.json({
      success: true,
      request
    });

  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ 
      error: 'Failed to fetch request',
      details: error.message 
    });
  }
};

// Get pending requests
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.findPending();

    res.json({
      success: true,
      requests,
      count: requests.length
    });

  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pending requests',
      details: error.message 
    });
  }
};

// Update request status
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_shelter_id } = req.body;

    const updated = await Request.update(id, { status, assigned_shelter_id });

    if (!updated) {
      return res.status(404).json({ 
        error: 'Request not found' 
      });
    }

    // Log the status change
    await AgentLog.create({
      agent_name: 'intake_agent',
      action: `Request ${id} status updated to ${status}`,
      status: 'completed',
      request_id: parseInt(id),
      shelter_id: assigned_shelter_id ? parseInt(assigned_shelter_id) : null
    });

    res.json({
      success: true,
      message: 'Request status updated successfully'
    });

  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ 
      error: 'Failed to update request status',
      details: error.message 
    });
  }
};

// Accept arrival: mark request completed and increment shelter occupancy
export const acceptArrival = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (!request.assigned_shelter_id) {
      return res.status(400).json({ error: 'Request has no assigned shelter' });
    }

    // Update request status to completed
    await Request.update(id, { status: 'completed' });

    // Increment occupancy by people_count
    const shelter = await Shelter.findById(request.assigned_shelter_id);
    if (!shelter) {
      return res.status(404).json({ error: 'Assigned shelter not found' });
    }
    const newOccupancy = Math.max(0, Math.min(shelter.capacity, (shelter.occupancy || 0) + (request.people_count || 0)));
    await Shelter.updateOccupancy(shelter.id, newOccupancy);

    // Log
    await AgentLog.create({
      agent_name: 'intake_agent',
      action: `Arrival accepted for request ${id} at ${shelter.name} (+${request.people_count})`,
      status: 'completed',
      request_id: parseInt(id),
      shelter_id: shelter.id,
      details: { people_count: request.people_count, new_occupancy: newOccupancy }
    });

    res.json({ success: true, message: 'Arrival accepted and occupancy updated', new_occupancy: newOccupancy });
  } catch (error) {
    console.error('Error accepting arrival:', error);
    res.status(500).json({ error: 'Failed to accept arrival', details: error.message });
  }
};

// Get request statistics
export const getRequestStats = async (req, res) => {
  try {
    const stats = await Request.getStats();

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching request statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch request statistics',
      details: error.message 
    });
  }
};

// Delete a request
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Request.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await AgentLog.create({
      agent_name: 'intake_agent',
      action: `Request ${id} deleted by admin`,
      status: 'completed',
      request_id: parseInt(id)
    });

    res.json({ success: true, message: 'Request deleted' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request', details: error.message });
  }
};
