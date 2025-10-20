-- ============================================
-- Bookies Database Verification Script
-- Run this in MySQL Workbench
-- ============================================

-- 1. Show all databases
SHOW DATABASES;

-- 2. Use the bookies database
USE bookies_db;

-- 3. Show all tables created by Hibernate
SHOW TABLES;

-- 4. Check USER table structure
DESCRIBE user;

-- 5. View all users (passwords are encrypted with BCrypt)
SELECT 
    id, 
    name, 
    email, 
    role,
    SUBSTRING(password, 1, 20) AS 'password_preview'
FROM user;

-- 6. Count total users
SELECT COUNT(*) AS total_users FROM user;

-- 7. Check BOOKS table structure
DESCRIBE books;

-- 8. View all books
SELECT * FROM books;

-- 9. Count total books
SELECT COUNT(*) AS total_books FROM books;

-- 10. Check MEMBERS table structure
DESCRIBE members;

-- 11. View all members
SELECT * FROM members;

-- 12. Count total members
SELECT COUNT(*) AS total_members FROM members;

-- ============================================
-- Expected Results:
-- ============================================
-- USERS: Should have 2 users (Admin and User)
--   - admin@bookies.com (role: ADMIN)
--   - user@bookies.com (role: USER)
-- 
-- BOOKS: Will be empty unless you've added books
-- 
-- MEMBERS: Will be empty unless you've added members
-- ============================================

-- Additional: Check if specific users exist
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM user WHERE email = 'admin@bookies.com') 
        THEN '✓ Admin user exists' 
        ELSE '✗ Admin user NOT found' 
    END AS admin_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM user WHERE email = 'user@bookies.com') 
        THEN '✓ Regular user exists' 
        ELSE '✗ Regular user NOT found' 
    END AS user_status;
