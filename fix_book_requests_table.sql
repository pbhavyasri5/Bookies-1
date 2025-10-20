-- Fix book_requests table schema mismatch
-- This removes the extra 'author' column that's not in the BookRequest entity

USE bookies_db;

-- Drop the existing book_requests table
DROP TABLE IF EXISTS book_requests;

-- Recreate with correct schema matching the BookRequest entity
CREATE TABLE book_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    request_type VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    requested_at DATETIME(6) NOT NULL,
    processed_at DATETIME(6),
    processed_by BIGINT,
    notes VARCHAR(500),
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (processed_by) REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Show the table structure to confirm
DESCRIBE book_requests;

SELECT 'Book requests table recreated successfully!' AS Status;
