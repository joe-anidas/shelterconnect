//routes/agents.js

import express from 'express';
import { 
  findBestMatch, 
  processPendingRequests, 
  getMatchingStats 
} from '../controllers/matchingController.js';
import { 
  calculateRoute, 
  calculateBulkRoutes, 
  getRouteOptimization 
} from '../controllers/routingController.js';
import { 
  monitorOccupancy, 
  executeRebalancing, 
  getRebalancingHistory, 
  getCapacityAlerts 
} from '../controllers/rebalanceController.js';
import { 
  executeWorkflow, 
  getWorkflowStatus 
} from '../controllers/multiStepAgentController.js';
import { 
  executeDemoWorkflow, 
  getDemoWorkflowStatus 
} from '../controllers/demoMultiStepAgentController.js';
import AgentLog from '../models/AgentLog.js';

const router = express.Router();

// Matching Agent routes
router.post('/matching/find-match/:requestId', findBestMatch);
router.post('/matching/process-pending', processPendingRequests);
router.get('/matching/stats', getMatchingStats);

// Routing Agent routes
router.get('/routing/calculate/:requestId', calculateRoute);
router.post('/routing/calculate-bulk', calculateBulkRoutes);
router.get('/routing/optimization/:shelterId', getRouteOptimization);

// Rebalance Agent routes
router.get('/rebalance/monitor', monitorOccupancy);
router.post('/rebalance/execute', executeRebalancing);
router.get('/rebalance/history', getRebalancingHistory);
router.get('/rebalance/alerts', getCapacityAlerts);

// 🎯 Multi-Step Agent Workflow Routes - TiDB Vector Search Showcase
router.post('/workflow/execute/:requestId', executeWorkflow);
router.get('/workflow/status/:requestId', getWorkflowStatus);

// 🎯 Demo Multi-Step Agent Workflow Routes - Working with existing schema
router.post('/demo-workflow/execute/:requestId', executeDemoWorkflow);
router.get('/demo-workflow/status/:requestId', getDemoWorkflowStatus);

// Agent Logs routes
router.get('/logs', async (req, res) => {
  try {
    const { limit = 50, offset = 0, agent, status, hours } = req.query;
    
    // Parse and validate parameters
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);
    const parsedHours = Math.min(Math.max(parseInt(hours) || 24, 1), 168); // Max 1 week
    
    let logs;
    if (agent) {
      logs = await AgentLog.findByAgent(agent, parsedLimit);
    } else if (status) {
      logs = await AgentLog.findByStatus(status, parsedLimit);
    } else if (hours !== undefined) {
      logs = await AgentLog.getRecent(parsedHours, parsedLimit);
    } else {
      logs = await AgentLog.findAll(parsedLimit, parsedOffset);
    }

    res.json({
      success: true,
      logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Error fetching agent logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch agent logs',
      details: error.message 
    });
  }
});

// Get agent statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await AgentLog.getAgentStats();
    const activity = await AgentLog.getActivitySummary(24);

    res.json({
      success: true,
      agent_stats: stats,
      recent_activity: activity
    });
  } catch (error) {
    console.error('Error fetching agent statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch agent statistics',
      details: error.message 
    });
  }
});

// Get logs by request
router.get('/logs/request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const logs = await AgentLog.findByRequest(parseInt(requestId));

    res.json({
      success: true,
      logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Error fetching request logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch request logs',
      details: error.message 
    });
  }
});

// Get logs by shelter
router.get('/logs/shelter/:shelterId', async (req, res) => {
  try {
    const { shelterId } = req.params;
    const logs = await AgentLog.findByShelter(parseInt(shelterId));

    res.json({
      success: true,
      logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Error fetching shelter logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shelter logs',
      details: error.message 
    });
  }
});

// Clean old logs (maintenance)
router.delete('/logs/cleanup', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const deletedCount = await AgentLog.cleanOldLogs(parseInt(days));

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old log entries`,
      deleted_count: deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    res.status(500).json({ 
      error: 'Failed to clean up logs',
      details: error.message 
    });
  }
});

export default router;
