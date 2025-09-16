// Simplified TiDB Vector Migration Script - Step by Step
import pool from './config/database.js';

async function addVectorColumns() {
  try {
    console.log('🎯 Adding VECTOR columns to TiDB tables...');
    
    // Add vector columns to shelters table
    console.log('1️⃣ Adding features_embedding to shelters...');
    try {
      await pool.execute(`
        ALTER TABLE shelters 
        ADD COLUMN features_embedding VECTOR(1536) COMMENT 'gemini text-embedding-ada-002 embedding of shelter features and capabilities'
      `);
      console.log('✅ Added features_embedding to shelters');
    } catch (error) {
      console.log('⚠️  features_embedding may already exist:', error.message);
    }

    console.log('2️⃣ Adding description_embedding to shelters...');
    try {
      await pool.execute(`
        ALTER TABLE shelters 
        ADD COLUMN description_embedding VECTOR(1536) COMMENT 'Semantic embedding of shelter description'
      `);
      console.log('✅ Added description_embedding to shelters');
    } catch (error) {
      console.log('⚠️  description_embedding may already exist:', error.message);
    }

    // Add vector columns to requests table
    console.log('3️⃣ Adding needs_embedding to requests...');
    try {
      await pool.execute(`
        ALTER TABLE requests
        ADD COLUMN needs_embedding VECTOR(1536) COMMENT 'gemini embedding of family needs and requirements'
      `);
      console.log('✅ Added needs_embedding to requests');
    } catch (error) {
      console.log('⚠️  needs_embedding may already exist:', error.message);
    }

    console.log('4️⃣ Adding combined_embedding to requests...');
    try {
      await pool.execute(`
        ALTER TABLE requests
        ADD COLUMN combined_embedding VECTOR(1536) COMMENT 'Combined embedding of needs + features required'
      `);
      console.log('✅ Added combined_embedding to requests');
    } catch (error) {
      console.log('⚠️  combined_embedding may already exist:', error.message);
    }

    // Create vector indexes (TiDB specific syntax)
    console.log('5️⃣ Creating vector indexes...');
    try {
      await pool.execute(`CREATE VECTOR INDEX idx_shelter_features_vector ON shelters (features_embedding)`);
      console.log('✅ Created features vector index');
    } catch (error) {
      console.log('⚠️  Features vector index may already exist:', error.message);
    }

    try {
      await pool.execute(`CREATE VECTOR INDEX idx_request_needs_vector ON requests (needs_embedding)`);
      console.log('✅ Created needs vector index');
    } catch (error) {
      console.log('⚠️  Needs vector index may already exist:', error.message);
    }

    // Create supporting tables
    console.log('6️⃣ Creating vector_matches table...');
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS vector_matches (
          id INT PRIMARY KEY AUTO_INCREMENT,
          request_id INT NOT NULL,
          shelter_id INT NOT NULL,
          similarity_score FLOAT NOT NULL COMMENT 'Cosine similarity score from vector search',
          distance_km FLOAT COMMENT 'Geographic distance in kilometers',
          combined_score FLOAT NOT NULL COMMENT 'Weighted final matching score',
          match_reason TEXT COMMENT 'Explanation of why this match was selected',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
          FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE,
          INDEX idx_request_scores (request_id, combined_score DESC)
        )
      `);
      console.log('✅ Created vector_matches table');
    } catch (error) {
      console.log('⚠️  vector_matches table may already exist:', error.message);
    }

    console.log('7️⃣ Creating agent_workflow table...');
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS agent_workflow (
          id INT PRIMARY KEY AUTO_INCREMENT,
          request_id INT NOT NULL,
          workflow_step ENUM('intake', 'embedding', 'vector_search', 'matching', 'routing', 'assignment', 'rebalancing') NOT NULL,
          agent_name VARCHAR(50) NOT NULL,
          step_data JSON COMMENT 'Step-specific data (embeddings, search results, routing info, etc.)',
          execution_time_ms INT COMMENT 'Execution time for this step in milliseconds',
          status ENUM('started', 'completed', 'failed') DEFAULT 'started',
          error_message TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP NULL,
          
          FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
          INDEX idx_request_workflow (request_id, workflow_step)
        )
      `);
      console.log('✅ Created agent_workflow table');
    } catch (error) {
      console.log('⚠️  agent_workflow table may already exist:', error.message);
    }

    console.log('8️⃣ Creating vector_search_analytics table...');
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS vector_search_analytics (
          id INT PRIMARY KEY AUTO_INCREMENT,
          search_type ENUM('shelter_features', 'request_needs', 'hybrid_search') NOT NULL,
          query_vector VECTOR(1536) NOT NULL,
          top_k INT DEFAULT 5 COMMENT 'Number of results returned',
          search_time_ms INT COMMENT 'Vector search execution time',
          total_results INT COMMENT 'Total matching results found',
          avg_similarity FLOAT COMMENT 'Average similarity score of results',
          search_metadata JSON COMMENT 'Additional search parameters and filters',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created vector_search_analytics table');
    } catch (error) {
      console.log('⚠️  vector_search_analytics table may already exist:', error.message);
    }

    // Verify the setup
    console.log('🔍 Verifying vector columns...');
    const [shelterColumns] = await pool.execute("DESCRIBE shelters");
    const vectorColumns = shelterColumns.filter(col => col.Field.includes('embedding'));
    
    console.log(`📊 Vector columns in shelters table: ${vectorColumns.length}`);
    vectorColumns.forEach(col => {
      console.log(`   ✅ ${col.Field}: ${col.Type}`);
    });

    const [requestColumns] = await pool.execute("DESCRIBE requests");
    const requestVectorColumns = requestColumns.filter(col => col.Field.includes('embedding'));
    
    console.log(`📊 Vector columns in requests table: ${requestVectorColumns.length}`);
    requestVectorColumns.forEach(col => {
      console.log(`   ✅ ${col.Field}: ${col.Type}`);
    });

    console.log('🎯 TiDB Vector setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    process.exit(0);
  }
}

addVectorColumns();