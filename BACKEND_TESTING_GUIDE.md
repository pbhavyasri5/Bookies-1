# Backend Testing Guide

## Current Status

**Backend is NOT responding on port 8090**

The backend was started with:
```powershell
cd c:\JFS-bookies\bookies-backend
mvn spring-boot:run
```

However, it's not responding to HTTP requests after 2+ minutes.

## Possible Issues

1. **Compilation Error**: The backend may have failed to compile due to:
   - New @Query annotation syntax
   - Import statements
   - Case-insensitive method

2. **Port Already in Use**: Port 8090 might be occupied

3. **Database Connection**: MySQL connection might be failing

## Manual Checks Needed

### 1. Check Backend Terminal
Look at the terminal where `mvn spring-boot:run` was executed:
- Look for RED error messages
- Look for "BUILD SUCCESS" or "BUILD FAILURE"
- Look for "Started BookiesBackendApplication" (success)
- Look for port binding errors

### 2. Check for Java Process
```powershell
Get-Process -Name java | Select-Object Id,CPU,WorkingSet
```

### 3. Check Port 8090
```powershell
netstat -ano | findstr :8090
```

### 4. Test Database Connection
```powershell
mysql -u root -p bookies_db -e "SELECT * FROM user;"
```

## If Backend Terminal Shows Errors

### Compilation Error Fix
If you see compilation errors related to `UserRepository`:

1. Remove the @Query method temporarily:
   ```java
   // Comment out findByEmailIgnoreCase in UserRepository.java
   ```

2. Revert UserController to use `findByEmail`:
   ```java
   User user = userRepository.findByEmail(email).orElse(null);
   ```

3. Restart backend

### Port Already in Use
```powershell
# Find process using port 8090
Get-NetTCPConnection -LocalPort 8090 -ErrorAction SilentlyContinue

# Kill it
Stop-Process -Id <PID> -Force
```

## Quick Test Once Backend is Up

```powershell
# Test login
$body = '{"email":"librarian@library.com","password":"1234"}'
Invoke-RestMethod -Uri "http://localhost:8090/api/users/login" -Method POST -Body $body -ContentType "application/json"
```

## Frontend Testing

Once backend is confirmed working:

1. Open browser: `http://localhost:8080`
2. Try to login with:
   - Email: librarian@library.com
   - Password: 1234
3. Check if accountType shows as "ADMIN"

## All Changes Made

1. **UserRepository.java**: Added `findByEmailIgnoreCase()` method
2. **UserController.java**: Updated login to use case-insensitive lookup
3. **User.java**: Field renamed from `role` to `accountType`
4. Table name fixed: `users` → `user`

If backend won't start, we may need to temporarily revert the @Query changes.
