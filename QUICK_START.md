# 🎯 QUICK START GUIDE

## ✅ Current Status
- ✅ Backend running on port 8090
- ✅ Frontend running on port 8080
- ✅ Frontend connected to backend (API_BASE fixed)

---

## 🚀 3 Steps to Start Using

### 1. Setup Database Users
```sql
-- In MySQL Workbench, run:
source c:\JFS-bookies\fix_test_users.sql
```

### 2. Open Browser
```
http://localhost:8080
```

### 3. Login
```
User:  user@bookies.com / user123
Admin: librarian@library.com / 1234
```

---

## 🔧 What Was Fixed

### Frontend Connection ✅
**File:** `frontend/src/services/api.ts`

**Before:**
```typescript
const API_BASE = '/api';  // ❌ Didn't work
```

**After:**
```typescript
const API_BASE = 'http://localhost:8090/api';  // ✅ Works!
```

---

## 📋 If Login Fails

**Error:** "Invalid email or password"

**Solution:**
```sql
-- Run in MySQL Workbench
USE bookies_db;
SELECT * FROM user;  -- Check if users exist

-- If empty, run:
source c:\JFS-bookies\fix_test_users.sql
```

---

## 🛑 Stop/Restart Servers

### Stop
Close the two PowerShell windows or:
```powershell
# Stop backend
Get-NetTCPConnection -LocalPort 8090 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Stop frontend
Get-NetTCPConnection -LocalPort 8080 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Restart
```powershell
# Backend
cd c:\JFS-bookies\bookies-backend
mvn spring-boot:run

# Frontend (new terminal)
cd c:\JFS-bookies\frontend
npm run dev
```

---

## 🧪 Test Everything Works

```powershell
# Run this script
cd c:\JFS-bookies
.\test-book-request.ps1

# Should show:
# ✅ Backend accessible
# ✅ Login successful
# ✅ Book request created
```

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| Frontend URL | http://localhost:8080 |
| Backend URL | http://localhost:8090 |
| Database | bookies_db@localhost:3306 |
| DB User | root |
| DB Password | Bhavyeah#1 |
| Test User | user@bookies.com / user123 |
| Test Admin | librarian@library.com / 1234 |

---

## 🎯 Testing Features

### As User:
1. Browse books
2. Request to borrow a book
3. View my books
4. Request to return

### As Admin:
1. Add new books
2. Edit books
3. View pending requests
4. Approve/Reject requests

---

## ✨ Everything Connected!

```
Browser (localhost:8080) 
    ↓
Frontend (Vite + React)
    ↓ API calls to http://localhost:8090/api
Backend (Spring Boot)
    ↓
Database (MySQL - bookies_db)
```

**Status:** ✅ All connected and working!
