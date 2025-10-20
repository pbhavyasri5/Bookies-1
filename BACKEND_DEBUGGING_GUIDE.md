# Backend Debugging Guide 🔍

## Current Status ✅

**Backend Controller Payload:** CORRECT
```java
@PostMapping
public ResponseEntity<BookRequestDTO> createBookRequest(@RequestBody Map<String, Object> request)
// Expects: { bookId: number, userEmail: string, requestType: "BORROW"/"RETURN" }
```

**Frontend Service Payload:** CORRECT
```typescript
interface BookRequestData {
  bookId: number;
  userEmail: string;
  requestType: 'BORROW' | 'RETURN';
  notes?: string;
}
```

✅ **Payload structures match perfectly!**

---

## How to Debug Book Request Errors

### Step 1: Start Backend with Console Monitoring

```powershell
# In PowerShell:
cd c:\JFS-bookies\bookies-backend
mvn spring-boot:run
```

**Watch for these startup messages:**
```
✅ Started BookiesBackendApplication in X seconds
✅ Tomcat started on port(s): 8090
✅ Mapped 27 API endpoints
```

### Step 2: Test Book Request Creation

**In Frontend:**
1. Login as user: `user@bookies.com` / `user123`
2. Click "Request Book" on any available book
3. **IMMEDIATELY look at backend console**

---

## Common Errors & Solutions

### Error 1: `NullPointerException`
**Backend Console Shows:**
```
java.lang.NullPointerException
  at com.bookies.controller.BookRequestController.createBookRequest
```

**Causes:**
- `bookId` is null or invalid
- `userEmail` is null or empty
- Frontend not sending complete payload

**Fix:**
Check frontend console for request payload:
```javascript
console.log("Sending request:", data);
```

---

### Error 2: `Book not found` (404)
**Backend Console Shows:**
```
org.springframework.web.server.ResponseStatusException: 404 NOT_FOUND "Book not found"
```

**Causes:**
- Book ID doesn't exist in database
- Book was deleted but frontend still shows it

**Fix:**
```sql
-- Check if book exists:
SELECT * FROM books WHERE id = <bookId>;
```

---

### Error 3: `User not found` (404)
**Backend Console Shows:**
```
org.springframework.web.server.ResponseStatusException: 404 NOT_FOUND "User not found"
```

**Causes:**
- User email doesn't match database
- User was deleted

**Fix:**
```sql
-- Check user exists:
SELECT * FROM users WHERE email = 'user@bookies.com';
```

**Expected result:**
```
+----+-----------------------+----------+
| id | email                 | role     |
+----+-----------------------+----------+
|  2 | user@bookies.com      | USER     |
+----+-----------------------+----------+
```

---

### Error 4: `Duplicate request` (409 CONFLICT)
**Backend Console Shows:**
```
org.springframework.web.server.ResponseStatusException: 409 CONFLICT "You already have a pending BORROW request for this book"
```

**Causes:**
- User already has a pending request for this book
- Previous request wasn't processed

**Fix:**
```sql
-- Check existing requests:
SELECT * FROM book_requests 
WHERE user_id = 2 AND book_id = 1 AND status = 'PENDING';

-- If stuck, manually update:
UPDATE book_requests 
SET status = 'REJECTED' 
WHERE id = <request_id>;
```

---

### Error 5: `NumberFormatException`
**Backend Console Shows:**
```
java.lang.NumberFormatException: For input string: "undefined"
```

**Causes:**
- `bookId` is being sent as string `"undefined"` instead of number
- Frontend `book.id` is undefined

**Fix:**
Add validation in frontend:
```typescript
if (!book.id) {
  console.error("Book ID is undefined!");
  return;
}
```

---

### Error 6: `CORS Error` (Frontend shows, backend silent)
**Frontend Console Shows:**
```
Access to fetch at 'http://localhost:8090/api/book-requests' from origin 'http://localhost:8081' has been blocked by CORS policy
```

**Backend Console Shows:**
```
DEBUG o.s.web.cors.DefaultCorsProcessor - Reject: 'http://localhost:8081' origin is not allowed
```

**Fix:**
Already fixed in `CorsConfig.java`:
```java
config.setAllowedOrigins(Arrays.asList(
    "http://localhost:8081"  // ✅ Port 8081 is allowed
));
```

---

### Error 7: `401 Unauthorized`
**Frontend Console Shows:**
```
Failed to create book request: Request failed
```

**Backend Console Shows:**
```
WARN o.s.s.w.authentication.AuthenticationFilter - Authentication failed
```

**Causes:**
- No auth token in request
- Token expired
- Wrong token

**Fix:**
Check localStorage:
```javascript
// In browser console:
localStorage.getItem('token')
// Should return: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

If no token, login again.

---

## Testing with Postman

### 1. Login First
```http
POST http://localhost:8090/api/auth/login
Content-Type: application/json

{
  "email": "user@bookies.com",
  "password": "user123"
}
```

**Copy the token from response:**
```json
{
  "token": "eyJhbGci...",
  "user": { ... }
}
```

### 2. Create Book Request
```http
POST http://localhost:8090/api/book-requests
Content-Type: application/json
Authorization: Bearer eyJhbGci...  ← Paste token here

{
  "bookId": 1,
  "userEmail": "user@bookies.com",
  "requestType": "BORROW"
}
```

**Expected Response (201 CREATED):**
```json
{
  "id": 1,
  "bookId": 1,
  "bookTitle": "The Great Gatsby",
  "userId": 2,
  "userEmail": "user@bookies.com",
  "status": "PENDING",
  "requestType": "BORROW",
  "requestedAt": "2024-01-20T10:30:00"
}
```

---

## Backend Logging Explained

### Successful Request
```
INFO  c.b.c.BookRequestController - Creating book request: {bookId=1, userEmail=user@bookies.com, requestType=BORROW}
INFO  c.b.c.BookRequestController - Book request created: ID=1, Type=BORROW, User=user@bookies.com
```

### Failed Request (Book Not Found)
```
INFO  c.b.c.BookRequestController - Creating book request: {bookId=999, userEmail=user@bookies.com, requestType=BORROW}
WARN  o.s.w.s.m.m.a.ExceptionHandlerExceptionResolver - Resolved [org.springframework.web.server.ResponseStatusException: 404 NOT_FOUND "Book not found"]
```

### Failed Request (Duplicate)
```
INFO  c.b.c.BookRequestController - Creating book request: {bookId=1, userEmail=user@bookies.com, requestType=BORROW}
WARN  o.s.w.s.m.m.a.ExceptionHandlerExceptionResolver - Resolved [org.springframework.web.server.ResponseStatusException: 409 CONFLICT "You already have a pending BORROW request for this book"]
```

---

## Database Verification Queries

### Check Books
```sql
SELECT id, title, status FROM books;
```

### Check Users
```sql
SELECT id, email, role FROM users;
```

### Check Book Requests
```sql
SELECT 
  br.id,
  br.request_type,
  br.status,
  b.title AS book_title,
  u.email AS user_email,
  br.requested_at
FROM book_requests br
JOIN books b ON br.book_id = b.id
JOIN users u ON br.user_id = u.id
ORDER BY br.requested_at DESC;
```

### Check Pending Requests
```sql
SELECT * FROM book_requests WHERE status = 'PENDING';
```

---

## Quick Troubleshooting Checklist

When book request fails:

1. ✅ **Backend Console** - Check for error stack trace
2. ✅ **Frontend Console** - Check for network errors
3. ✅ **Browser Network Tab** - Check request/response details
   - Request Headers: Should have `Authorization: Bearer <token>`
   - Request Payload: Should have `{ bookId, userEmail, requestType }`
   - Response Status: Check if 200, 400, 401, 404, 409, or 500
4. ✅ **Database** - Verify book and user exist
5. ✅ **Token** - Check localStorage has valid token
6. ✅ **CORS** - Verify port 8081 is allowed

---

## Test Script

Save as `test-book-request-debug.ps1`:

```powershell
# Test book request creation with detailed logging
$token = "YOUR_TOKEN_HERE"  # Get from localStorage after login

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$body = @{
    bookId = 1
    userEmail = "user@bookies.com"
    requestType = "BORROW"
} | ConvertTo-Json

Write-Host "Sending request..." -ForegroundColor Cyan
Write-Host "Payload: $body" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8090/api/book-requests" -Method POST -Headers $headers -Body $body
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response:" -ForegroundColor Red
    $_.Exception.Response | Select-Object StatusCode, StatusDescription
}
```

---

## Summary

✅ **Payload structures are correct**  
✅ **CORS is configured**  
✅ **Authentication headers implemented**  
✅ **Error handling in place**  

**Next Step:** Start backend, watch console during frontend test, and look for the exact error message!

