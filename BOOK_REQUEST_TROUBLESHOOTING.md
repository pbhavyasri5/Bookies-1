# 📖 Book Request Feature - Troubleshooting Guide

## ✅ Current Status

**Last Updated:** October 20, 2025

### Servers Running
- ✅ **Backend**: `http://localhost:8090` (PID: 12592)
- ✅ **Frontend**: `http://localhost:8080` (PID: 20528)

### Recent Fixes Applied
1. ✅ Improved error handling in `BookRequestController.createBookRequest()`
2. ✅ Added detailed validation for null values
3. ✅ Enhanced logging for debugging
4. ✅ Better error messages returned to frontend

---

## 🔍 How to Test "Request Book" Feature

### Step 1: Login
1. Open `http://localhost:8080`
2. Login as **user**:
   - Email: `user@bookies.com`
   - Password: `user123`

### Step 2: Request a Book
1. Find an **available** book (status: "available")
2. Click the **"Request Book"** button
3. Watch for the toast notification

### Expected Behavior:
- ✅ Toast shows: "Request Submitted - Your request for [Book Title] is pending admin approval"
- ✅ Book card updates to show "Pending Request"
- ✅ Request saved to database

### If Error Occurs:
- ❌ Toast shows: "Request Failed - [Error Message]"
- 👉 Check the **backend console** (PowerShell window running Spring Boot)
- 👉 Look for log lines starting with `ERROR`

---

## 🐛 Common Errors and Solutions

### Error 1: "Unexpected error occurred"
**Possible Causes:**
1. **User not logged in properly**
   - Solution: Logout and login again
   - Check: `localStorage.getItem('token')` in browser console should return a token

2. **Book ID is null or invalid**
   - Solution: Refresh the page to reload books
   - Check: Book object has valid `id` field

3. **Backend can't find user by email**
   - Solution: Verify user exists in database
   - Run SQL: `SELECT * FROM user WHERE email = 'user@bookies.com';`

4. **Authentication token missing/invalid**
   - Solution: Clear localStorage and login again
   - Browser console: `localStorage.clear()` then refresh

### Error 2: "You already have a pending request for this book"
**Cause:** Duplicate request
**Solution:** 
- Login as admin to approve/reject the first request
- Or check database: `SELECT * FROM book_requests WHERE user_id = [USER_ID] AND book_id = [BOOK_ID];`

### Error 3: "Book not found with ID: X"
**Cause:** Book doesn't exist in database
**Solution:**
- Add books through admin interface
- Or check database: `SELECT * FROM books WHERE id = [BOOK_ID];`

### Error 4: "User not found with email: X"
**Cause:** User doesn't exist in database
**Solution:**
- Check database: `SELECT * FROM user WHERE email = 'user@bookies.com';`
- Re-run database initialization script if needed

---

## 🔧 Debugging Steps

### Step 1: Check Backend Logs
The backend PowerShell window will show:

**Success Log:**
```
INFO  c.b.controller.BookRequestController - Creating book request: {bookId=1, userEmail=user@bookies.com, requestType=BORROW}
INFO  c.b.controller.BookRequestController - Processing request - BookId: 1, UserEmail: user@bookies.com, Type: BORROW
INFO  c.b.controller.BookRequestController - Book request created successfully: ID=1, Type=BORROW, User=user@bookies.com
```

**Error Log:**
```
ERROR c.b.controller.BookRequestController - Request failed: Book not found with ID: 1
```

### Step 2: Check Browser Console
Press `F12` → Console tab

**Check Token:**
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

**Check Network Request:**
- Go to Network tab
- Click "Request Book"
- Find `POST http://localhost:8090/api/book-requests`
- Click it → Check "Payload" and "Response"

### Step 3: Check Database
Run these SQL queries in MySQL:

```sql
-- Check if user exists
SELECT * FROM user WHERE email = 'user@bookies.com';

-- Check if book exists
SELECT * FROM books WHERE id = 1;

-- Check existing requests
SELECT * FROM book_requests ORDER BY requested_at DESC LIMIT 10;

-- Check request details
SELECT 
    br.id,
    br.status,
    br.request_type,
    br.requested_at,
    b.title AS book_title,
    u.email AS user_email
FROM book_requests br
JOIN books b ON br.book_id = b.id
JOIN user u ON br.user_id = u.id
ORDER BY br.requested_at DESC;
```

---

## 🎯 API Endpoint Details

### POST /api/book-requests

**URL:** `http://localhost:8090/api/book-requests`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer user@bookies.com_1729410000000"
}
```

**Request Body:**
```json
{
  "bookId": 1,
  "userEmail": "user@bookies.com",
  "requestType": "BORROW"
}
```

**Success Response (201 Created):**
```json
{
  "id": 1,
  "bookId": 1,
  "bookTitle": "The Great Gatsby",
  "bookAuthor": "F. Scott Fitzgerald",
  "userId": 2,
  "userEmail": "user@bookies.com",
  "userName": "User",
  "requestType": "BORROW",
  "status": "PENDING",
  "requestedAt": "2025-10-20T12:30:45",
  "processedAt": null,
  "processedByEmail": null,
  "notes": null
}
```

**Error Response (400 Bad Request):**
```json
{
  "timestamp": "2025-10-20T12:30:45.123+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Book not found with ID: 1",
  "path": "/api/book-requests"
}
```

---

## 🧪 Manual Testing with cURL

Test the endpoint directly:

```bash
curl -X POST http://localhost:8090/api/book-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user@bookies.com_1729410000000" \
  -d '{
    "bookId": 1,
    "userEmail": "user@bookies.com",
    "requestType": "BORROW"
  }'
```

---

## 📋 Code Verification Checklist

### Frontend (`Index.tsx`)
- ✅ `handleRequestBook` calls `bookRequestService.createRequest()`
- ✅ Passes `bookId` as number (not string)
- ✅ Passes `userEmail` from logged-in user
- ✅ Passes `requestType: 'BORROW'`
- ✅ Shows error message from backend in toast

### Frontend (`bookRequestService.ts`)
- ✅ Sends POST request to `/api/book-requests`
- ✅ Includes `Authorization` header with token
- ✅ Includes `Content-Type: application/json`
- ✅ Parses error response and throws with message

### Backend (`BookRequestController.java`)
- ✅ Validates all required fields (bookId, userEmail, requestType)
- ✅ Checks if book exists
- ✅ Checks if user exists
- ✅ Checks for duplicate pending requests
- ✅ Creates BookRequest entity
- ✅ Saves to database
- ✅ Returns BookRequestDTO with 201 status

### Backend (`SecurityConfig.java`)
- ✅ Allows authenticated users to POST `/api/book-requests`
- ✅ JWT filter extracts email from token
- ✅ Sets authentication in SecurityContext

### Backend (`BookRequest.java` Entity)
- ✅ Has @Entity annotation
- ✅ Has @Table(name = "book_requests")
- ✅ Has @ManyToOne relationships for book and user
- ✅ Constructor sets default status to "PENDING"
- ✅ Constructor sets requestedAt to current time

---

## 🚀 Next Steps If Still Failing

1. **Restart Backend with Clean Build:**
   ```powershell
   cd c:\JFS-bookies\bookies-backend
   mvn clean install
   mvn spring-boot:run
   ```

2. **Clear Browser Cache:**
   - Press `Ctrl+Shift+Delete`
   - Clear "Cached images and files"
   - Or use Incognito mode

3. **Check Database Table Exists:**
   ```sql
   SHOW TABLES LIKE 'book_requests';
   DESCRIBE book_requests;
   ```

4. **Enable Debug Logging:**
   Add to `application.properties`:
   ```properties
   logging.level.com.bookies=DEBUG
   logging.level.org.springframework.web=DEBUG
   ```

5. **Test with Postman/Insomnia:**
   - Import the cURL command above
   - Verify response manually
   - Check if it's a frontend or backend issue

---

## 📞 Support

If issue persists after following this guide:
1. Copy the **exact error message** from backend console
2. Copy the **Network request/response** from browser DevTools
3. Copy the **frontend toast error message**
4. Check the **database state** with SQL queries above

This will help identify the exact failure point.
