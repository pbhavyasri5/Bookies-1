# 🔍 Frontend-Backend Connection Diagnostic & Fix

## ✅ CONFIGURATION VERIFIED - ALL CORRECT!

I've just checked all your configuration files, and **everything is properly set up**!

### 1. Frontend API Configuration ✅
**File:** `frontend/src/services/api.ts`
```typescript
const API_BASE = 'http://localhost:8090/api';
```
✅ **CORRECT** - Points to backend port 8090

---

### 2. Frontend Port Configuration ✅
**File:** `frontend/vite.config.ts`
```typescript
server: {
  port: 8080,  // Frontend runs on 8080
  proxy: {
    '/api': {
      target: 'http://localhost:8090',  // Proxies to backend
    }
  }
}
```
✅ **CORRECT** - Frontend on 8080, proxies to backend 8090

---

### 3. CORS Configuration ✅
**File:** `bookies-backend/src/main/java/com/bookies/config/CorsConfig.java`
```java
config.setAllowedOrigins(Arrays.asList(
    "http://localhost:8080",  // ✅ Your frontend port
    "http://localhost:8081",
    "http://localhost:5173",
    "http://localhost:3000"
));
config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
```
✅ **CORRECT** - Port 8080 allowed, all methods enabled

---

### 4. Controller Mapping ✅
**File:** `BookRequestController.java`
```java
@RestController
@RequestMapping("/api/book-requests")
@CrossOrigin(origins = {"http://localhost:8080", ...})
```
✅ **CORRECT** - Endpoint properly mapped

---

## 🎯 Complete Endpoint Map

### Backend Endpoints (Port 8090)

| Method | Full URL | Purpose |
|--------|----------|---------|
| POST | `http://localhost:8090/api/book-requests` | Create book request |
| GET | `http://localhost:8090/api/book-requests/pending` | Get pending requests |
| GET | `http://localhost:8090/api/book-requests/user/{email}` | Get user's requests |
| GET | `http://localhost:8090/api/book-requests/{id}` | Get specific request |
| POST | `http://localhost:8090/api/book-requests/{id}/approve` | Approve request |
| POST | `http://localhost:8090/api/book-requests/{id}/reject` | Reject request |
| DELETE | `http://localhost:8090/api/book-requests/{id}` | Delete request |

---

## 🐛 Troubleshooting Guide

### Issue 1: "Unexpected error occurred" ⚠️

**Most Likely Cause:** Missing test users in database

**Check:**
```sql
USE bookies_db;
SELECT email, role FROM user;
```

**Solution:** Run the SQL script
```powershell
# In MySQL Workbench, open and execute:
c:\JFS-bookies\fix_test_users.sql
```

**This creates:**
- `user@bookies.com` / `user123` (ROLE_USER)
- `librarian@library.com` / `1234` (ROLE_ADMIN)

---

### Issue 2: "Network Error" or "Connection Refused"

**Cause:** Backend not running

**Check:**
```powershell
Get-NetTCPConnection -LocalPort 8090 -ErrorAction SilentlyContinue
```

**Solution:**
```powershell
# Open NEW PowerShell window
cd c:\JFS-bookies\bookies-backend
mvn spring-boot:run
```

---

### Issue 3: "401 Unauthorized"

**Cause:** Not logged in or invalid token

**Check in browser console (F12):**
```javascript
console.log('Token:', localStorage.getItem('token'));
```

**Solution:** 
1. Login first with valid credentials
2. If token exists but still failing, login again to refresh

---

### Issue 4: "403 Forbidden"

**Cause:** User doesn't have admin role

**Admin-only endpoints:**
- `/api/book-requests/pending` (GET)
- `/api/book-requests/{id}/approve` (POST)
- `/api/book-requests/{id}/reject` (POST)

**Solution:** Login as admin: `librarian@library.com` / `1234`

---

### Issue 5: "404 Not Found"

**Cause:** Wrong endpoint URL

**Common Mistakes:**
- ❌ `/bookrequests` (missing hyphen)
- ❌ `/api/bookRequests` (wrong case)
- ✅ `/api/book-requests` (correct)

**Test directly:**
```
http://localhost:8090/api/book-requests/pending
```

---

### Issue 6: "400 Bad Request - Book not found"

**Cause:** BookId doesn't exist in database

**Check:**
```sql
SELECT id, title FROM books;
```

**Solution:** Add books first (as admin) or use existing book ID

---

## 🧪 Testing in Browser DevTools

### Step 1: Open DevTools
Press **F12** → Go to **Network** tab

### Step 2: Trigger Action
Click "Request Book" button

### Step 3: Inspect Request

**What to check:**

✅ **Request URL:** Should be `http://localhost:8090/api/book-requests`

✅ **Request Method:** POST

✅ **Request Headers:** Should include:
```
Authorization: Bearer eyJhbG...
Content-Type: application/json
```

✅ **Request Payload:** Should show:
```json
{
  "bookId": 1,
  "userEmail": "user@bookies.com",
  "requestType": "BORROW"
}
```

✅ **Response Status:**
- `201 Created` = Success! ✅
- `400 Bad Request` = Invalid data (check message)
- `401 Unauthorized` = Not logged in
- `403 Forbidden` = No permission
- `404 Not Found` = Book doesn't exist
- `500 Internal Error` = Backend error (check logs)

✅ **Response Body:** Should show:
```json
{
  "id": 1,
  "bookId": 1,
  "userEmail": "user@bookies.com",
  "requestType": "BORROW",
  "status": "PENDING",
  "requestDate": "2025-01-15T10:30:00"
}
```

---

## 🔍 Backend Logs Analysis

### Success Logs:
```
INFO  c.b.controller.BookRequestController - Creating book request: {bookId=1, userEmail=user@bookies.com, requestType=BORROW}
INFO  c.b.controller.BookRequestController - Processing request - BookId: 1, UserEmail: user@bookies.com, Type: BORROW
INFO  c.b.controller.BookRequestController - Book request created successfully: ID=1, Type=BORROW, User=user@bookies.com
```

### Error Logs:
```
ERROR c.b.controller.BookRequestController - Request failed: Book not found with ID: 1
ERROR c.b.controller.BookRequestController - Request failed: User not found: user@bookies.com
ERROR c.b.controller.BookRequestController - Request failed: Invalid request parameters
```

**How to view logs:** Look in the PowerShell window where you ran `mvn spring-boot:run`

---

## 🔧 Quick Fixes

### Fix 1: Restart Everything
```powershell
# Kill all processes
Get-NetTCPConnection -LocalPort 8090 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
Get-NetTCPConnection -LocalPort 8080 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Backend (NEW window)
cd c:\JFS-bookies\bookies-backend
mvn spring-boot:run

# Frontend (NEW window)
cd c:\JFS-bookies\frontend
npm run dev
```

### Fix 2: Clear Browser Data
```javascript
// In browser console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Fix 3: Test API with PowerShell
```powershell
# Test login
$loginBody = @{
    email = "user@bookies.com"
    password = "user123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8090/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

Write-Host "Token: $($loginResponse.token)"

# Test book request
$requestBody = @{
    bookId = 1
    userEmail = "user@bookies.com"
    requestType = "BORROW"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8090/api/book-requests" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ "Authorization" = "Bearer $($loginResponse.token)" } `
    -Body $requestBody
```

---

## ✅ Pre-Flight Checklist

Before testing, verify:

- [ ] MySQL is running (check XAMPP or MySQL service)
- [ ] Database `bookies_db` exists
- [ ] Test users created (run `fix_test_users.sql` if not)
- [ ] At least one book exists in database
- [ ] Backend running on port 8090 (check PowerShell window)
- [ ] Frontend running on port 8080 (check browser at http://localhost:8080)
- [ ] No CORS errors in browser console
- [ ] Can login successfully

---

## 📊 Expected Flow

### Successful Book Request:

```
1. User clicks "Request Book"
   ↓
2. Frontend calls: bookRequestService.createRequest()
   URL: http://localhost:8090/api/book-requests
   Method: POST
   Headers: Authorization, Content-Type
   Body: { bookId, userEmail, requestType }
   ↓
3. Backend: BookRequestController.createBookRequest()
   ✓ Validates input
   ✓ Finds book by ID
   ✓ Finds user by email
   ✓ Creates BookRequest entity
   ✓ Saves to database
   ↓
4. Response: 201 Created
   Body: { id, bookId, status: "PENDING", ... }
   ↓
5. Frontend: Shows success toast
   UI: Updates to show "Request Pending"
```

---

## 🎯 Summary

### Configuration Status: ✅ ALL CORRECT!

✅ Frontend API points to correct backend URL  
✅ CORS allows frontend port 8080  
✅ All HTTP methods enabled  
✅ Controller endpoints properly mapped  
✅ Request/response formats correct  

### Most Common Issue: Missing Database Users

**Solution:** Run this in MySQL Workbench:
```sql
-- Execute: c:\JFS-bookies\fix_test_users.sql
```

### Next Steps:

1. **Run SQL script** to create test users
2. **Start Backend:**
   ```powershell
   cd c:\JFS-bookies\bookies-backend
   mvn spring-boot:run
   ```
3. **Start Frontend:**
   ```powershell
   cd c:\JFS-bookies\frontend
   npm run dev
   ```
4. **Test:**
   - Open http://localhost:8080
   - Login: `user@bookies.com` / `user123`
   - Try requesting a book
   - Check Network tab in DevTools if issues

### If Still Not Working:

1. Check backend console for specific error message
2. Check browser Network tab for actual response
3. Verify database has users and books
4. Clear browser cache/localStorage
5. Use PowerShell test script to isolate issue

---

**Your configuration is 100% correct - just need to ensure database is set up!** 🎉
