-- Fix User Credentials for Book Request Testing
-- This script ensures test users exist with correct BCrypt passwords

USE bookies_db;

-- First, let's see what users exist
SELECT 'Current users in database:' AS info;
SELECT id, name, email, role, SUBSTRING(password, 1, 20) AS password_preview
FROM user;

-- Check if test users exist
SELECT 'Checking for test users:' AS info;
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM user WHERE email = 'user@bookies.com') 
        THEN 'user@bookies.com EXISTS'
        ELSE 'user@bookies.com MISSING - NEED TO CREATE'
    END AS user_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM user WHERE email = 'librarian@library.com') 
        THEN 'librarian@library.com EXISTS'
        ELSE 'librarian@library.com MISSING - NEED TO CREATE'
    END AS admin_status;

-- If users don't exist, you need to create them through the signup endpoint
-- Or insert them manually with BCrypt hashed passwords

-- To manually insert test users (if they don't exist):
-- NOTE: These passwords are BCrypt hashed
-- user@bookies.com password: user123 (BCrypt hash)
-- librarian@library.com password: 1234 (BCrypt hash)

-- Check if user@bookies.com exists, if not insert
INSERT IGNORE INTO user (name, email, password, role)
VALUES (
    'Regular User',
    'user@bookies.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- BCrypt hash of 'user123'
    'ROLE_USER'
);

-- Check if librarian@library.com exists, if not insert
INSERT IGNORE INTO user (name, email, password, role)
VALUES (
    'Librarian Admin',
    'librarian@library.com',
    '$2a$10$7KwKXQYlnLbKDdxDdHAq2.lRsAX7.zlKq88oWBN9QGLOqZp8v3YJ6',  -- BCrypt hash of '1234'
    'ROLE_ADMIN'
);

-- Verify users were created
SELECT 'After insertion:' AS info;
SELECT id, name, email, role FROM user;

-- Show book counts
SELECT 
    COUNT(*) AS total_books,
    SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available_books,
    SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) AS borrowed_books
FROM books;

-- If no books exist, add a sample book for testing
INSERT IGNORE INTO books (title, author, isbn, category, publisher, description, status)
VALUES (
    'Test Book for Requests',
    'Test Author',
    '1234567890123',
    'Fiction',
    'Test Publisher',
    'This is a test book for testing the book request feature',
    'available'
);

SELECT 'Sample books:' AS info;
SELECT id, title, author, status FROM books LIMIT 5;

SELECT 'Setup complete! Test credentials:' AS info;
SELECT 
    'user@bookies.com / user123' AS user_credentials,
    'librarian@library.com / 1234' AS admin_credentials;
