-- Add resolved status to requests table

-- Update the status enum to include 'resolved'
ALTER TABLE requests MODIFY status ENUM('pending', 'assigned', 'completed', 'cancelled', 'resolved') DEFAULT 'pending';

-- Add a resolved_at timestamp column
ALTER TABLE requests ADD COLUMN resolved_at TIMESTAMP NULL AFTER assigned_at;

-- Add index for resolved status
ALTER TABLE requests ADD INDEX idx_resolved_status (status, resolved_at);