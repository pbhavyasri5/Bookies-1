# 🔧 VERCEL AUTHENTICATION FIX - COMPLETE GUIDE

**Date:** October 20, 2025  
**Issue:** Authentication works locally but fails on Vercel deployment  
**Status:** ✅ **CODE FIXED** - Deployment steps required

---

## 🎯 **ROOT CAUSES IDENTIFIED**

### **1. Frontend Issues:**
- ❌ API URL hardcoded to `localhost:8090` (doesn't work in production)
- ❌ No environment variables configured for different environments
- ❌ Vercel deployment can't reach local backend

### **2. Backend Issues:**
- ❌ CORS only allows localhost origins (blocks Vercel requests)
- ❌ Backend NOT deployed to cloud (Spring Boot runs locally only)
- ❌ Database connection hardcoded to localhost MySQL

### **3. Infrastructure Issues:**
- ❌ Backend server not publicly accessible
- ❌ No production database configured
- ❌ Environment variables not set in Vercel

---

## ✅ **FIXES APPLIED (Already Done)**

### **Frontend Changes:**

1. **Updated `api.ts`:**
   - ✅ Changed from hardcoded URL to environment variable
   - ✅ Uses `import.meta.env.VITE_API_BASE_URL`
   - ✅ Falls back to localhost for development

2. **Created Environment Files:**
   - ✅ `.env.development` - Local development
   - ✅ `.env.production` - Production template
   - ✅ `.env.example` - Example for team

3. **Backend Changes:**
   - ✅ Updated CORS to accept Vercel domains
   - ✅ Uses `allowedOriginPatterns` for wildcard support
   - ✅ Added support for all Vercel preview deployments

---

## 🚀 **DEPLOYMENT STEPS REQUIRED**

### **PHASE 1: Deploy Backend to Cloud** ⚠️ **CRITICAL**

Your Spring Boot backend MUST be deployed to a cloud platform. Here are your options:

#### **Option A: Railway (Recommended - Easiest)**

**Why Railway:**
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Built-in MySQL database
- ✅ Zero configuration needed
- ✅ Great for Spring Boot apps

**Steps:**

1. **Sign up for Railway:**
   ```
   https://railway.app
   ```
   - Sign in with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `pbhavyasri5/Bookies-1`
   - Select the `bookies-backend` directory

3. **Add MySQL Database:**
   - In your project, click "New"
   - Select "Database" → "MySQL"
   - Railway will create a database automatically

4. **Configure Environment Variables:**
   ```
   DB_URL=<Railway will provide this>
   DB_USERNAME=<Railway will provide this>
   DB_PASSWORD=<Railway will provide this>
   JWT_SECRET=your-super-secret-jwt-key-change-this
   FRONTEND_URL=https://free-shelf-buddy-37.vercel.app
   ```

5. **Deploy:**
   - Railway will automatically build and deploy
   - Get your backend URL: `https://your-app.railway.app`

---

#### **Option B: Render**

**Why Render:**
- ✅ Free tier available
- ✅ Easy Spring Boot deployment
- ✅ Supports external MySQL
- ✅ Good documentation

**Steps:**

1. **Sign up:**
   ```
   https://render.com
   ```

2. **Create Web Service:**
   - New → Web Service
   - Connect GitHub repo: `pbhavyasri5/Bookies-1`
   - Root Directory: `bookies-backend`

3. **Build Settings:**
   ```
   Build Command: ./mvnw clean package -DskipTests
   Start Command: java -jar target/bookies-backend-0.0.1-SNAPSHOT.jar
   ```

4. **Add Environment Variables:**
   ```
   DB_URL=<your-mysql-connection-string>
   DB_USERNAME=<your-db-username>
   DB_PASSWORD=<your-db-password>
   JWT_SECRET=your-secret-key
   FRONTEND_URL=https://free-shelf-buddy-37.vercel.app
   ```

5. **Database Options:**
   - Use Render's PostgreSQL (free tier)
   - OR use external MySQL (PlanetScale, Railway, etc.)

---

#### **Option C: Heroku**

**Note:** Heroku no longer has a free tier, but still a good option.

**Steps:**

1. **Install Heroku CLI:**
   ```bash
   # Download from: https://devcli.heroku.com/install-windows
   ```

2. **Login and Create App:**
   ```bash
   heroku login
   cd c:\JFS-bookies\bookies-backend
   heroku create bookies-backend-prod
   ```

3. **Add MySQL Database:**
   ```bash
   heroku addons:create jawsdb:kitefin
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set FRONTEND_URL=https://free-shelf-buddy-37.vercel.app
   ```

5. **Deploy:**
   ```bash
   git push heroku master
   ```

---

### **PHASE 2: Configure Vercel Environment Variables**

Once your backend is deployed, configure Vercel:

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Select Your Project:**
   - Click on "free-shelf-buddy-37" (or your project name)

3. **Go to Settings:**
   - Click "Settings" tab
   - Select "Environment Variables"

4. **Add Environment Variable:**
   ```
   Name:  VITE_API_BASE_URL
   Value: https://your-backend-url.railway.app/api
          ↑ Replace with YOUR actual backend URL
   
   Environment: Production
   ```

5. **Click "Save"**

6. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

### **PHASE 3: Update Production Environment File**

Update your `.env.production` file with the actual backend URL:

```env
# Production Environment Variables
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
```

**Then commit and push:**

```bash
cd c:\JFS-bookies\frontend
git add .env.production
git commit -m "chore: Update production API URL"
git push origin main
```

---

## 🔍 **VERIFICATION CHECKLIST**

### **Backend Verification:**

```bash
# Test if backend is publicly accessible
curl https://your-backend-url.railway.app/api/books

# Test CORS (from your local machine)
curl -X OPTIONS https://your-backend-url.railway.app/api/auth/signin \
  -H "Origin: https://free-shelf-buddy-37.vercel.app" \
  -H "Access-Control-Request-Method: POST"
```

**Expected:** Should return 200 OK with CORS headers

### **Frontend Verification:**

1. **Open Vercel deployment:**
   ```
   https://free-shelf-buddy-37.vercel.app
   ```

2. **Open Browser DevTools:**
   - Press F12
   - Go to "Network" tab

3. **Try to login:**
   - Email: `librarian@library.com`
   - Password: `1234`

4. **Check Network Requests:**
   - Look for request to your backend URL (NOT localhost)
   - Status should be 200 OK
   - Response should contain user data and token

### **Database Verification:**

If using Railway MySQL:

```bash
# Connect to Railway MySQL
mysql -h <railway-host> -u <railway-user> -p<railway-password> bookies_db

# Check if tables exist
SHOW TABLES;

# Check if users exist
SELECT * FROM user;
```

---

## 🐛 **TROUBLESHOOTING GUIDE**

### **Problem 1: CORS Error in Browser Console**

**Error Message:**
```
Access to XMLHttpRequest at 'https://backend.com/api/auth/signin' 
from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

**Solution:**
1. Verify backend CORS configuration includes your Vercel domain
2. Check backend logs for CORS-related messages
3. Ensure `allowCredentials: true` is set in CORS config

**Fix in Backend:**
```java
// In CorsConfig.java (already updated)
config.setAllowedOriginPatterns(Arrays.asList(
    "https://*.vercel.app"  // This should match
));
```

---

### **Problem 2: 401 Unauthorized**

**Error Message:**
```
POST https://backend.com/api/auth/signin 401 (Unauthorized)
```

**Possible Causes:**
- Database not seeded with test users
- Password hashing mismatch
- Database connection issues

**Solution:**

1. **Check if database has users:**
   ```sql
   SELECT email, password, role FROM user;
   ```

2. **If no users, create test users:**
   ```sql
   INSERT INTO user (name, email, password, role, created_at, updated_at) 
   VALUES 
   ('Librarian', 'librarian@library.com', '1234', 'ADMIN', NOW(), NOW()),
   ('Test User', 'user@bookies.com', 'user123', 'USER', NOW(), NOW());
   ```

3. **Verify password in AuthController matches plain text** (since you're not using encryption yet)

---

### **Problem 3: Environment Variable Not Working**

**Error Message:**
```
GET http://localhost:8090/api/books (Failed to fetch)
```

**This means Vercel is still using localhost URL**

**Solution:**

1. **Verify environment variable is set in Vercel:**
   ```
   Vercel Dashboard → Settings → Environment Variables
   Check: VITE_API_BASE_URL is set
   ```

2. **Redeploy after adding environment variables:**
   - Environment variables only apply to NEW deployments
   - Must redeploy for changes to take effect

3. **Check variable name is correct:**
   - Vite requires `VITE_` prefix
   - Must be `VITE_API_BASE_URL` not `API_BASE_URL`

---

### **Problem 4: Backend Not Responding**

**Error Message:**
```
net::ERR_CONNECTION_REFUSED
or
net::ERR_CONNECTION_TIMED_OUT
```

**Solution:**

1. **Verify backend is running:**
   - Check Railway/Render dashboard
   - Look for "Running" status
   - Check build logs for errors

2. **Test backend directly:**
   ```bash
   curl https://your-backend-url.com/api/books
   ```

3. **Common deployment issues:**
   - Maven build failed (check logs)
   - Database connection failed
   - Port binding issues
   - Missing environment variables

---

### **Problem 5: Database Connection Failed**

**Error in Backend Logs:**
```
Communications link failure
The last packet sent successfully to the server was 0 milliseconds ago
```

**Solution:**

1. **Check database credentials:**
   ```bash
   # In Railway/Render dashboard
   DB_URL=jdbc:mysql://HOST:PORT/DATABASE
   DB_USERNAME=username
   DB_PASSWORD=password
   ```

2. **Verify database is running:**
   - Check Railway/Render database status
   - Ensure database is in same region as app (for better performance)

3. **Test database connection:**
   ```bash
   mysql -h <host> -P <port> -u <username> -p<password> bookies_db
   ```

4. **Check firewall/security groups:**
   - Database must allow connections from app server
   - Railway handles this automatically

---

## 📊 **DEPLOYMENT ARCHITECTURE**

```
┌─────────────────────┐
│                     │
│  Vercel Frontend    │  https://free-shelf-buddy-37.vercel.app
│  (React + Vite)     │
│                     │
└──────────┬──────────┘
           │
           │ HTTPS API Calls
           │ (CORS enabled)
           │
           ▼
┌─────────────────────┐
│                     │
│  Railway Backend    │  https://your-app.railway.app
│  (Spring Boot)      │
│                     │
└──────────┬──────────┘
           │
           │ JDBC Connection
           │ (Private network)
           │
           ▼
┌─────────────────────┐
│                     │
│  Railway MySQL      │  Internal host:port
│  (Database)         │
│                     │
└─────────────────────┘
```

---

## 🎯 **QUICK DEPLOYMENT CHECKLIST**

### **Before Deployment:**
- [x] ✅ Frontend API URL uses environment variable
- [x] ✅ Backend CORS accepts Vercel domains
- [x] ✅ Environment files created
- [ ] ⏳ Backend deployed to cloud platform
- [ ] ⏳ Database created and configured
- [ ] ⏳ Test users seeded in database

### **During Deployment:**
- [ ] Deploy backend to Railway/Render/Heroku
- [ ] Get backend public URL
- [ ] Set environment variables in cloud platform
- [ ] Verify backend is accessible
- [ ] Test API endpoints directly

### **After Deployment:**
- [ ] Set `VITE_API_BASE_URL` in Vercel
- [ ] Redeploy Vercel frontend
- [ ] Test login on Vercel deployment
- [ ] Verify CORS works
- [ ] Test all features (request books, admin actions)

---

## 🔐 **SECURITY RECOMMENDATIONS**

### **Production Checklist:**

1. **JWT Secret:**
   ```
   Use strong random secret (min 32 characters)
   Never commit to Git
   Set as environment variable
   ```

2. **Database Password:**
   ```
   Use strong password
   Never hardcode in code
   Use environment variables
   ```

3. **HTTPS Only:**
   ```
   All production traffic should use HTTPS
   Railway and Vercel provide this automatically
   ```

4. **CORS Configuration:**
   ```
   Only allow your specific Vercel domain
   Remove wildcard in production if possible
   ```

5. **Environment Variables:**
   ```
   Never commit .env files
   Add .env* to .gitignore (except .env.example)
   ```

---

## 📝 **COMMIT AND DEPLOY COMMANDS**

### **Step 1: Commit Changes**

```bash
cd c:\JFS-bookies

# Backend changes
cd bookies-backend
git add .
git commit -m "fix: Configure CORS for Vercel and add production environment support"
git push origin master

# Frontend changes  
cd ../frontend
git add .
git commit -m "fix: Use environment variables for API URL in production"
git push origin main
```

### **Step 2: Deploy Backend**

Choose one platform and follow their steps above:
- Railway (Recommended)
- Render
- Heroku

### **Step 3: Configure Vercel**

1. Add `VITE_API_BASE_URL` environment variable
2. Set value to your deployed backend URL
3. Redeploy

---

## 📞 **NEED HELP?**

### **Check These Resources:**

1. **Railway Documentation:**
   ```
   https://docs.railway.app/deploy/deployments
   ```

2. **Render Documentation:**
   ```
   https://render.com/docs/deploy-spring-boot
   ```

3. **Vercel Environment Variables:**
   ```
   https://vercel.com/docs/concepts/projects/environment-variables
   ```

4. **Spring Boot on Railway:**
   ```
   https://docs.railway.app/guides/spring-boot
   ```

---

## ✅ **FINAL VERIFICATION**

Once everything is deployed:

1. **Open Vercel deployment**
2. **Open DevTools (F12) → Network tab**
3. **Login with:**
   ```
   Admin: librarian@library.com / 1234
   User:  user@bookies.com / user123
   ```
4. **Verify:**
   - ✅ API calls go to production backend (not localhost)
   - ✅ Status code is 200 OK
   - ✅ Token is received and stored
   - ✅ User is redirected to dashboard
   - ✅ Books load correctly
   - ✅ Admin can see "Change Image" button
   - ✅ User cannot see "Change Image" button

**If all checks pass: 🎉 DEPLOYMENT SUCCESSFUL!**

---

## 🎉 **SUCCESS CRITERIA**

Your deployment is complete when:

- ✅ Backend is publicly accessible via HTTPS
- ✅ Frontend makes API calls to production backend
- ✅ Login works on Vercel deployment
- ✅ CORS allows requests from Vercel
- ✅ Database is connected and populated
- ✅ All features work as expected
- ✅ Admin-only image upload works correctly

---

**Last Updated:** October 20, 2025  
**Status:** Code fixes complete, awaiting backend deployment  
**Next Step:** Deploy backend to Railway (recommended)
