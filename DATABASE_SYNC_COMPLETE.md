# 🔄 Database Schema Update - October 20, 2025

## ✅ Database Schema Verified & Synchronized

### Current Database: `bookies_db`

---

## 📊 Table Structures

### 1. **books** Table
```sql
Field                Type            Null    Key     Default
-----------------------------------------------------------------
id                   bigint          NO      PRI     auto_increment
title                varchar(255)    NO              
author               varchar(255)    NO              
isbn                 varchar(255)    YES             
category             varchar(255)    YES             
publisher            varchar(255)    YES             
description          varchar(255)    YES             
price                double          YES             
published_date       varchar(255)    YES             
cover_image          varchar(255)    YES             
status               varchar(255)    YES             (available/borrowed/etc)
borrowed_by          varchar(255)    YES             
borrowed_date        varchar(255)    YES             
requested_by         varchar(255)    YES             
request_date         varchar(255)    YES             
return_request_date  varchar(255)    YES             
approval_status      varchar(255)    YES             
added_date           varchar(255)    YES             
```

**Status:** ✅ Matches `Book.java` entity perfectly

**Sample Data:**
- **Book ID 2:** "1984" by George Orwell (Available)
- Total Books: 1

---

### 2. **user** Table
```sql
Field          Type            Null    Key     Default
---------------------------------------------------------
id             bigint          NO      PRI     auto_increment
name           varchar(100)    NO              
email          varchar(255)    NO      UNI     
password       varchar(255)    NO              (BCrypt hashed)
role           varchar(255)    NO              (USER/ADMIN)
created_at     datetime(6)     NO              CURRENT_TIMESTAMP
updated_at     datetime(6)     NO              CURRENT_TIMESTAMP on update
```

**Status:** ✅ Matches `User.java` entity perfectly

**Current Users:**
1. `admin@bookies.com` - Admin - ADMIN role
2. `user@bookies.com` - User - USER role
3. `librarian@library.com` - Librarian - ADMIN role
4. `rianna@bookies.com` - rianna - USER role

Total Users: 4

---

### 3. **book_requests** Table
```sql
Field            Type            Null    Key     Default
------------------------------------------------------------
id               bigint          NO      PRI     auto_increment
book_id          bigint          NO      MUL     (FK → books.id)
user_id          bigint          NO      MUL     (FK → user.id)
request_type     varchar(255)    NO              (BORROW/RETURN)
status           varchar(255)    NO              (PENDING/APPROVED/REJECTED)
requested_at     datetime(6)     NO              
processed_at     datetime(6)     YES             
processed_by     bigint          YES     MUL     (FK → user.id)
notes            varchar(500)    YES             
```

**Status:** ✅ Fixed schema - matches `BookRequest.java` entity
**Note:** Removed the incorrect 'author' column that was causing errors

---

## 🔧 Backend Configuration

### application.properties
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bookies_db
spring.datasource.username=root
spring.datasource.password=Bhavyeah#1
spring.jpa.hibernate.ddl-auto=update
server.port=8090
```

**Hibernate Mode:** `update` - Automatically syncs entities with database schema

---

## ✅ Entity-Database Mapping Status

### Book.java ↔ books table
- ✅ All fields match
- ✅ Primary key: `id` (Long)
- ✅ Required fields: `title`, `author`
- ✅ Optional fields: All others with null allowed
- ✅ Default value: `status = "available"`

### User.java ↔ user table
- ✅ All fields match
- ✅ Primary key: `id` (Long)
- ✅ Unique constraint: `email`
- ✅ Password: BCrypt encrypted
- ✅ Roles: USER, ADMIN
- ✅ Timestamps: Auto-managed

### BookRequest.java ↔ book_requests table
- ✅ All fields match (after fix)
- ✅ Foreign keys: `book_id`, `user_id`, `processed_by`
- ✅ Status workflow: PENDING → APPROVED/REJECTED
- ✅ Request types: BORROW, RETURN

---

## 🔄 What Was Updated

### 1. **Database Schema Fix** ✅
- Dropped old `book_requests` table with incorrect schema
- Recreated with correct columns matching entity
- **Removed:** 'author' column (was causing SQL errors)

### 2. **Backend Restart** ✅
- Stopped old backend process
- Freed port 8090
- Started fresh with synchronized schema
- Hibernate detected all tables correctly

### 3. **Data Verification** ✅
- Confirmed 1 book in database (1984)
- Confirmed 4 users with correct roles
- Book request table ready for new requests

---

## 🎯 Current System Status

### ✅ Backend (Port 8090)
- **Status:** RUNNING
- **Database:** Connected to bookies_db
- **Schema:** Fully synchronized
- **Endpoints:** All 7 book request endpoints active

### ✅ Frontend (Port 8080)
- **Status:** RUNNING
- **API Connection:** http://localhost:8090/api
- **CORS:** Configured correctly

### ✅ Database (MySQL)
- **Status:** RUNNING
- **Tables:** books, user, book_requests
- **Data:** Ready for operations

---

## 🧪 Testing Recommendations

### Test 1: Book Request Creation
```http
POST http://localhost:8090/api/book-requests
Content-Type: application/json
Authorization: Bearer <token>

{
  "bookId": 2,
  "userEmail": "user@bookies.com",
  "requestType": "BORROW"
}
```

**Expected:** 201 Created with BookRequest object

### Test 2: Get Pending Requests (Admin)
```http
GET http://localhost:8090/api/book-requests/pending
Authorization: Bearer <admin-token>
```

**Expected:** 200 OK with array of pending requests

### Test 3: Approve Request (Admin)
```http
POST http://localhost:8090/api/book-requests/{id}/approve
Authorization: Bearer <admin-token>

{
  "notes": "Approved for 14 days"
}
```

**Expected:** 200 OK with updated BookRequest

---

## 📋 Database Maintenance Scripts

### Check All Data
```sql
USE bookies_db;
SELECT * FROM books;
SELECT id, name, email, role FROM user;
SELECT * FROM book_requests;
```

### Add Sample Book
```sql
INSERT INTO books (title, author, isbn, category, status, added_date)
VALUES ('The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Classic', 'available', CURDATE());
```

### View Book Request Stats
```sql
SELECT 
    status, 
    COUNT(*) as count 
FROM book_requests 
GROUP BY status;
```

---

## 🚀 Next Steps

1. ✅ **Database Schema:** Verified and synchronized
2. ✅ **Backend:** Restarted with updated configuration
3. ✅ **Frontend:** Running and connected
4. 🧪 **Ready to Test:** Create book requests and test approval workflow

---

## 📝 Important Notes

### Hibernate DDL Mode: `update`
- Automatically creates missing tables
- Adds new columns if needed
- **Does NOT** drop existing columns
- Safe for development, use `validate` in production

### Data Integrity
- Foreign key constraints enforced
- Cascade operations configured
- Unique email constraint on users
- Auto-increment IDs

### Schema Changes Process
If you make changes to entity classes:
1. Hibernate will auto-detect on restart
2. New columns will be added automatically
3. For major changes, create migration scripts
4. Always backup data before schema changes

---

## ✅ Summary

**Status:** All database tables are synchronized with Java entities

**Tables:**
- ✅ books (18 columns)
- ✅ user (7 columns)
- ✅ book_requests (9 columns)

**Data:**
- ✅ 1 sample book
- ✅ 4 users (2 admins, 2 regular users)
- ✅ Ready for book requests

**System:**
- ✅ Backend running on port 8090
- ✅ Frontend running on port 8080
- ✅ Database connected and operational

**Ready for production testing!** 🎉
