CREATE DATABASE bookies_db;
SHOW DATABASES;
USE bookies_db;
USE bookies_db;

CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    price DECIMAL(10,2),
    published_date DATE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Run this in your MySQL database
SELECT id, name, email, password FROM users;

ALTER TABLE books
ADD COLUMN category VARCHAR(100),
ADD COLUMN isbn VARCHAR(50),
ADD COLUMN publisher VARCHAR(100),
ADD COLUMN description TEXT,
ADD COLUMN status VARCHAR(50) DEFAULT 'available',
ADD COLUMN cover_image VARCHAR(255) DEFAULT '/placeholder.svg',
ADD COLUMN added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

INSERT INTO books (title, author, price, published_date, category, isbn, publisher, description)
VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 10.99, '1925-04-10', 'Fiction', '978-0-7432-7356-5', 'Scribner', 'A classic American novel'),
('1984', 'George Orwell', 12.50, '1949-06-08', 'Fiction', '978-0-452-28423-4', 'Penguin Books', 'Dystopian social science fiction'),
('To Kill a Mockingbird', 'Harper Lee', 11.25, '1960-07-11', 'Fiction', '978-0-06-112008-4', 'HarperCollins', 'A gripping tale of racial injustice');

SELECT * FROM books;
ALTER TABLE books
DROP COLUMN price;
SELECT * FROM books;


