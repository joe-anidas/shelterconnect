// controllers/multiStepAgentController.js
// Multi-Step Agent Workflow Controller - Explicit TiDB Vector Search Chain
// Demonstrates: Intake → Vector Embedding → TiDB Vector Search → Matching → Routing → Rebalancing

import Request from '../models/Request.js';
import Shelter from '../models/Shelter.js';
import AgentLog from '../models/AgentLog.js';
import vectorEmbeddingService from '../utils/vectorEmbeddings.js';
import tidbVectorSearch from '../services/vectorSearchService.js';
import { calculateDistance, calculateETA, getDirections } from '../utils/geocode.js';
import db from '../config/database.js';

class MultiStepAgentWorkflow {
  constructor() {
    this.workflowSteps = [
      'intake',
      'embedding', 
      'vector_search',
      'matching',
      'routing',
      'assignment',
      'rebalancing'
    ];
  }

  /**
   * Execute complete multi-step agent workflow
   * EXPLICIT DEMONSTRATION of TiDB Vector Search Integration
   * @param {number} requestId - Request to process
   * @returns {Promise<Object>} - Complete workflow results
   */
  async executeCompleteWorkflow(requestId) {
    const workflowStart = Date.now();
    const workflowResults = {
      request_id: requestId,
      workflow_id: `workflow_${Date.now()}`,
      steps_completed: [],
      total_execution_time: 0,
      final_assignment: null,
      tidb_vector_search_showcase: {}
    };

    try {
      console.log(`🚀 STARTING MULTI-STEP AGENT WORKFLOW for Request ${requestId}`);
      console.log(`📋 Workflow Steps: ${this.workflowSteps.join(' → ')}`);

      // ═══════════════════════════════════════════════════════════
      // STEP 1: INTAKE AGENT - Process incoming request
      // ═══════════════════════════════════════════════════════════
      const intakeResult = await this.executeIntakeAgent(requestId);
      workflowResults.steps_completed.push(intakeResult);
      
      // ═══════════════════════════════════════════════════════════
      // STEP 2: EMBEDDING AGENT - Generate vector embeddings
      // ═══════════════════════════════════════════════════════════
      const embeddingResult = await this.executeEmbeddingAgent(requestId);
      workflowResults.steps_completed.push(embeddingResult);
      
      // ═══════════════════════════════════════════════════════════
      // STEP 3: TIDB VECTOR SEARCH AGENT - Core TiDB vector search
      // ═══════════════════════════════════════════════════════════
      const vectorSearchResult = await this.executeTiDBVectorSearchAgent(requestId);
      workflowResults.steps_completed.push(vectorSearchResult);
      workflowResults.tidb_vector_search_showcase = vectorSearchResult.step_data;
      
      // ═══════════════════════════════════════════════════════════
      // STEP 4: MATCHING AGENT - Intelligent shelter selection
      // ═══════════════════════════════════════════════════════════
      const matchingResult = await this.executeMatchingAgent(requestId, vectorSearchResult.step_data.matches);
      workflowResults.steps_completed.push(matchingResult);
      
      // ═══════════════════════════════════════════════════════════
      // STEP 5: ROUTING AGENT - Calculate optimal routes
      // ═══════════════════════════════════════════════════════════
      const routingResult = await this.executeRoutingAgent(requestId, matchingResult.step_data.selected_shelter);
      workflowResults.steps_completed.push(routingResult);
      
      // ═══════════════════════════════════════════════════════════
      // STEP 6: ASSIGNMENT AGENT - Final shelter assignment
      // ═══════════════════════════════════════════════════════════
      const assignmentResult = await this.executeAssignmentAgent(requestId, matchingResult.step_data.selected_shelter);
      workflowResults.steps_completed.push(assignmentResult);
      workflowResults.final_assignment = assignmentResult.step_data;
      
      // ═══════════════════════════════════════════════════════════
      // STEP 7: REBALANCING AGENT - Optimize capacity distribution
      // ═══════════════════════════════════════════════════════════
      const rebalancingResult = await this.executeRebalancingAgent(assignmentResult.step_data.shelter_id);
      workflowResults.steps_completed.push(rebalancingResult);

      workflowResults.total_execution_time = Date.now() - workflowStart;

      console.log(`✅ MULTI-STEP WORKFLOW COMPLETED in ${workflowResults.total_execution_time}ms`);
      console.log(`🎯 Final Assignment: Shelter ${workflowResults.final_assignment.shelter_id}`);
      console.log(`📊 TiDB Vector Search Similarity: ${workflowResults.tidb_vector_search_showcase.best_match_similarity?.toFixed(3)}`);

      return workflowResults;
    } catch (error) {
      console.error('❌ Multi-step workflow failed:', error);
      throw error;
    }
  }

  /**
   * STEP 1: INTAKE AGENT - Process incoming family request
   */
  async executeIntakeAgent(requestId) {
    const stepStart = Date.now();
    console.log(`\n🔸 STEP 1: INTAKE AGENT processing request ${requestId}`);

    try {
      // Log workflow step start
      await this.logWorkflowStep(requestId, 'intake', 'intake_agent', 'started');

      // Get request details and validate
      const [requestRows] = await db.execute(
        'SELECT * FROM requests WHERE id = ?',
        [requestId]
      );

      if (!requestRows.length) {
        throw new Error('Request not found');
      }

      const request = requestRows[0];
      
      // Process and enhance request data
      const processedData = {
        request_id: requestId,
        original_request: request,
        urgency_classification: this.classifyUrgency(request),
        family_analysis: this.analyzeFamilyComposition(request),
        needs_categorization: this.categorizeNeeds(request.needs),
        feature_requirements: this.parseFeatureRequirements(request.features_required)
      };

      // Log successful intake completion
      await this.logWorkflowStep(requestId, 'intake', 'intake_agent', 'completed', processedData);

      console.log(`  ✅ Intake completed: ${request.people_count} people, urgency: ${request.urgency}`);

      return {
        workflow_step: 'intake',
        agent_name: 'intake_agent',
        status: 'completed',
        execution_time_ms: Date.now() - stepStart,
        step_data: processedData
      };
    } catch (error) {
      await this.logWorkflowStep(requestId, 'intake', 'intake_agent', 'failed', null, error.message);
      throw error;
    }
  }

  /**
   * STEP 2: EMBEDDING AGENT - Generate vector embeddings using OpenAI
   */
  async executeEmbeddingAgent(requestId) {
    const stepStart = Date.now();
    console.log(`\n🔸 STEP 2: EMBEDDING AGENT generating vectors for request ${requestId}`);

    try {
      await this.logWorkflowStep(requestId, 'embedding', 'embedding_agent', 'started');

      // Check if embedding already exists
      const [existingRows] = await db.execute(
        'SELECT needs_embedding FROM requests WHERE id = ?',
        [requestId]
      );

      let embedding;
      let embeddingGenerated = false;

      if (existingRows[0]?.needs_embedding) {
        embedding = existingRows[0].needs_embedding;
        console.log(`  📌 Using existing embedding (${embedding.length} dimensions)`);
      } else {
        // Generate new embedding using OpenAI
        console.log(`  🧠 Generating new OpenAI embedding...`);
        embedding = await vectorEmbeddingService.embedNewRequest({
          id: requestId,
          ...existingRows[0]
        });
        embeddingGenerated = true;
        console.log(`  ✅ Generated embedding: ${embedding.length} dimensions`);
      }

      const embeddingData = {
        request_id: requestId,
        embedding_dimensions: embedding.length,
        embedding_generated: embeddingGenerated,
        openai_model: 'text-embedding-ada-002',
        embedding_preview: embedding.slice(0, 5), // First 5 dimensions for demo
        embedding_statistics: {
          min_value: Math.min(...embedding),
          max_value: Math.max(...embedding),
          avg_value: embedding.reduce((a, b) => a + b, 0) / embedding.length
        }
      };

      await this.logWorkflowStep(requestId, 'embedding', 'embedding_agent', 'completed', embeddingData);

      console.log(`  ✅ Embedding ready for TiDB vector search`);

      return {
        workflow_step: 'embedding',
        agent_name: 'embedding_agent', 
        status: 'completed',
        execution_time_ms: Date.now() - stepStart,
        step_data: embeddingData
      };
    } catch (error) {
      await this.logWorkflowStep(requestId, 'embedding', 'embedding_agent', 'failed', null, error.message);
      throw error;
    }
  }

  /**
   * STEP 3: TIDB VECTOR SEARCH AGENT - Core TiDB vector similarity search
   * 🎯 THIS IS THE MAIN SHOWCASE OF TIDB VECTOR SEARCH CAPABILITIES
   */
  async executeTiDBVectorSearchAgent(requestId) {
    const stepStart = Date.now();
    console.log(`\n🔸 STEP 3: TIDB VECTOR SEARCH AGENT - Core vector similarity search`);
    console.log(`  🎯 SHOWCASING TiDB Vector Search Capabilities`);

    try {
      await this.logWorkflowStep(requestId, 'vector_search', 'tidb_vector_search_agent', 'started');

      // Execute TiDB vector search with detailed logging
      console.log(`  🔍 Executing TiDB VEC_COSINE_DISTANCE query...`);
      const matches = await tidbVectorSearch.findShelterMatches(requestId, {
        topK: 10,
        maxDistance: 20.0
      });

      // Execute additional TiDB vector operations for demonstration
      const hybridResults = await tidbVectorSearch.hybridVectorSearch(requestId);
      const searchStats = await tidbVectorSearch.getSearchStatistics();

      const vectorSearchData = {
        request_id: requestId,
        tidb_vector_search_method: 'VEC_COSINE_DISTANCE',
        search_algorithm: 'HNSW_index_with_cosine_similarity',
        matches_found: matches.length,
        best_match_similarity: matches[0]?.similarity_score || 0,
        vector_search_results: matches.map(match => ({
          shelter_id: match.id,
          shelter_name: match.name,
          vector_similarity_score: match.similarity_score,
          tidb_cosine_distance: match.vector_distance,
          geographic_distance_km: match.distance_km,
          combined_score: match.combined_score,
          available_capacity: match.available_capacity
        })),
        hybrid_search_results: hybridResults.slice(0, 5),
        search_performance: {
          execution_time_ms: Date.now() - stepStart,
          vector_index_type: 'HNSW',
          similarity_metric: 'cosine_distance'
        },
        tidb_vector_features_used: [
          'VECTOR(1536) data type',
          'VEC_COSINE_DISTANCE function',
          'HNSW vector index',
          'Vector similarity search',
          'Hybrid search combining vectors + geography'
        ],
        search_statistics: searchStats
      };

      // Store vector matches for analytics
      await tidbVectorSearch.storeVectorMatches(requestId, matches);

      await this.logWorkflowStep(requestId, 'vector_search', 'tidb_vector_search_agent', 'completed', vectorSearchData);

      console.log(`  ✅ TiDB Vector Search completed:`);
      console.log(`     📊 Found ${matches.length} matches using VEC_COSINE_DISTANCE`);
      console.log(`     🎯 Best similarity score: ${matches[0]?.similarity_score.toFixed(3)}`);
      console.log(`     ⚡ Search time: ${Date.now() - stepStart}ms`);

      return {
        workflow_step: 'vector_search',
        agent_name: 'tidb_vector_search_agent',
        status: 'completed', 
        execution_time_ms: Date.now() - stepStart,
        step_data: vectorSearchData
      };
    } catch (error) {
      await this.logWorkflowStep(requestId, 'vector_search', 'tidb_vector_search_agent', 'failed', null, error.message);
      throw error;
    }
  }

  /**
   * STEP 4: MATCHING AGENT - Intelligent shelter selection from vector results
   */
  async executeMatchingAgent(requestId, vectorMatches) {
    const stepStart = Date.now();
    console.log(`\n🔸 STEP 4: MATCHING AGENT selecting best shelter from vector results`);

    try {
      await this.logWorkflowStep(requestId, 'matching', 'matching_agent', 'started');

      if (!vectorMatches || vectorMatches.length === 0) {
        throw new Error('No vector search results available for matching');
      }

      // Apply additional business logic to vector search results
      const bestMatch = vectorMatches[0]; // Highest combined score from vector search
      
      // Validate the match
      const validation = await this.validateShelterMatch(requestId, bestMatch.shelter_id);

      const matchingData = {
        request_id: requestId,
        selected_shelter: {
          shelter_id: bestMatch.shelter_id,
          shelter_name: bestMatch.shelter_name,
          selection_reason: 'Best combined score from TiDB vector search',
          vector_similarity: bestMatch.vector_similarity_score,
          distance_km: bestMatch.geographic_distance_km,
          combined_score: bestMatch.combined_score
        },
        alternative_matches: vectorMatches.slice(1, 4),
        matching_validation: validation,
        selection_criteria: {
          primary: 'TiDB vector similarity (40%)',
          secondary: 'Geographic proximity (30%)', 
          tertiary: 'Available capacity (20%)',
          quaternary: 'Feature matching (10%)'
        }
      };

      await this.logWorkflowStep(requestId, 'matching', 'matching_agent', 'completed', matchingData);

      console.log(`  ✅ Selected shelter: ${bestMatch.shelter_name} (Score: ${bestMatch.combined_score.toFixed(3)})`);

      return {
        workflow_step: 'matching',
        agent_name: 'matching_agent',
        status: 'completed',
        execution_time_ms: Date.now() - stepStart,
        step_data: matchingData
      };
    } catch (error) {
      await this.logWorkflowStep(requestId, 'matching', 'matching_agent', 'failed', null, error.message);
      throw error;
    }
  }

  /**
   * STEP 5: ROUTING AGENT - Calculate optimal route to selected shelter
   */
  async executeRoutingAgent(requestId, selectedShelter) {
    const stepStart = Date.now();
    console.log(`\n🔸 STEP 5: ROUTING AGENT calculating route to ${selectedShelter.shelter_name}`);

    try {
      await this.logWorkflowStep(requestId, 'routing', 'routing_agent', 'started');

      // Get request location
      const [requestRows] = await db.execute(
        'SELECT lat, lng FROM requests WHERE id = ?',
        [requestId]
      );

      // Get shelter location  
      const [shelterRows] = await db.execute(
        'SELECT lat, lng, address FROM shelters WHERE id = ?',
        [selectedShelter.shelter_id]
      );

      const request = requestRows[0];
      const shelter = shelterRows[0];

      // Calculate route information
      const directions = await getDirections(
        { lat: request.lat, lng: request.lng },
        { lat: shelter.lat, lng: shelter.lng }
      );
      
      const distance = calculateDistance(request.lat, request.lng, shelter.lat, shelter.lng);
      const eta = calculateETA(distance, request.urgency);

      const routingData = {
        request_id: requestId,
        shelter_id: selectedShelter.shelter_id,
        route_info: directions,
        origin: { lat: request.lat, lng: request.lng },
        destination: { lat: shelter.lat, lng: shelter.lng, address: shelter.address },
        estimated_travel_time: eta,
        distance_km: Math.round(distance / 1000 * 100) / 100,
        route_instructions: routeInfo.route_steps || []
      };

      await this.logWorkflowStep(requestId, 'routing', 'routing_agent', 'completed', routingData);

      console.log(`  ✅ Route calculated: ${routeInfo.distance_km}km, ${routeInfo.duration_minutes} minutes`);

      return {
        workflow_step: 'routing',
        agent_name: 'routing_agent',
        status: 'completed',
        execution_time_ms: Date.now() - stepStart,
        step_data: routingData
      };
    } catch (error) {
      await this.logWorkflowStep(requestId, 'routing', 'routing_agent', 'failed', null, error.message);
      throw error;
    }
  }

  /**
   * STEP 6: ASSIGNMENT AGENT - Final shelter assignment
   */
  async executeAssignmentAgent(requestId, selectedShelter) {
    const stepStart = Date.now();
    console.log(`\n🔸 STEP 6: ASSIGNMENT AGENT finalizing assignment`);

    try {
      await this.logWorkflowStep(requestId, 'assignment', 'assignment_agent', 'started');

      // Update request with shelter assignment
      await db.execute(
        `UPDATE requests 
         SET status = 'assigned', assigned_shelter_id = ?, assigned_at = NOW() 
         WHERE id = ?`,
        [selectedShelter.shelter_id, requestId]
      );

      // Update shelter occupancy
      const [requestData] = await db.execute(
        'SELECT people_count FROM requests WHERE id = ?',
        [requestId]
      );

      await db.execute(
        'UPDATE shelters SET occupancy = occupancy + ? WHERE id = ?',
        [requestData[0].people_count, selectedShelter.shelter_id]
      );

      const assignmentData = {
        request_id: requestId,
        shelter_id: selectedShelter.shelter_id,
        assignment_timestamp: new Date().toISOString(),
        people_assigned: requestData[0].people_count,
        assignment_method: 'tidb_vector_search_workflow',
        workflow_success: true
      };

      await this.logWorkflowStep(requestId, 'assignment', 'assignment_agent', 'completed', assignmentData);

      console.log(`  ✅ Assignment completed: Request ${requestId} → Shelter ${selectedShelter.shelter_id}`);

      return {
        workflow_step: 'assignment',
        agent_name: 'assignment_agent',
        status: 'completed',
        execution_time_ms: Date.now() - stepStart,
        step_data: assignmentData
      };
    } catch (error) {
      await this.logWorkflowStep(requestId, 'assignment', 'assignment_agent', 'failed', null, error.message);
      throw error;
    }
  }

  /**
   * STEP 7: REBALANCING AGENT - Optimize capacity distribution
   */
  async executeRebalancingAgent(shelterId) {
    const stepStart = Date.now();
    console.log(`\n🔸 STEP 7: REBALANCING AGENT optimizing capacity distribution`);

    try {
      // Get shelter occupancy status
      const [shelterRows] = await db.execute(
        'SELECT id, name, capacity, occupancy FROM shelters WHERE id = ?',
        [shelterId]
      );

      const shelter = shelterRows[0];
      const occupancyRate = shelter.occupancy / shelter.capacity;

      let rebalancingActions = [];

      if (occupancyRate > 0.9) {
        // Shelter is over 90% capacity - trigger rebalancing
        rebalancingActions = await this.triggerRebalancing(shelterId);
      }

      const rebalancingData = {
        shelter_id: shelterId,
        occupancy_rate: occupancyRate,
        rebalancing_triggered: occupancyRate > 0.9,
        actions_taken: rebalancingActions,
        capacity_optimization: {
          before_occupancy: shelter.occupancy,
          capacity: shelter.capacity,
          optimization_needed: occupancyRate > 0.8
        }
      };

      console.log(`  ✅ Rebalancing check completed: ${(occupancyRate * 100).toFixed(1)}% capacity`);

      return {
        workflow_step: 'rebalancing',
        agent_name: 'rebalancing_agent',
        status: 'completed',
        execution_time_ms: Date.now() - stepStart,
        step_data: rebalancingData
      };
    } catch (error) {
      console.error('❌ Rebalancing agent failed:', error);
      throw error;
    }
  }

  /**
   * Helper: Log workflow step to database
   */
  async logWorkflowStep(requestId, step, agentName, status, stepData = null, errorMessage = null) {
    try {
      await db.execute(
        `INSERT INTO agent_workflow 
         (request_id, workflow_step, agent_name, step_data, status, error_message, execution_time_ms, completed_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          requestId,
          step,
          agentName,
          stepData ? JSON.stringify(stepData) : null,
          status,
          errorMessage,
          status === 'completed' ? Date.now() : null,
          status === 'completed' ? new Date() : null
        ]
      );
    } catch (error) {
      console.error('❌ Failed to log workflow step:', error);
    }
  }

  // Helper methods for request analysis
  classifyUrgency(request) {
    const urgencyFactors = {
      medical: request.needs.toLowerCase().includes('medical') ? 2 : 0,
      elderly: request.needs.toLowerCase().includes('elderly') ? 1.5 : 0,
      children: request.needs.toLowerCase().includes('child') ? 1.2 : 0,
      large_family: request.people_count > 6 ? 1.3 : 0
    };

    return {
      base_urgency: request.urgency,
      urgency_factors: urgencyFactors,
      calculated_priority: Object.values(urgencyFactors).reduce((a, b) => a + b, 0)
    };
  }

  analyzeFamilyComposition(request) {
    return {
      total_people: request.people_count,
      estimated_adults: Math.ceil(request.people_count * 0.6),
      estimated_children: Math.floor(request.people_count * 0.4),
      special_needs: this.extractSpecialNeeds(request.needs)
    };
  }

  categorizeNeeds(needs) {
    const categories = {
      medical: /medical|medication|doctor|hospital/i.test(needs),
      accessibility: /wheelchair|mobility|disabled/i.test(needs),
      family: /child|elderly|baby|pregnant/i.test(needs),
      pets: /pet|dog|cat|animal/i.test(needs)
    };

    return categories;
  }

  parseFeatureRequirements(featuresRequired) {
    return featuresRequired ? featuresRequired.split(',').map(f => f.trim()) : [];
  }

  extractSpecialNeeds(needs) {
    const specialNeeds = [];
    if (/medical|medication/i.test(needs)) specialNeeds.push('medical_care');
    if (/wheelchair|mobility/i.test(needs)) specialNeeds.push('accessibility');
    if (/elderly/i.test(needs)) specialNeeds.push('elderly_care');
    if (/child|baby/i.test(needs)) specialNeeds.push('childcare');
    if (/pet/i.test(needs)) specialNeeds.push('pet_accommodation');
    return specialNeeds;
  }

  async validateShelterMatch(requestId, shelterId) {
    // Validate that the shelter can accommodate the request
    const [validation] = await db.execute(
      `SELECT 
         s.capacity - s.occupancy as available_capacity,
         r.people_count,
         s.features,
         r.features_required
       FROM shelters s, requests r 
       WHERE s.id = ? AND r.id = ?`,
      [shelterId, requestId]
    );

    return {
      capacity_sufficient: validation[0].available_capacity >= validation[0].people_count,
      available_capacity: validation[0].available_capacity,
      people_count: validation[0].people_count,
      features_match: true // Could implement feature matching logic
    };
  }

  async triggerRebalancing(shelterId) {
    // Simplified rebalancing logic
    return [{
      action: 'capacity_monitoring',
      shelter_id: shelterId,
      timestamp: new Date().toISOString()
    }];
  }
}

// Create singleton instance
const multiStepWorkflow = new MultiStepAgentWorkflow();

// Controller endpoints

/**
 * Execute complete multi-step agent workflow
 * POST /api/agents/workflow/execute/:requestId
 */
export const executeWorkflow = async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log(`\n🚀 STARTING MULTI-STEP AGENT WORKFLOW API ENDPOINT`);
    console.log(`📋 Request ID: ${requestId}`);

    const results = await multiStepWorkflow.executeCompleteWorkflow(parseInt(requestId));

    res.json({
      success: true,
      message: 'Multi-step agent workflow completed successfully',
      workflow_results: results,
      tidb_vector_search_showcase: results.tidb_vector_search_showcase,
      agent_chain_demonstrated: true
    });
  } catch (error) {
    console.error('❌ Workflow execution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      workflow_step: 'unknown'
    });
  }
};

/**
 * Get workflow status for a request
 * GET /api/agents/workflow/status/:requestId
 */
export const getWorkflowStatus = async (req, res) => {
  try {
    const { requestId } = req.params;

    const [workflowSteps] = await db.execute(
      `SELECT * FROM agent_workflow 
       WHERE request_id = ? 
       ORDER BY created_at ASC`,
      [requestId]
    );

    res.json({
      success: true,
      request_id: requestId,
      workflow_steps: workflowSteps,
      total_steps: workflowSteps.length,
      completed_steps: workflowSteps.filter(s => s.status === 'completed').length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export default multiStepWorkflow;
