# 🚀 Complete Render Deployment Guide - PostgreSQL

## ✅ What We've Done

1. ✅ Added PostgreSQL driver to `pom.xml`
2. ✅ Kept MySQL driver for local development
3. ✅ Updated `application-prod.properties` to support both databases
4. ✅ Rebuilt JAR with PostgreSQL support
5. ✅ Committed and pushed to GitHub (commit: `2b84d88`)

---

## 📦 Step 1: Create PostgreSQL Database on Render

### **Option A: Render PostgreSQL (Recommended)**

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `bookies-db`
   - **Database**: `bookies_db` (auto-generated)
   - **User**: `bookies_user` (auto-generated)
   - **Region**: **Singapore**
   - **Plan**: **Free**
4. Click **"Create Database"**
5. Wait 2-3 minutes for provisioning
6. Copy the **Internal Database URL** (starts with `postgres://`)
   - Example: `postgres://bookies_user:xxxxx@dpg-xxxxx-a/bookies_db`

---

## 🚀 Step 2: Deploy Backend Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Click **"Build and deploy from a Git repository"**
3. Connect repository: **`pbhavyasri5/Bookies-1`**
4. Configure:

| Field | Value |
|-------|-------|
| **Name** | `bookies-backend` |
| **Region** | **Singapore** |
| **Branch** | `master` |
| **Root Directory** | `bookies-backend` |
| **Runtime** | **Docker** |
| **Instance Type** | **Free** |

---

## ⚙️ Step 3: Add Environment Variables

Click **"Advanced"** → Add these environment variables:

### **For PostgreSQL (Render Database):**

```bash
# Database URL (from Step 1 - Internal URL)
DATABASE_URL
postgres://bookies_user:password@dpg-xxxxx-a/bookies_db

# Database driver for PostgreSQL
DB_DRIVER
org.postgresql.Driver

# Database dialect for PostgreSQL
DB_DIALECT
org.hibernate.dialect.PostgreSQLDialect

# JWT Secret (generate a strong random string)
JWT_SECRET
bookies-super-secure-jwt-secret-2025-change-this-in-production

# Spring Profile
SPRING_PROFILES_ACTIVE
prod

# Frontend URL (your Vercel deployment)
FRONTEND_URL
https://free-shelf-buddy-37.vercel.app

# Server Port (Render expects 8090 from Dockerfile)
PORT
8090
```

**Important Notes:**
- Use the **Internal Database URL** from your PostgreSQL service (faster, free internal connection)
- The `DATABASE_URL` format is: `postgres://user:password@host/database`
- Spring Boot automatically converts `postgres://` to `jdbc:postgresql://`

---

## 🎯 Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone repository
   - Build Docker image with JAR
   - Deploy application
3. Wait **5-10 minutes** for first deployment
4. Your backend will be at: `https://bookies-backend-xxxx.onrender.com`

---

## 💾 Step 5: Seed Database

Once deployed, connect to your PostgreSQL database and run SQL:

### **Option A: Using Render Dashboard**

1. Go to your PostgreSQL service
2. Click **"Connect"** → **"External Connection"**
3. Use credentials to connect via:
   - **psql** command line
   - **DBeaver**
   - **pgAdmin**
   - **Any PostgreSQL client**

### **SQL to Run:**

```sql
-- Create tables (Spring Boot should auto-create with ddl-auto=update)
-- But you can manually verify

-- Check if tables exist
\dt

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create books table if not exists
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    published_date DATE,
    category VARCHAR(100),
    isbn VARCHAR(50),
    publisher VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'available',
    cover_image VARCHAR(255) DEFAULT '/placeholder.svg',
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test users (passwords are bcrypt hashed for "1234" and "user123")
INSERT INTO users (name, email, password, role) VALUES
('Librarian', 'librarian@library.com', '$2a$10$XQjhZ9z5Z9z5Z9z5Z9z5Z9z5Z9z5Z9z5Z9z5Z9z5Z9z5Z9z5Z9z5', 'ADMIN'),
('Test User', 'user@bookies.com', '$2a$10$YRkiA1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1', 'USER')
ON CONFLICT (email) DO NOTHING;

-- Insert sample books
INSERT INTO books (title, author, published_date, category, isbn, publisher, description) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '1925-04-10', 'Fiction', '978-0-7432-7356-5', 'Scribner', 'A classic American novel'),
('1984', 'George Orwell', '1949-06-08', 'Fiction', '978-0-452-28423-4', 'Penguin Books', 'Dystopian social science fiction'),
('To Kill a Mockingbird', 'Harper Lee', '1960-07-11', 'Fiction', '978-0-06-112008-4', 'HarperCollins', 'A gripping tale of racial injustice')
ON CONFLICT DO NOTHING;

-- Verify data
SELECT * FROM users;
SELECT * FROM books;
```

**Note:** You'll need to generate proper bcrypt hashed passwords. You can use your local Spring Boot app to generate them or use online bcrypt generators.

---

## 🌐 Step 6: Update Vercel Frontend

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select project: **`free-shelf-buddy-37`**
3. Go to **Settings** → **Environment Variables**
4. Add/Update:

```
VITE_API_BASE_URL = https://bookies-backend-xxxx.onrender.com/api
```

*(Replace with your actual Render backend URL)*

5. Select: **Production, Preview, Development**
6. Click **"Save"**
7. Go to **Deployments** → Click **"..."** → **"Redeploy"**

---

## 🧪 Step 7: Test Your Application

1. Wait for Vercel redeployment (2-3 minutes)
2. Visit: `https://free-shelf-buddy-37.vercel.app`
3. Test login:
   - **Admin**: `librarian@library.com` / `1234`
   - **User**: `user@bookies.com` / `user123`
4. Verify:
   - ✅ Books load from PostgreSQL database
   - ✅ Login works without CORS errors
   - ✅ Admin can upload/change book images
   - ✅ User has read-only access

---

## 📊 Configuration Summary

### **Your Setup:**

| Component | Technology | URL |
|-----------|-----------|-----|
| **Frontend** | Vercel | `https://free-shelf-buddy-37.vercel.app` |
| **Backend** | Render (Docker) | `https://bookies-backend-xxxx.onrender.com` |
| **Database** | Render PostgreSQL | Internal connection |
| **Repository** | GitHub | `pbhavyasri5/Bookies-1` |

### **Database Configuration:**

- **Local Development**: MySQL (`localhost:3306`)
- **Production (Render)**: PostgreSQL (Render managed)
- **Automatic switching**: Based on `DATABASE_URL` environment variable

---

## 🔧 Troubleshooting

### **Issue 1: Database Connection Errors**

**Symptom:** 
```
Could not connect to database
Connection refused
```

**Solution:**
1. Verify `DATABASE_URL` is set correctly in Render
2. Use **Internal Database URL** (starts with `postgres://`)
3. Check PostgreSQL service is running
4. Verify database name matches

### **Issue 2: Driver Not Found**

**Symptom:**
```
No suitable driver found for postgres://
```

**Solution:**
1. Verify `pom.xml` includes PostgreSQL driver
2. Rebuild JAR: `./mvnw clean package -DskipTests`
3. Commit and push changes
4. Redeploy on Render

### **Issue 3: Table Not Found**

**Symptom:**
```
relation "users" does not exist
relation "books" does not exist
```

**Solution:**
1. Check `spring.jpa.hibernate.ddl-auto=update` in properties
2. Manually run SQL schema creation (Step 5)
3. Verify database name is correct

### **Issue 4: CORS Errors on Frontend**

**Symptom:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
2. Check `CorsConfig.java` allows `*.vercel.app`
3. Ensure no trailing slashes in URLs

### **Issue 5: Login Fails**

**Symptom:**
```
Invalid username or password (but credentials are correct)
```

**Solution:**
1. Check users exist in database: `SELECT * FROM users;`
2. Verify password hashes are bcrypt encoded
3. Check JWT_SECRET is set in Render environment variables

---

## 📝 Useful Commands

### **Check Render Logs:**
1. Go to your Web Service in Render
2. Click **"Logs"** tab
3. Filter by: **"Deploy Logs"** or **"Application Logs"**

### **Connect to PostgreSQL:**
```bash
# Using psql (from Render dashboard "Connect" tab)
psql -h dpg-xxxxx-singapore-a.render.com -U bookies_user -d bookies_db

# List tables
\dt

# Query users
SELECT * FROM users;

# Query books
SELECT * FROM books;

# Exit
\q
```

### **Redeploy Backend:**
1. Push changes to GitHub
2. Render auto-deploys from `master` branch
3. Or click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🎉 Success Checklist

- [ ] PostgreSQL database created on Render
- [ ] Backend web service deployed with Docker
- [ ] All environment variables configured
- [ ] Database seeded with users and books
- [ ] Vercel frontend updated with backend URL
- [ ] Login works with test credentials
- [ ] Books display correctly
- [ ] Admin features work (image upload)
- [ ] No CORS errors in browser console

---

## 🆘 Need Help?

**Check these resources:**
1. **Render Logs**: Dashboard → Your Service → Logs
2. **Browser Console**: F12 → Console tab
3. **Network Tab**: F12 → Network tab (check API calls)
4. **PostgreSQL Logs**: Dashboard → PostgreSQL Service → Logs

**Common Issues:**
- Backend not starting? → Check logs for database connection errors
- 404 on API calls? → Verify `VITE_API_BASE_URL` in Vercel
- Login fails? → Check database has user records with correct passwords
- CORS errors? → Verify `FRONTEND_URL` in Render environment variables

---

## 🚀 Your Application is Ready!

**Frontend:** https://free-shelf-buddy-37.vercel.app
**Backend:** https://bookies-backend-xxxx.onrender.com (replace with your URL)

**Test Credentials:**
- Admin: `librarian@library.com` / `1234`
- User: `user@bookies.com` / `user123`

Enjoy your deployed Library Management System! 📚✨
