// services/vectorSearchService.js
// TiDB Vector Search Service - Core vector similarity search implementation
// Demonstrates TiDB's vector search capabilities for shelter-request matching

import db from '../config/database.js';
import vectorEmbeddingService from '../utils/vectorEmbeddings.js';

class TiDBVectorSearchService {
  constructor() {
    this.defaultTopK = 10;
    this.maxDistance = 15.0; // km
    this.similarityThreshold = 0.7; // Minimum similarity score
  }

  /**
   * Find best shelter matches using TiDB vector similarity search
   * Core showcase of TiDB vector search capabilities
   * @param {number} requestId - Request ID to match
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Ranked shelter matches with similarity scores
   */
  async findShelterMatches(requestId, options = {}) {
    try {
      console.log(`🔍 TiDB Vector Search: Finding matches for request ${requestId}`);
      const startTime = Date.now();

      // Get request embedding from database
      const [requestRows] = await db.execute(
        'SELECT needs_embedding, lat, lng, people_count, features_required FROM requests WHERE id = ?',
        [requestId]
      );

      if (!requestRows.length || !requestRows[0].needs_embedding) {
        throw new Error('Request not found or embedding not generated');
      }

      const request = requestRows[0];
      const requestEmbedding = request.needs_embedding;
      
      // TiDB Vector Search Query - Core demonstration
      const searchQuery = `
        SELECT 
          s.id,
          s.name,
          s.capacity,
          s.occupancy,
          (s.capacity - s.occupancy) as available_capacity,
          s.features,
          s.address,
          s.lat,
          s.lng,
          s.phone,
          -- TiDB Vector Similarity Search (Cosine Distance)
          VEC_COSINE_DISTANCE(s.features_embedding, ?) as vector_distance,
          (1 - VEC_COSINE_DISTANCE(s.features_embedding, ?)) as similarity_score,
          -- Geographic Distance
          ROUND(6371 * 2 * ASIN(SQRT(
            POWER(SIN((s.lat - ?) * PI() / 180 / 2), 2) + 
            COS(? * PI() / 180) * COS(s.lat * PI() / 180) * 
            POWER(SIN((s.lng - ?) * PI() / 180 / 2), 2)
          )), 2) as distance_km,
          -- Capacity Score
          CASE 
            WHEN (s.capacity - s.occupancy) >= ? THEN 1.0
            WHEN (s.capacity - s.occupancy) > 0 THEN (s.capacity - s.occupancy) / ?
            ELSE 0.0
          END as capacity_score
        FROM shelters s
        WHERE s.features_embedding IS NOT NULL
          AND (s.capacity - s.occupancy) > 0
          AND ROUND(6371 * 2 * ASIN(SQRT(
            POWER(SIN((s.lat - ?) * PI() / 180 / 2), 2) + 
            COS(? * PI() / 180) * COS(s.lat * PI() / 180) * 
            POWER(SIN((s.lng - ?) * PI() / 180 / 2), 2)
          )), 2) <= ?
        ORDER BY VEC_COSINE_DISTANCE(s.features_embedding, ?) ASC
        LIMIT ?
      `;

      const {
        topK = this.defaultTopK,
        maxDistance = this.maxDistance,
        minCapacity = request.people_count
      } = options;

      // Execute TiDB vector search
      const [matches] = await db.execute(searchQuery, [
        requestEmbedding, // Vector similarity comparison
        requestEmbedding, // Similarity score calculation
        request.lat,      // Geographic distance calculation
        request.lat,
        request.lng,
        minCapacity,      // Capacity scoring
        minCapacity,
        request.lat,      // Distance filter
        request.lat,
        request.lng,
        maxDistance,
        requestEmbedding, // Final ordering by vector similarity
        topK
      ]);

      // Calculate enhanced matching scores
      const enrichedMatches = matches.map(match => {
        const featureMatchScore = this.calculateFeatureMatchScore(
          request.features_required,
          match.features
        );

        // Weighted combined score
        const weights = {
          similarity: 0.4,  // Vector similarity weight
          distance: 0.3,    // Geographic proximity weight
          capacity: 0.2,    // Available capacity weight
          features: 0.1     // Feature matching weight
        };

        const combinedScore = (
          weights.similarity * match.similarity_score +
          weights.distance * Math.max(0, (maxDistance - match.distance_km) / maxDistance) +
          weights.capacity * match.capacity_score +
          weights.features * featureMatchScore
        );

        return {
          ...match,
          feature_match_score: featureMatchScore,
          combined_score: combinedScore,
          match_reason: this.generateMatchReason(match, featureMatchScore),
          search_method: 'tidb_vector_search'
        };
      });

      // Sort by combined score
      enrichedMatches.sort((a, b) => b.combined_score - a.combined_score);

      console.log(`✅ TiDB Vector Search completed in ${Date.now() - startTime}ms`);
      console.log(`📊 Found ${enrichedMatches.length} matches with avg similarity: ${
        (enrichedMatches.reduce((sum, m) => sum + m.similarity_score, 0) / enrichedMatches.length).toFixed(3)
      }`);

      // Store search analytics
      await this.recordSearchAnalytics(requestEmbedding, enrichedMatches, Date.now() - startTime);

      return enrichedMatches;
    } catch (error) {
      console.error('❌ TiDB Vector Search failed:', error);
      throw error;
    }
  }

  /**
   * Perform hybrid search combining vector similarity and geographic proximity
   * Advanced TiDB vector search with multiple criteria
   * @param {number} requestId - Request ID
   * @param {Object} weights - Scoring weights
   * @returns {Promise<Array>} - Hybrid search results
   */
  async hybridVectorSearch(requestId, weights = {}) {
    try {
      console.log(`🧭 TiDB Hybrid Vector Search for request ${requestId}`);
      
      const defaultWeights = {
        similarity: 0.5,
        distance: 0.3,
        capacity: 0.2
      };
      
      const searchWeights = { ...defaultWeights, ...weights };

      // Get request data
      const [requestRows] = await db.execute(
        'SELECT needs_embedding, lat, lng, people_count FROM requests WHERE id = ?',
        [requestId]
      );

      if (!requestRows.length) {
        throw new Error('Request not found');
      }

      const request = requestRows[0];

      // Use TiDB stored procedure for hybrid search
      const [results] = await db.execute(
        'CALL HybridShelterSearch(?, ?, ?, ?, ?, ?, ?)',
        [
          request.needs_embedding,
          request.lat,
          request.lng,
          this.maxDistance,
          searchWeights.similarity,
          searchWeights.distance,
          this.defaultTopK
        ]
      );

      console.log(`✅ Hybrid search found ${results.length} matches`);
      return results;
    } catch (error) {
      console.error('❌ Hybrid vector search failed:', error);
      throw error;
    }
  }

  /**
   * Find similar shelters to a given shelter using vector similarity
   * Demonstrates shelter-to-shelter vector comparison
   * @param {number} shelterId - Reference shelter ID
   * @param {number} topK - Number of similar shelters to find
   * @returns {Promise<Array>} - Similar shelters
   */
  async findSimilarShelters(shelterId, topK = 5) {
    try {
      console.log(`🏠 Finding shelters similar to shelter ${shelterId}`);

      const similarSheltersQuery = `
        SELECT 
          s2.id,
          s2.name,
          s2.features,
          s2.capacity,
          s2.occupancy,
          VEC_COSINE_DISTANCE(s1.features_embedding, s2.features_embedding) as similarity_distance,
          (1 - VEC_COSINE_DISTANCE(s1.features_embedding, s2.features_embedding)) as similarity_score
        FROM shelters s1
        JOIN shelters s2 ON s1.id != s2.id
        WHERE s1.id = ?
          AND s1.features_embedding IS NOT NULL
          AND s2.features_embedding IS NOT NULL
        ORDER BY VEC_COSINE_DISTANCE(s1.features_embedding, s2.features_embedding) ASC
        LIMIT ?
      `;

      const [similarShelters] = await db.execute(similarSheltersQuery, [shelterId, topK]);
      
      console.log(`✅ Found ${similarShelters.length} similar shelters`);
      return similarShelters;
    } catch (error) {
      console.error('❌ Similar shelters search failed:', error);
      throw error;
    }
  }

  /**
   * Find requests with similar needs to a given request
   * Request-to-request vector similarity search
   * @param {number} requestId - Reference request ID
   * @param {number} topK - Number of similar requests to find
   * @returns {Promise<Array>} - Similar requests
   */
  async findSimilarRequests(requestId, topK = 5) {
    try {
      console.log(`👨‍👩‍👧‍👦 Finding requests similar to request ${requestId}`);

      const similarRequestsQuery = `
        SELECT 
          r2.id,
          r2.name,
          r2.people_count,
          r2.needs,
          r2.features_required,
          r2.urgency,
          VEC_COSINE_DISTANCE(r1.needs_embedding, r2.needs_embedding) as similarity_distance,
          (1 - VEC_COSINE_DISTANCE(r1.needs_embedding, r2.needs_embedding)) as similarity_score
        FROM requests r1
        JOIN requests r2 ON r1.id != r2.id
        WHERE r1.id = ?
          AND r1.needs_embedding IS NOT NULL
          AND r2.needs_embedding IS NOT NULL
        ORDER BY VEC_COSINE_DISTANCE(r1.needs_embedding, r2.needs_embedding) ASC
        LIMIT ?
      `;

      const [similarRequests] = await db.execute(similarRequestsQuery, [requestId, topK]);
      
      console.log(`✅ Found ${similarRequests.length} similar requests`);
      return similarRequests;
    } catch (error) {
      console.error('❌ Similar requests search failed:', error);
      throw error;
    }
  }

  /**
   * Store vector match results for tracking and analytics
   * @param {number} requestId - Request ID
   * @param {Array} matches - Match results
   * @returns {Promise<void>}
   */
  async storeVectorMatches(requestId, matches) {
    try {
      const matchInserts = matches.map(match => [
        requestId,
        match.id,
        match.similarity_score,
        match.distance_km,
        match.capacity_score,
        match.feature_match_score,
        match.combined_score,
        match.match_reason
      ]);

      if (matchInserts.length > 0) {
        await db.execute(
          `INSERT INTO vector_matches 
           (request_id, shelter_id, similarity_score, distance_km, capacity_score, 
            feature_match_score, combined_score, match_reason) 
           VALUES ?`,
          [matchInserts]
        );

        console.log(`✅ Stored ${matchInserts.length} vector matches for request ${requestId}`);
      }
    } catch (error) {
      console.error('❌ Failed to store vector matches:', error);
    }
  }

  /**
   * Calculate feature matching score between request and shelter
   * @param {string} requiredFeatures - Required features (comma-separated)
   * @param {string} shelterFeatures - Available shelter features
   * @returns {number} - Feature match score (0-1)
   */
  calculateFeatureMatchScore(requiredFeatures, shelterFeatures) {
    if (!requiredFeatures || requiredFeatures.trim() === '') return 1.0;

    const required = requiredFeatures.split(',').map(f => f.trim().toLowerCase());
    const available = shelterFeatures.split(',').map(f => f.trim().toLowerCase());

    const matchedFeatures = required.filter(feature => available.includes(feature));
    return matchedFeatures.length / required.length;
  }

  /**
   * Generate human-readable match reasoning
   * @param {Object} match - Match result
   * @param {number} featureScore - Feature match score
   * @returns {string} - Match explanation
   */
  generateMatchReason(match, featureScore) {
    const reasons = [];

    if (match.similarity_score > 0.8) {
      reasons.push('Excellent semantic similarity to request needs');
    } else if (match.similarity_score > 0.6) {
      reasons.push('Good semantic match for requirements');
    }

    if (match.distance_km < 5) {
      reasons.push('Very close location');
    } else if (match.distance_km < 10) {
      reasons.push('Reasonable distance');
    }

    if (featureScore === 1.0) {
      reasons.push('All required features available');
    } else if (featureScore > 0.7) {
      reasons.push('Most required features available');
    }

    if (match.available_capacity >= match.people_count * 2) {
      reasons.push('Ample capacity available');
    } else if (match.available_capacity >= match.people_count) {
      reasons.push('Sufficient capacity');
    }

    return reasons.join(' • ');
  }

  /**
   * Record search analytics for performance monitoring
   * @param {Array} queryVector - Search vector
   * @param {Array} results - Search results
   * @param {number} searchTime - Execution time in ms
   * @returns {Promise<void>}
   */
  async recordSearchAnalytics(queryVector, results, searchTime) {
    try {
      const avgSimilarity = results.length > 0 
        ? results.reduce((sum, r) => sum + r.similarity_score, 0) / results.length 
        : 0;

      await db.execute(
        `INSERT INTO vector_search_analytics 
         (search_type, query_vector, top_k, search_time_ms, total_results, avg_similarity, search_metadata) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'shelter_features',
          JSON.stringify(queryVector.slice(0, 10)), // Store first 10 dims for reference
          results.length,
          searchTime,
          results.length,
          avgSimilarity,
          JSON.stringify({ timestamp: new Date().toISOString(), method: 'tidb_vector_search' })
        ]
      );
    } catch (error) {
      console.error('❌ Failed to record search analytics:', error);
    }
  }

  /**
   * Get vector search statistics and performance metrics
   * @returns {Promise<Object>} - Search statistics
   */
  async getSearchStatistics() {
    try {
      const [stats] = await db.execute(`
        SELECT 
          COUNT(*) as total_searches,
          AVG(search_time_ms) as avg_search_time,
          AVG(total_results) as avg_results_count,
          AVG(avg_similarity) as overall_avg_similarity,
          MAX(search_time_ms) as max_search_time,
          MIN(search_time_ms) as min_search_time
        FROM vector_search_analytics
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `);

      return stats[0] || {};
    } catch (error) {
      console.error('❌ Failed to get search statistics:', error);
      return {};
    }
  }
}

// Create singleton instance
const tidbVectorSearch = new TiDBVectorSearchService();

export default tidbVectorSearch;

// Export individual functions
export const {
  findShelterMatches,
  hybridVectorSearch,
  findSimilarShelters,
  findSimilarRequests,
  storeVectorMatches,
  getSearchStatistics
} = tidbVectorSearch;
