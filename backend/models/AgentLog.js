import pool from '../config/database.js';

class AgentLog {
  // Create a new agent log entry
  static async create(logData) {
    const { agent_name, action, status = 'processing', request_id, shelter_id, details } = logData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO agent_logs (agent_name, action, status, request_id, shelter_id, details) VALUES (?, ?, ?, ?, ?, ?)',
        [
          agent_name, 
          action, 
          status, 
          request_id || null, 
          shelter_id || null, 
          details ? JSON.stringify(details) : null
        ]
      );
      
      return { id: result.insertId, ...logData, timestamp: new Date() };
    } catch (error) {
      throw new Error(`Error creating agent log: ${error.message}`);
    }
  }

  // Update log status
  static async updateStatus(id, status, details = null) {
    try {
      await pool.execute(
        'UPDATE agent_logs SET status = ?, details = ? WHERE id = ?',
        [status, details ? JSON.stringify(details) : null, id]
      );
      
      return true;
    } catch (error) {
      throw new Error(`Error updating agent log: ${error.message}`);
    }
  }

  // Find log by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM agent_logs WHERE id = ?',
        [id]
      );
      
      if (rows.length > 0 && rows[0].details && typeof rows[0].details === 'string') {
        try {
          rows[0].details = JSON.parse(rows[0].details);
        } catch (e) {
          console.warn('Failed to parse log.details as JSON:', rows[0].details);
        }
      }
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error finding agent log: ${error.message}`);
    }
  }

  // Find all logs with pagination
  static async findAll(limit = 50, offset = 0) {
    try {
      // Ensure limit and offset are valid integers
      const validLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
      const validOffset = Math.max(parseInt(offset) || 0, 0);
      
      const [rows] = await pool.execute(
        `SELECT * FROM agent_logs ORDER BY timestamp DESC LIMIT ${validLimit} OFFSET ${validOffset}`
      );
      
      return rows.map(log => {
        if (log.details && typeof log.details === 'string') {
          try {
            log.details = JSON.parse(log.details);
          } catch (e) {
            console.warn('Failed to parse log.details as JSON:', log.details);
          }
        }
        return log;
      });
    } catch (error) {
      throw new Error(`Error fetching agent logs: ${error.message}`);
    }
  }

  // Find logs by agent type
  static async findByAgent(agent_name, limit = 50) {
    try {
      const validLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
      
      const [rows] = await pool.execute(
        `SELECT * FROM agent_logs WHERE agent_name = ? ORDER BY timestamp DESC LIMIT ${validLimit}`,
        [agent_name]
      );
      
      return rows.map(log => {
        if (log.details && typeof log.details === 'string') {
          try {
            log.details = JSON.parse(log.details);
          } catch (e) {
            console.warn('Failed to parse log.details as JSON:', log.details);
          }
        }
        return log;
      });
    } catch (error) {
      throw new Error(`Error fetching agent logs by agent: ${error.message}`);
    }
  }

  // Find logs by request ID
  static async findByRequest(request_id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM agent_logs WHERE request_id = ? ORDER BY timestamp DESC',
        [request_id]
      );
      
      return rows.map(log => {
        if (log.details && typeof log.details === 'string') {
          try {
            log.details = JSON.parse(log.details);
          } catch (e) {
            console.warn('Failed to parse log.details as JSON:', log.details);
          }
        }
        return log;
      });
    } catch (error) {
      throw new Error(`Error fetching logs by request: ${error.message}`);
    }
  }

  // Find logs by shelter ID
  static async findByShelter(shelter_id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM agent_logs WHERE shelter_id = ? ORDER BY timestamp DESC',
        [shelter_id]
      );
      
      return rows.map(log => {
        if (log.details && typeof log.details === 'string') {
          try {
            log.details = JSON.parse(log.details);
          } catch (e) {
            console.warn('Failed to parse log.details as JSON:', log.details);
          }
        }
        return log;
      });
    } catch (error) {
      throw new Error(`Error fetching logs by shelter: ${error.message}`);
    }
  }

  // Find logs by status
  static async findByStatus(status, limit = 50) {
    try {
      const validLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
      
      const [rows] = await pool.execute(
        `SELECT * FROM agent_logs WHERE status = ? ORDER BY timestamp DESC LIMIT ${validLimit}`,
        [status]
      );
      
      return rows.map(log => {
        if (log.details && typeof log.details === 'string') {
          try {
            log.details = JSON.parse(log.details);
          } catch (e) {
            console.warn('Failed to parse log.details as JSON:', log.details);
          }
        }
        return log;
      });
    } catch (error) {
      throw new Error(`Error fetching logs by status: ${error.message}`);
    }
  }

  // Get recent logs
  static async getRecent(hours = 24, limit = 100) {
    try {
      const validHours = Math.min(Math.max(parseInt(hours) || 24, 1), 168);
      const validLimit = Math.min(Math.max(parseInt(limit) || 100, 1), 200);
      

      
      // Additional validation to ensure they are actual integers
      if (isNaN(validHours) || isNaN(validLimit)) {
        throw new Error(`Invalid parameters: hours=${validHours}, limit=${validLimit}`);
      }
      
      // Use string interpolation for LIMIT since TiDB might not support parameterized LIMIT
      const [rows] = await pool.execute(
        `SELECT * FROM agent_logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR) ORDER BY timestamp DESC LIMIT ${validLimit}`,
        [validHours]
      );
      
      return rows.map(log => {
        if (log.details && typeof log.details === 'string') {
          try {
            log.details = JSON.parse(log.details);
          } catch (e) {
            console.warn('Failed to parse log.details as JSON:', log.details);
          }
        }
        return log;
      });
    } catch (error) {
      throw new Error(`Error fetching recent agent logs: ${error.message}`);
    }
  }

  // Get agent statistics
  static async getAgentStats() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          agent_name,
          COUNT(*) as total_actions,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_actions,
          COUNT(CASE WHEN status = 'error' THEN 1 END) as error_actions,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_actions
        FROM agent_logs 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY agent_name
      `);
      
      return rows;
    } catch (error) {
      throw new Error(`Error fetching agent statistics: ${error.message}`);
    }
  }
}

export default AgentLog;
