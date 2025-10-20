-- Database Verification for Book Request Feature
-- Run this in MySQL Workbench or MySQL command line

USE bookies_db;

-- 1. Check if database exists and is selected
SELECT DATABASE() AS current_database;

-- 2. Show all tables
SHOW TABLES;

-- 3. Check USERS table
SELECT 
    id, 
    name, 
    email, 
    role,
    SUBSTRING(password, 1, 30) AS password_hash_preview
FROM user
ORDER BY id;

-- 4. Check BOOKS table
SELECT 
    id,
    title,
    author,
    status,
    borrowed_by,
    category
FROM books
ORDER BY id;

-- 5. Check BOOK_REQUESTS table (if exists)
SELECT 
    br.id,
    br.request_type,
    br.status,
    br.requested_at,
    br.processed_at,
    u.email AS user_email,
    b.title AS book_title
FROM book_requests br
LEFT JOIN user u ON br.user_id = u.id
LEFT JOIN books b ON br.book_id = b.id
ORDER BY br.requested_at DESC
LIMIT 10;

-- 6. Check table structure for book_requests
DESCRIBE book_requests;

-- 7. Count records
SELECT 
    (SELECT COUNT(*) FROM user) AS total_users,
    (SELECT COUNT(*) FROM books) AS total_books,
    (SELECT COUNT(*) FROM book_requests) AS total_requests;

-- 8. Verify specific test user
SELECT 
    id,
    email,
    role,
    CASE 
        WHEN email = 'user@bookies.com' THEN 'TEST USER EXISTS ✓'
        ELSE 'Other user'
    END AS user_type
FROM user
WHERE email IN ('user@bookies.com', 'librarian@library.com', 'admin@bookies.com');
