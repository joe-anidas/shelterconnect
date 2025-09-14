//models/Shelter.js

import pool from '../config/database.js';

class Shelter {
  // Create a new shelter
  static async create(shelterData) {
    const { name, capacity, occupancy = 0, features, address, lat, lng, phone } = shelterData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO shelters (name, capacity, occupancy, features, address, lat, lng, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, capacity, occupancy, features, address, lat, lng, phone]
      );
      
      return { id: result.insertId, ...shelterData };
    } catch (error) {
      throw new Error(`Error creating shelter: ${error.message}`);
    }
  }

  // Find shelter by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM shelters WHERE id = ?',
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error finding shelter: ${error.message}`);
    }
  }

  // Find all shelters
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM shelters ORDER BY name'
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error fetching shelters: ${error.message}`);
    }
  }

  // Update shelter
  static async update(id, shelterData) {
    const { name, capacity, occupancy, features, address, lat, lng, phone } = shelterData;
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (capacity !== undefined) {
      fields.push('capacity = ?');
      values.push(capacity);
    }
    if (occupancy !== undefined) {
      fields.push('occupancy = ?');
      values.push(occupancy);
    }
    if (features !== undefined) {
      fields.push('features = ?');
      values.push(features);
    }
    if (address !== undefined) {
      fields.push('address = ?');
      values.push(address);
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

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    try {
      const [result] = await pool.execute(
        `UPDATE shelters SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating shelter: ${error.message}`);
    }
  }

  // Delete shelter
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM shelters WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting shelter: ${error.message}`);
    }
  }

  // Find shelters near a location
  static async findNearby(lat, lng, distance = 10000) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          id,
          name,
          capacity,
          occupancy,
          features,
          address,
          lat,
          lng,
          phone,
          (6371000 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(lat)) *
            COS(RADIANS(?) - RADIANS(lng)) +
            SIN(RADIANS(?)) * SIN(RADIANS(lat))
          )) AS distance
        FROM shelters
        HAVING distance <= ?
        ORDER BY distance ASC`,
        [lat, lng, lat, distance]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error finding nearby shelters: ${error.message}`);
    }
  }

  // Find shelters with available capacity
  static async findAvailable(minCapacity = 1) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM shelters WHERE (capacity - occupancy) >= ? ORDER BY (capacity - occupancy) DESC',
        [minCapacity]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error finding available shelters: ${error.message}`);
    }
  }

  // Find shelters by features
  static async findByFeatures(requiredFeatures) {
    try {
      const featureConditions = requiredFeatures.map(() => 'features LIKE ?').join(' AND ');
      const featureValues = requiredFeatures.map(feature => `%${feature}%`);
      
      const [rows] = await pool.execute(
        `SELECT * FROM shelters WHERE ${featureConditions}`,
        featureValues
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error finding shelters by features: ${error.message}`);
    }
  }

  // Get shelters over capacity threshold
  static async findOverCapacity(threshold = 0.8) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM shelters WHERE (occupancy / capacity) > ? ORDER BY (occupancy / capacity) DESC',
        [threshold]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error finding over-capacity shelters: ${error.message}`);
    }
  }

  // Update shelter occupancy
  static async updateOccupancy(id, newOccupancy) {
    try {
      const [result] = await pool.execute(
        'UPDATE shelters SET occupancy = ? WHERE id = ?',
        [newOccupancy, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating shelter occupancy: ${error.message}`);
    }
  }

  // Get shelter statistics
  static async getStats() {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          COUNT(*) as total_shelters,
          SUM(capacity) as total_capacity,
          SUM(occupancy) as total_occupancy,
          AVG(occupancy / capacity) as avg_occupancy_rate,
          COUNT(CASE WHEN (occupancy / capacity) > 0.8 THEN 1 END) as over_capacity_count
        FROM shelters`
      );
      
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting shelter statistics: ${error.message}`);
    }
  }
}

export default Shelter;
