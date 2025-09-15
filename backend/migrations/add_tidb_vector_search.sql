-- TiDB Vector Search Enhancement for ShelterConnect AI
-- Adding vector embeddings and vector search capabilities

USE shelterconnect_ai;

-- Add vector columns to existing tables
-- TiDB supports vector data types for semantic search

-- Add embedding columns to shelters table
ALTER TABLE shelters 
ADD COLUMN features_embedding VECTOR(1536) COMMENT 'OpenAI text-embedding-ada-002 embedding of shelter features and capabilities',
ADD COLUMN description_embedding VECTOR(1536) COMMENT 'Semantic embedding of shelter description';

-- Add embedding columns to requests table  
ALTER TABLE requests
ADD COLUMN needs_embedding VECTOR(1536) COMMENT 'OpenAI embedding of family needs and requirements',
ADD COLUMN combined_embedding VECTOR(1536) COMMENT 'Combined embedding of needs + features required';

-- Create vector indexes for efficient similarity search
-- TiDB vector indexes enable high-performance semantic search

-- Shelter vector indexes
CREATE INDEX idx_shelter_features_vector ON shelters (features_embedding) USING HNSW;
CREATE INDEX idx_shelter_description_vector ON shelters (description_embedding) USING HNSW;

-- Request vector indexes  
CREATE INDEX idx_request_needs_vector ON requests (needs_embedding) USING HNSW;
CREATE INDEX idx_request_combined_vector ON requests (combined_embedding) USING HNSW;

-- Create shelter-request matching scores table for ML tracking
CREATE TABLE IF NOT EXISTS vector_matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    shelter_id INT NOT NULL,
    similarity_score FLOAT NOT NULL COMMENT 'Cosine similarity score from vector search',
    distance_km FLOAT COMMENT 'Geographic distance in kilometers',
    capacity_score FLOAT COMMENT 'Capacity availability score (0-1)',
    feature_match_score FLOAT COMMENT 'Feature compatibility score (0-1)',
    combined_score FLOAT NOT NULL COMMENT 'Weighted final matching score',
    match_reason TEXT COMMENT 'Explanation of why this match was selected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE,
    INDEX idx_request_scores (request_id, combined_score DESC),
    INDEX idx_similarity (similarity_score DESC),
    INDEX idx_combined_score (combined_score DESC)
);

-- Create agent workflow tracking table for multi-step agent demonstration
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
    INDEX idx_request_workflow (request_id, workflow_step),
    INDEX idx_workflow_tracking (created_at, status)
);

-- Create vector search analytics table
CREATE TABLE IF NOT EXISTS vector_search_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    search_type ENUM('shelter_features', 'request_needs', 'hybrid_search') NOT NULL,
    query_vector VECTOR(1536) NOT NULL,
    top_k INT DEFAULT 5 COMMENT 'Number of results returned',
    search_time_ms INT COMMENT 'Vector search execution time',
    total_results INT COMMENT 'Total matching results found',
    avg_similarity FLOAT COMMENT 'Average similarity score of results',
    search_metadata JSON COMMENT 'Additional search parameters and filters',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_search_performance (search_time_ms, total_results),
    INDEX idx_similarity_stats (avg_similarity DESC)
);

-- Insert sample vector data (placeholder - will be populated by embedding service)
-- These will be replaced with actual OpenAI embeddings

-- Sample shelter features for embedding generation:
INSERT INTO shelters (name, capacity, occupancy, features, address, lat, lng, phone) VALUES
('Apollo Hospital Emergency Shelter', 200, 45, 'medical,wheelchair,mental-health,pediatric,pharmacy', 'Greams Lane, Thousand Lights, Chennai', 13.06100000, 80.25900000, '+91 95555 12345'),
('TIDEL Park Tech Shelter', 150, 30, 'power,wifi,laptop-charging,tech-support,wheelchair', 'TIDEL Park, Taramani, Chennai', 12.99500000, 80.24500000, '+91 93333 67890'),
('Kalakshetra Family Care Center', 180, 67, 'child-friendly,elderly-care,pet-friendly,playground,childcare', 'Thiruvanmiyur, Chennai', 12.98200000, 80.25800000, '+91 91111 23456')
ON DUPLICATE KEY UPDATE capacity=VALUES(capacity);

-- Sample complex requests for vector matching:
INSERT INTO requests (name, people_count, needs, features_required, lat, lng, phone, urgency, status) VALUES
('Ravi Kumar Family', 4, 'Family of software engineers with laptops and medical equipment needs. Elderly grandmother requires wheelchair access and medication storage. Need power for medical devices.', 'medical,wheelchair,power,elderly-care', 13.08500000, 80.27200000, '+91 98888 11111', 'high', 'pending'),
('Priya Sharma Family', 6, 'Family with diabetic child requiring refrigerated medication and clean medical environment. Pet dog needs accommodation. Mother is pregnant.', 'medical,pediatric,pet-friendly,pharmacy,prenatal', 13.06500000, 80.29200000, '+91 97777 22222', 'high', 'pending'),
('Venkatesh Extended Family', 12, 'Multi-generational family including 3 elderly members with mobility issues, 4 children ages 2-10, and service animal. Need childcare and elder care facilities.', 'wheelchair,elderly-care,child-friendly,childcare,pet-friendly', 13.10500000, 80.25200000, '+91 96666 33333', 'medium', 'pending')
ON DUPLICATE KEY UPDATE people_count=VALUES(people_count);

-- Create stored procedures for vector search operations

DELIMITER //

-- Procedure for finding best shelter matches using vector similarity
CREATE PROCEDURE FindSheltersByVectorSimilarity(
    IN request_embedding VECTOR(1536),
    IN max_distance_km FLOAT DEFAULT 10.0,
    IN min_capacity INT DEFAULT 1,
    IN top_k INT DEFAULT 5
)
BEGIN
    SELECT 
        s.id,
        s.name,
        s.capacity,
        s.occupancy,
        s.features,
        s.address,
        s.lat,
        s.lng,
        VEC_COSINE_DISTANCE(s.features_embedding, request_embedding) as similarity_score,
        (s.capacity - s.occupancy) as available_capacity,
        ROUND(6371 * 2 * ASIN(SQRT(POWER(SIN((s.lat - 13.08) * PI() / 180 / 2), 2) + 
                     COS(13.08 * PI() / 180) * COS(s.lat * PI() / 180) * 
                     POWER(SIN((s.lng - 80.27) * PI() / 180 / 2), 2))), 2) as distance_km
    FROM shelters s
    WHERE (s.capacity - s.occupancy) >= min_capacity
        AND s.features_embedding IS NOT NULL
    ORDER BY VEC_COSINE_DISTANCE(s.features_embedding, request_embedding) ASC
    LIMIT top_k;
END //

-- Procedure for hybrid search combining vector similarity and geographic proximity
CREATE PROCEDURE HybridShelterSearch(
    IN request_embedding VECTOR(1536),
    IN request_lat DECIMAL(10,8),
    IN request_lng DECIMAL(11,8),
    IN max_distance_km FLOAT DEFAULT 15.0,
    IN similarity_weight FLOAT DEFAULT 0.6,
    IN distance_weight FLOAT DEFAULT 0.4,
    IN top_k INT DEFAULT 10
)
BEGIN
    SELECT 
        s.id,
        s.name,
        s.capacity,
        s.occupancy,
        s.features,
        s.address,
        s.lat,
        s.lng,
        VEC_COSINE_DISTANCE(s.features_embedding, request_embedding) as vector_similarity,
        ROUND(6371 * 2 * ASIN(SQRT(POWER(SIN((s.lat - request_lat) * PI() / 180 / 2), 2) + 
                     COS(request_lat * PI() / 180) * COS(s.lat * PI() / 180) * 
                     POWER(SIN((s.lng - request_lng) * PI() / 180 / 2), 2))), 2) as distance_km,
        (
            similarity_weight * (1 - VEC_COSINE_DISTANCE(s.features_embedding, request_embedding)) +
            distance_weight * (1 - LEAST(ROUND(6371 * 2 * ASIN(SQRT(POWER(SIN((s.lat - request_lat) * PI() / 180 / 2), 2) + 
                     COS(request_lat * PI() / 180) * COS(s.lat * PI() / 180) * 
                     POWER(SIN((s.lng - request_lng) * PI() / 180 / 2), 2))), 2) / max_distance_km, 1))
        ) as hybrid_score,
        (s.capacity - s.occupancy) as available_capacity
    FROM shelters s
    WHERE s.features_embedding IS NOT NULL
        AND (s.capacity - s.occupancy) > 0
        AND ROUND(6371 * 2 * ASIN(SQRT(POWER(SIN((s.lat - request_lat) * PI() / 180 / 2), 2) + 
                     COS(request_lat * PI() / 180) * COS(s.lat * PI() / 180) * 
                     POWER(SIN((s.lng - request_lng) * PI() / 180 / 2), 2))), 2) <= max_distance_km
    ORDER BY hybrid_score DESC
    LIMIT top_k;
END //

DELIMITER ;

-- Grant necessary permissions for vector operations
-- GRANT SELECT, INSERT, UPDATE ON shelterconnect_ai.* TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE shelterconnect_ai.FindSheltersByVectorSimilarity TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE shelterconnect_ai.HybridShelterSearch TO 'app_user'@'%';

COMMIT;
