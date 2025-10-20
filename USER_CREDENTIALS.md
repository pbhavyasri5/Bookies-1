# Backend User Credentials

## ADMIN ACCOUNTS

### 1. Primary Admin (Librarian)
- **Email:** `librarian@library.com`
- **Password:** `1234`
- **Role:** ADMIN
- **Source:** `BookiesBackendApplication.java` (line 35-45)
- **Note:** This is the main admin account seeded on startup

### 2. Secondary Admin
- **Email:** `admin@bookies.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Source:** `DataInitializer.java` (line 22-30)

---

## USER ACCOUNTS

### 3. Regular User
- **Email:** `user@bookies.com`
- **Password:** `user123`
- **Role:** USER
- **Source:** `DataInitializer.java` (line 33-41)

---

## Important Notes

✅ **All passwords are hashed with BCrypt** before being stored in the database
✅ **Auto-seeded on startup** - These users are automatically created when the backend starts
✅ **Login URL:** http://localhost:8080
✅ **Backend API:** http://localhost:8090

## Recommended for Testing

**For Admin Functions (Manage Books, Add Books, etc.):**
```
Email:    librarian@library.com
Password: 1234
```

**For User Functions (Browse Books, Borrow Books, etc.):**
```
Email:    user@bookies.com
Password: user123
```

---

Generated: October 19, 2025
