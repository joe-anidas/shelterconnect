//models/Request.js

import pool from '../config/database.js';

class Request {
  // Create a new request
  static async create(requestData) {
    const { 
      name, 
      people_count, 
      needs, 
      features_required, 
      lat, 
      lng, 
      phone, 
      urgency = 'medium' 
    } = requestData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO requests (name, people_count, needs, features_required, lat, lng, phone, urgency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, people_count, needs, features_required, lat, lng, phone, urgency]
      );
      
      return { id: result.insertId, ...requestData, status: 'pending' };
    } catch (error) {
      throw new Error(`Error creating request: ${error.message}`);
    }
  }

  // Find request by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT r.*, s.name as assigned_shelter_name FROM requests r LEFT JOIN shelters s ON r.assigned_shelter_id = s.id WHERE r.id = ?',
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error finding request: ${error.message}`);
    }
  }

  // Find all requests
  static async findAll(limit = 50, offset = 0) {
    try {
      // Ensure limit and offset are valid integers
      const validLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
      const validOffset = Math.max(parseInt(offset) || 0, 0);
      

      
      // Additional validation to ensure they are actual integers
      if (isNaN(validLimit) || isNaN(validOffset)) {
        throw new Error(`Invalid parameters: limit=${validLimit}, offset=${validOffset}`);
      }
      
      // Use string interpolation for LIMIT and OFFSET since TiDB might not support parameterized LIMIT
      const [rows] = await pool.execute(
        `SELECT r.*, s.name as assigned_shelter_name 
         FROM requests r 
         LEFT JOIN shelters s ON r.assigned_shelter_id = s.id 
         ORDER BY r.created_at DESC 
         LIMIT ${validLimit} OFFSET ${validOffset}`
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error fetching requests: ${error.message}`);
    }
  }

  // Find pending requests
  static async findPending() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM requests WHERE status = "pending" ORDER BY urgency DESC, created_at ASC'
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error fetching pending requests: ${error.message}`);
    }
  }

  // Find requests by status
  static async findByStatus(status) {
    try {
      const [rows] = await pool.execute(
        'SELECT r.*, s.name as assigned_shelter_name FROM requests r LEFT JOIN shelters s ON r.assigned_shelter_id = s.id WHERE r.status = ? ORDER BY r.created_at DESC',
        [status]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error fetching requests by status: ${error.message}`);
    }
  }

  // Find requests by urgency
  static async findByUrgency(urgency) {
    try {
      const [rows] = await pool.execute(
        'SELECT r.*, s.name as assigned_shelter_name FROM requests r LEFT JOIN shelters s ON r.assigned_shelter_id = s.id WHERE r.urgency = ? ORDER BY r.created_at DESC',
        [urgency]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error fetching requests by urgency: ${error.message}`);
    }
  }

  // Update request
  static async update(id, requestData) {
    const { 
      name, 
      people_count, 
      needs, 
      features_required, 
      lat, 
      lng, 
      phone, 
      urgency, 
      status, 
      assigned_shelter_id 
    } = requestData;
    
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (people_count !== undefined) {
      fields.push('people_count = ?');
      values.push(people_count);
    }
    if (needs !== undefined) {
      fields.push('needs = ?');
      values.push(needs);
    }
    if (features_required !== undefined) {
      fields.push('features_required = ?');
      values.push(features_required);
    }
    if (lat !== undefined) {
      fields.push('lat = ?');
      values.push(lat);
    }
    if (lng !== undefined) {
      fields.push('lng = ?');
      values.push(lng);
    }
    if (phone !== undefined) {
      fields.push('phone = ?');
      values.push(phone);
    }
    if (urgency !== undefined) {
      fields.push('urgency = ?');
      values.push(urgency);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }
    if (assigned_shelter_id !== undefined) {
      fields.push('assigned_shelter_id = ?');
      values.push(assigned_shelter_id);
      if (assigned_shelter_id) {
        fields.push('assigned_at = NOW()');
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    try {
      const [result] = await pool.execute(
        `UPDATE requests SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating request: ${error.message}`);
    }
  }

  // Assign request to shelter
  static async assignToShelter(requestId, shelterId) {
    try {
      const [result] = await pool.execute(
        'UPDATE requests SET assigned_shelter_id = ?, status = "assigned", assigned_at = NOW() WHERE id = ?',
        [shelterId, requestId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error assigning request to shelter: ${error.message}`);
    }
  }

  // Resolve request with shelter assignment and update occupancy
  static async resolveRequest(requestId, shelterId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get current request data including existing assignment
      const [currentRequestData] = await connection.execute(
        'SELECT people_count, assigned_shelter_id, status FROM requests WHERE id = ?',
        [requestId]
      );
      
      if (currentRequestData.length === 0) {
        throw new Error('Request not found');
      }
      
      const { people_count: peopleCount, assigned_shelter_id: oldShelterId, status } = currentRequestData[0];
      
      // If request was already assigned to a different shelter, decrease old shelter occupancy
      if (oldShelterId && oldShelterId !== shelterId && (status === 'assigned' || status === 'resolved')) {
        await connection.execute(
          'UPDATE shelters SET occupancy = GREATEST(0, occupancy - ?) WHERE id = ?',
          [peopleCount, oldShelterId]
        );
      }
      
      // Update request status to resolved with new shelter assignment
      const [requestResult] = await connection.execute(
        'UPDATE requests SET assigned_shelter_id = ?, status = "resolved", resolved_at = NOW() WHERE id = ?',
        [shelterId, requestId]
      );
      
      if (requestResult.affectedRows === 0) {
        throw new Error('Request not found or could not be updated');
      }
      
      // Update new shelter occupancy
      const [shelterResult] = await connection.execute(
        'UPDATE shelters SET occupancy = occupancy + ? WHERE id = ?',
        [peopleCount, shelterId]
      );
      
      if (shelterResult.affectedRows === 0) {
        throw new Error('Shelter not found');
      }
      
      await connection.commit();
      
      // Return the new occupancy and old shelter info
      const [newShelterData] = await connection.execute(
        'SELECT occupancy, name FROM shelters WHERE id = ?',
        [shelterId]
      );
      
      let oldShelterData = null;
      if (oldShelterId && oldShelterId !== shelterId) {
        const [oldData] = await connection.execute(
          'SELECT occupancy, name FROM shelters WHERE id = ?',
          [oldShelterId]
        );
        oldShelterData = oldData[0] || null;
      }
      
      return {
        success: true,
        newOccupancy: newShelterData[0].occupancy,
        newShelterName: newShelterData[0].name,
        oldShelterData: oldShelterData ? {
          occupancy: oldShelterData.occupancy,
          name: oldShelterData.name,
          id: oldShelterId
        } : null
      };
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error resolving request: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Delete request
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM requests WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting request: ${error.message}`);
    }
  }

  // Find requests near a location
  static async findNearby(lat, lng, distance = 10000) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          r.*,
          s.name as assigned_shelter_name,
          (6371000 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(r.lat)) *
            COS(RADIANS(?) - RADIANS(r.lng)) +
            SIN(RADIANS(?)) * SIN(RADIANS(r.lat))
          )) AS distance
        FROM requests r
        LEFT JOIN shelters s ON r.assigned_shelter_id = s.id
        HAVING distance <= ?
        ORDER BY distance ASC`,
        [lat, lng, lat, distance]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error finding nearby requests: ${error.message}`);
    }
  }

  // Find requests by urgency
  static async findByUrgency(urgency) {
    try {
      const [rows] = await pool.execute(
        'SELECT r.*, s.name as assigned_shelter_name FROM requests r LEFT JOIN shelters s ON r.assigned_shelter_id = s.id WHERE r.urgency = ? ORDER BY r.created_at DESC',
        [urgency]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error finding requests by urgency: ${error.message}`);
    }
  }

  // Find requests by features
  static async findByFeatures(requiredFeatures) {
    try {
      const featureConditions = requiredFeatures.map(() => 'features_required LIKE ?').join(' AND ');
      const featureValues = requiredFeatures.map(feature => `%${feature}%`);
      
      const [rows] = await pool.execute(
        `SELECT r.*, s.name as assigned_shelter_name 
         FROM requests r 
         LEFT JOIN shelters s ON r.assigned_shelter_id = s.id 
         WHERE ${featureConditions}`,
        featureValues
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error finding requests by features: ${error.message}`);
    }
  }

  // Get request statistics
  static async getStats() {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
          COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned_requests,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
          COUNT(CASE WHEN urgency = 'high' THEN 1 END) as high_urgency_requests,
          COUNT(CASE WHEN urgency = 'medium' THEN 1 END) as medium_urgency_requests,
          COUNT(CASE WHEN urgency = 'low' THEN 1 END) as low_urgency_requests,
          AVG(people_count) as avg_family_size
        FROM requests`
      );
      
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting request statistics: ${error.message}`);
    }
  }

  // Get requests by shelter
  static async findByShelter(shelterId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM requests WHERE assigned_shelter_id = ? ORDER BY assigned_at DESC',
        [shelterId]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error finding requests by shelter: ${error.message}`);
    }
  }
}

export default Request;
