# 🚀 Quick Start - Testing Book Request Feature

## ⚡ 3-Step Test

### 1️⃣ Open Application
```
http://localhost:8080
```

### 2️⃣ Login as User
```
Email: user@bookies.com
Password: user123
```

### 3️⃣ Click "Request Book"
Find any available book → Click "Request Book" button

---

## 🎯 Expected Results

### ✅ Success
**Toast Message:** "Request Submitted - Your request for [Book Title] is pending admin approval"

**What Happens:**
- Request saved to database
- Book status changes to "Pending Request"
- Admin can see the request

### ❌ If You See "Request Failed"

The toast will now show **the actual error**, for example:
- "Book not found with ID: 5" → That book doesn't exist
- "User not found with email: user@bookies.com" → User doesn't exist in DB
- "Book ID is required" → Frontend bug (book.id is undefined)
- "You already have a pending request" → Duplicate request

---

## 🔍 Quick Debug

### Check Backend Console
Look for this in the Spring Boot window:

**Success:**
```
INFO  c.b.controller.BookRequestController - Creating book request: {bookId=1, userEmail=user@bookies.com, requestType=BORROW}
INFO  c.b.controller.BookRequestController - Processing request - BookId: 1, UserEmail: user@bookies.com, Type: BORROW
INFO  c.b.controller.BookRequestController - Book request created successfully: ID=1, Type=BORROW, User=user@bookies.com
```

**Error:**
```
ERROR c.b.controller.BookRequestController - Request failed: Book not found with ID: 1
```

### Check Browser (F12)
1. **Console Tab:** Look for JavaScript errors
2. **Network Tab:** 
   - Find POST request to `/api/book-requests`
   - Click it
   - Check "Response" tab for exact error

---

## 🛠️ Common Fixes

### "Book not found"
**Problem:** No books in database  
**Fix:** Login as admin → Add books first

**Admin Login:**
```
Email: librarian@library.com
Password: 1234
```

### "User not found"
**Problem:** User doesn't exist in database  
**Fix:** Run this SQL:
```sql
SELECT * FROM user WHERE email = 'user@bookies.com';
```
If empty, user wasn't created. Check database initialization.

### "Unexpected error occurred"
**Problem:** Generic error (should be fixed now!)  
**Fix:** The new error handling should show the real error. If you still see this:
1. Check backend console for ERROR lines
2. Backend might need restart:
   ```powershell
   # Close backend window, then:
   cd c:\JFS-bookies\bookies-backend
   mvn spring-boot:run
   ```

### Token/Auth Issues
**Problem:** "Unauthorized" or "Forbidden"  
**Fix:** 
```javascript
// In browser console (F12)
localStorage.clear();
// Then login again
```

---

## 🗄️ Database Quick Check

```sql
-- Check tables exist
SHOW TABLES;
-- Expected: books, book_requests, user, auth_tokens, members

-- Check if books exist
SELECT id, title, status FROM books;
-- Should show some books

-- Check if user exists  
SELECT id, email, role FROM user WHERE email = 'user@bookies.com';
-- Should show: id=2, email=user@bookies.com, role=ROLE_USER

-- Check requests after testing
SELECT * FROM book_requests ORDER BY requested_at DESC LIMIT 5;
```

---

## 📞 Still Having Issues?

**Collect This Information:**
1. ✅ **Backend Console Error** (copy the ERROR line)
2. ✅ **Frontend Toast Message** (exact text)
3. ✅ **Browser Network Response** (F12 → Network → Response tab)
4. ✅ **Database State** (run SQL queries above)

Then check:
- **BOOK_REQUEST_TROUBLESHOOTING.md** - Detailed debugging
- **BOOK_REQUEST_STATUS.md** - What was changed

---

## 🎉 After Success

### Test Admin Approval
1. Logout
2. Login as admin: `librarian@library.com` / `1234`
3. You should see "Pending Requests" section
4. Click "Approve" or "Reject"
5. Book status should update

### Verify in Database
```sql
-- See the approved request
SELECT 
    br.status,
    br.request_type,
    b.title,
    b.status AS book_status,
    u.email
FROM book_requests br
JOIN books b ON br.book_id = b.id
JOIN user u ON br.user_id = u.id
WHERE br.id = 1;
```

---

## ✨ Summary

**Both servers are running** ✅  
**Error handling improved** ✅  
**You should now see specific error messages** ✅

Try it now! The "Unexpected error occurred" message should be replaced with helpful, specific errors that tell you exactly what went wrong.
