// utils/vectorEmbeddings.js
// TiDB Vector Search - OpenAI Embedding Generation Service
// Core service for generating and managing vector embeddings for shelter-request matching

import OpenAI from 'openai';
import config from '../config/env.js';
import db from '../config/database.js';

// Initialize OpenAI client (optional for demo)
const openai = config.openaiApiKey ? new OpenAI({
  apiKey: config.openaiApiKey
}) : null;

class VectorEmbeddingService {
  constructor() {
    this.model = 'text-embedding-ada-002'; // 1536 dimensions
    this.maxTokens = 8000; // Token limit for embeddings
  }

  /**
   * Generate embedding vector for text using OpenAI or mock fallback
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} - 1536-dimensional embedding vector
   */
  async generateEmbedding(text) {
    try {
      // If OpenAI is not available, generate mock embedding for demo
      if (!openai) {
        console.log(`🎯 Generating mock embedding for demo: "${text.substring(0, 100)}..."`);
        return this.generateMockEmbedding(text);
      }

      console.log(`🧠 Generating OpenAI embedding for text: "${text.substring(0, 100)}..."`);
      
      const response = await openai.embeddings.create({
        model: this.model,
        input: text.trim(),
      });

      const embedding = response.data[0].embedding;
      console.log(`✅ OpenAI embedding generated: ${embedding.length} dimensions`);
      
      return embedding;
    } catch (error) {
      console.error('❌ OpenAI embedding generation failed:', error.message);
      
      // Fallback to mock embedding for demo
      console.log('🎯 Falling back to mock embedding for demo purposes');
      return this.generateMockEmbedding(text);
    }
  }

  /**
   * Generate mock embedding for demo purposes
   * @param {string} text - Text to create mock embedding for
   * @returns {Array} - 1536-dimensional mock embedding vector
   */
  generateMockEmbedding(text) {
    // Create deterministic mock embedding based on text content
    const hash = this.simpleHash(text);
    const embedding = [];
    
    for (let i = 0; i < 1536; i++) {
      // Generate pseudo-random values based on text hash and index
      const seed = (hash + i) * 9301 + 49297;
      const value = (seed % 233280) / 233280.0 - 0.5; // Normalize to [-0.5, 0.5]
      embedding.push(value);
    }
    
    // Normalize the vector to unit length (as OpenAI embeddings are)
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Simple hash function for text
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate shelter features embedding
   * Combines features, description, and capabilities into semantic vector
   * @param {Object} shelter - Shelter object with features
   * @returns {Promise<number[]>} - Embedding vector
   */
  async generateShelterEmbedding(shelter) {
    const featuresText = [
      `Shelter: ${shelter.name}`,
      `Location: ${shelter.address}`,
      `Capacity: ${shelter.capacity} people`,
      `Available features: ${shelter.features}`,
      `Specializations: ${this.expandFeatures(shelter.features)}`,
      `Medical facilities: ${shelter.features.includes('medical') ? 'Available with full medical support' : 'Basic first aid only'}`,
      `Accessibility: ${shelter.features.includes('wheelchair') ? 'Wheelchair accessible with ramps and accessible bathrooms' : 'Standard accessibility'}`,
      `Pet accommodation: ${shelter.features.includes('pet-friendly') ? 'Pet-friendly with designated pet areas' : 'No pets allowed'}`,
      `Child services: ${shelter.features.includes('child-friendly') ? 'Child-friendly with play areas and childcare' : 'Adult-focused facility'}`,
      `Elderly care: ${shelter.features.includes('elderly-care') ? 'Specialized elderly care with medical support' : 'General population shelter'}`
    ].join(' ');

    return await this.generateEmbedding(featuresText);
  }

  /**
   * Generate request needs embedding
   * Combines family needs, requirements, and urgency into semantic vector
   * @param {Object} request - Request object with needs
   * @returns {Promise<number[]>} - Embedding vector
   */
  async generateRequestEmbedding(request) {
    const needsText = [
      `Family request: ${request.name}`,
      `Family size: ${request.people_count} people`,
      `Urgency level: ${request.urgency}`,
      `Specific needs: ${request.needs}`,
      `Required features: ${request.features_required}`,
      `Detailed requirements: ${this.expandRequirements(request)}`,
      `Medical needs: ${this.extractMedicalNeeds(request.needs, request.features_required)}`,
      `Accessibility needs: ${this.extractAccessibilityNeeds(request.needs, request.features_required)}`,
      `Family composition: ${this.inferFamilyComposition(request)}`
    ].join(' ');

    return await this.generateEmbedding(needsText);
  }

  /**
   * Expand feature codes into descriptive text for better embeddings
   * @param {string} features - Comma-separated features
   * @returns {string} - Expanded feature descriptions
   */
  expandFeatures(features) {
    const featureMap = {
      'medical': 'comprehensive medical care, nursing staff, medication management, emergency medical response',
      'wheelchair': 'wheelchair accessibility, mobility assistance, accessible bathrooms, ramps and elevators',
      'pet-friendly': 'pet accommodation, animal care facilities, veterinary support, pet exercise areas',
      'child-friendly': 'childcare services, educational activities, play areas, child supervision',
      'elderly-care': 'geriatric care, medication assistance, mobility support, specialized elderly services',
      'mental-health': 'psychological support, counseling services, trauma care, mental health professionals',
      'power': 'reliable electricity, device charging stations, backup generators, electrical medical equipment support',
      'wifi': 'internet connectivity, communication support, remote work capabilities, online services access',
      'pharmacy': 'on-site pharmacy, prescription medications, medical supplies, pharmaceutical services',
      'pediatric': 'children medical care, pediatric specialists, child health services, immunizations',
      'prenatal': 'pregnancy care, prenatal checkups, maternity services, newborn care facilities',
      'childcare': 'professional childcare, supervised activities, educational programs, child development support'
    };

    return features.split(',')
      .map(f => featureMap[f.trim()] || f.trim())
      .join(' ');
  }

  /**
   * Expand request requirements into detailed descriptions
   * @param {Object} request - Request object
   * @returns {string} - Expanded requirements
   */
  expandRequirements(request) {
    const urgencyDescriptions = {
      'high': 'immediate emergency assistance required, life-threatening situation, urgent medical needs',
      'medium': 'priority assistance needed, time-sensitive requirements, important but not life-threatening',
      'low': 'standard assistance requested, flexible timing, basic shelter needs'
    };

    return urgencyDescriptions[request.urgency] || 'standard assistance';
  }

  /**
   * Extract medical needs from request text
   * @param {string} needs - Needs description
   * @param {string} features - Required features
   * @returns {string} - Medical needs description
   */
  extractMedicalNeeds(needs, features) {
    const medicalKeywords = ['medical', 'medication', 'doctor', 'hospital', 'treatment', 'prescription', 'diabetic', 'wheelchair', 'elderly', 'pregnant', 'pediatric'];
    const needsLower = needs.toLowerCase();
    const featuresLower = features.toLowerCase();
    
    const medicalMentions = medicalKeywords.filter(keyword => 
      needsLower.includes(keyword) || featuresLower.includes(keyword)
    );

    return medicalMentions.length > 0 
      ? `Medical requirements include: ${medicalMentions.join(', ')} - requiring specialized medical facilities and support`
      : 'No specific medical requirements mentioned';
  }

  /**
   * Extract accessibility needs
   * @param {string} needs - Needs description
   * @param {string} features - Required features
   * @returns {string} - Accessibility needs description
   */
  extractAccessibilityNeeds(needs, features) {
    const accessibilityKeywords = ['wheelchair', 'mobility', 'elderly', 'disabled', 'accessibility', 'ramp', 'walker'];
    const needsLower = needs.toLowerCase();
    const featuresLower = features.toLowerCase();
    
    const accessibilityMentions = accessibilityKeywords.filter(keyword => 
      needsLower.includes(keyword) || featuresLower.includes(keyword)
    );

    return accessibilityMentions.length > 0 
      ? `Accessibility requirements: ${accessibilityMentions.join(', ')} - needs wheelchair accessible facilities`
      : 'Standard accessibility requirements';
  }

  /**
   * Infer family composition from request data
   * @param {Object} request - Request object
   * @returns {string} - Family composition description
   */
  inferFamilyComposition(request) {
    const { people_count, needs } = request;
    const needsLower = needs.toLowerCase();
    
    let composition = `Family of ${people_count} people`;
    
    if (needsLower.includes('children') || needsLower.includes('child')) {
      composition += ' with children';
    }
    if (needsLower.includes('elderly') || needsLower.includes('grandmother') || needsLower.includes('grandfather')) {
      composition += ' including elderly members';
    }
    if (needsLower.includes('pregnant') || needsLower.includes('pregnancy')) {
      composition += ' with pregnant family member';
    }
    if (needsLower.includes('pet') || needsLower.includes('dog') || needsLower.includes('cat')) {
      composition += ' with pets';
    }
    
    return composition;
  }

  /**
   * Store shelter embedding in database
   * @param {number} shelterId - Shelter ID
   * @param {number[]} embedding - Embedding vector
   * @returns {Promise<void>}
   */
  async storeShelterEmbedding(shelterId, embedding) {
    try {
      const vectorString = `[${embedding.join(',')}]`;
      
      await db.execute(
        'UPDATE shelters SET features_embedding = ? WHERE id = ?',
        [vectorString, shelterId]
      );
      
      console.log(`✅ Stored embedding for shelter ${shelterId}`);
    } catch (error) {
      console.error(`❌ Failed to store shelter embedding:`, error);
      throw error;
    }
  }

  /**
   * Store request embedding in database
   * @param {number} requestId - Request ID
   * @param {number[]} embedding - Embedding vector
   * @returns {Promise<void>}
   */
  async storeRequestEmbedding(requestId, embedding) {
    try {
      const vectorString = `[${embedding.join(',')}]`;
      
      await db.execute(
        'UPDATE requests SET needs_embedding = ? WHERE id = ?',
        [vectorString, requestId]
      );
      
      console.log(`✅ Stored embedding for request ${requestId}`);
    } catch (error) {
      console.error(`❌ Failed to store request embedding:`, error);
      throw error;
    }
  }

  /**
   * Generate and store embeddings for all shelters
   * @returns {Promise<number>} - Number of embeddings generated
   */
  async generateAllShelterEmbeddings() {
    try {
      console.log('🚀 Generating embeddings for all shelters...');
      
      const [shelters] = await db.execute(
        'SELECT id, name, capacity, features, address FROM shelters WHERE features_embedding IS NULL'
      );

      let generated = 0;
      for (const shelter of shelters) {
        try {
          const embedding = await this.generateShelterEmbedding(shelter);
          await this.storeShelterEmbedding(shelter.id, embedding);
          generated++;
          
          // Rate limiting to avoid OpenAI API limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Failed to generate embedding for shelter ${shelter.id}:`, error);
        }
      }

      console.log(`✅ Generated ${generated} shelter embeddings`);
      return generated;
    } catch (error) {
      console.error('❌ Failed to generate shelter embeddings:', error);
      throw error;
    }
  }

  /**
   * Generate and store embeddings for all pending requests
   * @returns {Promise<number>} - Number of embeddings generated
   */
  async generateAllRequestEmbeddings() {
    try {
      console.log('🚀 Generating embeddings for all requests...');
      
      const [requests] = await db.execute(
        'SELECT id, name, people_count, needs, features_required, urgency FROM requests WHERE needs_embedding IS NULL'
      );

      let generated = 0;
      for (const request of requests) {
        try {
          const embedding = await this.generateRequestEmbedding(request);
          await this.storeRequestEmbedding(request.id, embedding);
          generated++;
          
          // Rate limiting to avoid OpenAI API limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Failed to generate embedding for request ${request.id}:`, error);
        }
      }

      console.log(`✅ Generated ${generated} request embeddings`);
      return generated;
    } catch (error) {
      console.error('❌ Failed to generate request embeddings:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for new shelter on creation
   * @param {Object} shelter - Shelter data
   * @returns {Promise<number[]>} - Generated embedding
   */
  async embedNewShelter(shelter) {
    try {
      const embedding = await this.generateShelterEmbedding(shelter);
      await this.storeShelterEmbedding(shelter.id, embedding);
      return embedding;
    } catch (error) {
      console.error('❌ Failed to embed new shelter:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for new request on creation
   * @param {Object} request - Request data
   * @returns {Promise<number[]>} - Generated embedding
   */
  async embedNewRequest(request) {
    try {
      const embedding = await this.generateRequestEmbedding(request);
      await this.storeRequestEmbedding(request.id, embedding);
      return embedding;
    } catch (error) {
      console.error('❌ Failed to embed new request:', error);
      throw error;
    }
  }
}

// Create singleton instance
const vectorEmbeddingService = new VectorEmbeddingService();

export default vectorEmbeddingService;

// Export individual functions for direct use
export const {
  generateEmbedding,
  generateShelterEmbedding,
  generateRequestEmbedding,
  storeShelterEmbedding,
  storeRequestEmbedding,
  generateAllShelterEmbeddings,
  generateAllRequestEmbeddings,
  embedNewShelter,
  embedNewRequest
} = vectorEmbeddingService;
