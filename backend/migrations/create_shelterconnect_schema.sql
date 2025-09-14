-- ShelterConnect AI Database Schema
-- Multi-step agentic disaster relief coordination system

-- Create database
CREATE DATABASE IF NOT EXISTS shelterconnect_ai;
USE shelterconnect_ai;

-- Shelters table
CREATE TABLE IF NOT EXISTS shelters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    occupancy INT DEFAULT 0,
    features TEXT, -- Comma-separated features like 'medical,wheelchair,child-friendly'
    address TEXT,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_location (lat, lng),
    INDEX idx_capacity (capacity, occupancy),
    FULLTEXT idx_features (features)
);

-- Family requests table
CREATE TABLE IF NOT EXISTS requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    people_count INT NOT NULL,
    needs TEXT, -- Description of specific needs
    features_required TEXT, -- Comma-separated required features
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    phone VARCHAR(20),
    urgency ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'assigned', 'completed', 'cancelled') DEFAULT 'pending',
    assigned_shelter_id INT,
    assigned_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assigned_shelter_id) REFERENCES shelters(id) ON DELETE SET NULL,
    INDEX idx_location (lat, lng),
    INDEX idx_status (status),
    INDEX idx_urgency (urgency),
    FULLTEXT idx_needs (needs)
);

-- Vector embeddings for requests (TiDB Serverless vector columns)
CREATE TABLE IF NOT EXISTS request_vectors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    embedding VECTOR(1536), -- OpenAI embedding dimension
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    INDEX idx_request (request_id)
);

-- Vector embeddings for shelters
CREATE TABLE IF NOT EXISTS shelter_vectors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shelter_id INT NOT NULL,
    embedding VECTOR(1536), -- OpenAI embedding dimension
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE,
    INDEX idx_shelter (shelter_id)
);

-- Agent activity logs
CREATE TABLE IF NOT EXISTS agent_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    agent_name ENUM('intake_agent', 'matching_agent', 'routing_agent', 'rebalance_agent') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action TEXT NOT NULL,
    status ENUM('processing', 'completed', 'error') DEFAULT 'processing',
    request_id INT NULL,
    shelter_id INT NULL,
    details JSON NULL, -- Additional structured data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL,
    FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE SET NULL,
    INDEX idx_agent (agent_name),
    INDEX idx_timestamp (timestamp),
    INDEX idx_status (status)
);

-- Rebalancing suggestions
CREATE TABLE IF NOT EXISTS rebalance_suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_shelter_id INT NOT NULL,
    to_shelter_id INT NOT NULL,
    suggested_moves INT NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (from_shelter_id) REFERENCES shelters(id) ON DELETE CASCADE,
    FOREIGN KEY (to_shelter_id) REFERENCES shelters(id) ON DELETE CASCADE,
    INDEX idx_status (status)
);

-- Insert sample shelters data
INSERT INTO shelters (name, capacity, occupancy, features, address, lat, lng, phone) VALUES
('Central Relief Center', 150, 78, 'medical,wheelchair,child-friendly', '123 Main Street, Downtown', 13.0827, 80.2707, '(555) 123-4567'),
('Community Sports Complex', 200, 145, 'pet-friendly,large-families,recreational', '456 Sports Ave, North District', 13.0950, 80.2600, '(555) 234-5678'),
('St. Mary\'s Community Hall', 100, 42, 'elderly-care,medical,quiet', '789 Church Road, West Side', 13.0700, 80.2800, '(555) 345-6789'),
('Tech Campus Emergency Center', 300, 89, 'wifi,charging-stations,tech-support,wheelchair', '101 Innovation Drive, Tech Park', 13.1000, 80.2500, '(555) 456-7890'),
('Riverside Community Center', 80, 71, 'waterfront,medical,child-friendly', '202 River Road, East Side', 13.0650, 80.2900, '(555) 567-8901'),
('Metro School Gymnasium', 120, 34, 'large-space,sports-facilities,child-friendly', '303 Education Blvd, Central', 13.0850, 80.2650, '(555) 678-9012');

-- Insert sample agent logs
INSERT INTO agent_logs (agent_name, action, status, request_id, shelter_id) VALUES
('intake_agent', 'System initialized - ready to process requests', 'completed', NULL, NULL),
('matching_agent', 'Vector search index ready', 'completed', NULL, NULL),
('routing_agent', 'Maps API integration active', 'completed', NULL, NULL),
('rebalance_agent', 'Occupancy monitoring started', 'completed', NULL, NULL);
