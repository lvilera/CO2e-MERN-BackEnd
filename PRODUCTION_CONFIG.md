# 🚀 Production Configuration for CO2e Portal

## Your Deployment URLs

- **Backend API:** https://co-2e-mern-back-end.vercel.app
- **Frontend:** https://co2eportal.com
- **Database:** MongoDB Atlas

---

## 🔧 Step 1: Configure Backend Environment Variables on Vercel

### Go to Backend Project on Vercel:
1. Visit: https://vercel.com/dashboard
2. Select project: **co-2e-mern-back-end**
3. Go to: **Settings** → **Environment Variables**

### Add These Exact Environment Variables:

```env
# =============================================================================
# DATABASE
# =============================================================================
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/co2e-portal?retryWrites=true&w=majority

# IMPORTANT: Replace YOUR_USERNAME, YOUR_PASSWORD, and YOUR_CLUSTER with actual values
# Get from: MongoDB Atlas → Connect → Connect your application


# =============================================================================
# SERVER
# =============================================================================
NODE_ENV=production
PORT=5001


# =============================================================================
# FRONTEND URLS (Exact - for CORS)
# =============================================================================
FRONTEND_URL=https://co2eportal.com
FRONTEND_SUCCESS_URL=https://co2eportal.com/success
FRONTEND_CANCEL_URL=https://co2eportal.com/cancel
FRONTEND_RESET_PASSWORD_URL=https://co2eportal.com/reset-password


# =============================================================================
# JWT SECRET (Generate a new one for production!)
# =============================================================================
JWT_SECRET=generate_a_secure_random_string_here

# Generate with this command:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Example result: 8f7d6e5c4b3a2918f7d6e5c4b3a2918f7d6e5c4b3a2918f7d6e5c4b3a291


# =============================================================================
# STRIPE (Payment Processing)
# =============================================================================
# For testing, use test keys:
STRIPE_SECRET_KEY=sk_test_51Rj1BHBwwMNNzzzsjwDBeLycAGXndWqDaOM3izFSPAOP8xf7eXBmvGpunL90DhyZCvVaXvHvfgApufjRxt3GliV5008cNT31Nn
STRIPE_PUBLISHABLE_KEY=pk_test_51Rj1dnBOoulucdCvghV3vwtwYiAgrFek2IsnGS9WH0Sd1IQR3qdU0zGnpbWevLioQT3tKeOm4ifQBEQUxpMzrnm700Zw6YCpDl

# For production, use live keys (get from: https://dashboard.stripe.com/apikeys)
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_PUBLISHABLE_KEY=pk_live_...


# =============================================================================
# CLOUDINARY (Image Hosting)
# =============================================================================
CLOUDINARY_CLOUD_NAME=dftnqqcjz
CLOUDINARY_API_KEY=419724397335875
CLOUDINARY_API_SECRET=Q7usOM7s5EsyeubXFzy5fQ1I_7A

# For your own Cloudinary account (optional):
# Sign up at: https://cloudinary.com/
# Get credentials from dashboard


# =============================================================================
# EMAIL (Gmail - for password reset)
# =============================================================================
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# How to get Gmail App Password:
# 1. Go to: https://myaccount.google.com/apppasswords
# 2. Select "Mail" and your device
# 3. Click "Generate"
# 4. Use the 16-character password here
```

---

## 🔧 Step 2: Configure Frontend Environment Variables on Vercel

### Go to Frontend Project on Vercel:
1. Visit: https://vercel.com/dashboard
2. Select your **frontend project** (co2eportal.com)
3. Go to: **Settings** → **Environment Variables**

### Add This Environment Variable:

```env
# Backend API URL
REACT_APP_API_URL=https://co-2e-mern-back-end.vercel.app

# If using Next.js, also add:
NEXT_PUBLIC_API_URL=https://co-2e-mern-back-end.vercel.app
```

**Important:**
- Check your frontend code to see which prefix it uses (`REACT_APP_` or `NEXT_PUBLIC_`)
- Add the correct one based on your framework

---

## 🗄️ Step 3: Configure MongoDB Atlas

### Network Access (Critical!)

1. Go to: https://cloud.mongodb.com
2. Navigate to: **Network Access** (left sidebar)
3. Click: **Add IP Address**
4. Select: **Allow Access from Anywhere**
   - This adds `0.0.0.0/0` to whitelist
   - Required for Vercel (dynamic IPs)
5. Click: **Confirm**

### Database Access

1. Go to: **Database Access** (left sidebar)
2. Verify your database user exists
3. Ensure it has: **"Read and write to any database"** privileges
4. Note down: Username and Password

### Get Connection String

1. Go to: **Database** → **Connect**
2. Choose: **Connect your application**
3. Driver: **Node.js**
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `myFirstDatabase` with `co2e-portal`

**Your connection string should look like:**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/co2e-portal?retryWrites=true&w=majority
```

---

## 🔄 Step 4: Redeploy Both Projects

### Backend Redeploy:

1. Go to: https://vercel.com/dashboard
2. Select: **co-2e-mern-back-end**
3. Go to: **Deployments** tab
4. Click: **⋯** (three dots) on latest deployment
5. Click: **Redeploy**
6. **Uncheck**: "Use existing Build Cache"
7. Click: **Redeploy**
8. Wait for: **Building...** → **Ready** ✅

### Frontend Redeploy:

1. Select your **frontend project**
2. Go to: **Deployments** tab
3. Click: **⋯** (three dots) on latest deployment
4. Click: **Redeploy**
5. **Uncheck**: "Use existing Build Cache"
6. Click: **Redeploy**
7. Wait for: **Building...** → **Ready** ✅

---

## ✅ Step 5: Test Your Deployment

### Test Backend API:

Open these URLs in your browser:

1. **Health Check:**
   ```
   https://co-2e-mern-back-end.vercel.app/api/directory
   ```
   Should return: `[]` or array of listings

2. **Categories:**
   ```
   https://co-2e-mern-back-end.vercel.app/api/directory/categories
   ```
   Should return: Array of industry categories

3. **News:**
   ```
   https://co-2e-mern-back-end.vercel.app/api/news
   ```
   Should return: Array of news articles

4. **Blogs:**
   ```
   https://co-2e-mern-back-end.vercel.app/api/blogs
   ```
   Should return: Array of blog posts

### Test with cURL:

```bash
# Admin Login
curl -X POST https://co-2e-mern-back-end.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'

# Get Directory Listings
curl https://co-2e-mern-back-end.vercel.app/api/directory

# Get Categories
curl https://co-2e-mern-back-end.vercel.app/api/directory/categories
```

### Test Frontend:

1. Visit: **https://co2eportal.com**
2. Open browser DevTools (F12)
3. Go to: **Console** tab
4. Check for errors (should be none)
5. Go to: **Network** tab
6. Refresh page
7. Look for API calls to: `co-2e-mern-back-end.vercel.app`
8. Verify they return 200 status

---

## 🐛 Troubleshooting

### Issue 1: "MongoDB connection failed"

**Check in Vercel Function Logs:**

1. Go to: Backend project → **Deployments**
2. Click latest deployment
3. Click: **Functions** tab
4. Click: `/api/index`
5. Look for error messages

**Common Fixes:**

✅ **Check MongoDB Atlas:**
- Network Access → 0.0.0.0/0 whitelisted?
- Database Access → User has read/write permissions?
- Connection string has correct password?

✅ **Check Vercel Environment Variables:**
- `MONGODB_URI` is set?
- No typos in connection string?
- Applied to "Production" environment?

### Issue 2: "CORS Error" in Browser Console

**Error message:**
```
Access to XMLHttpRequest at 'https://co-2e-mern-back-end.vercel.app/api/...'
from origin 'https://co2eportal.com' has been blocked by CORS policy
```

**Fix:**

The backend code already includes CORS configuration, but verify:

1. Check `FRONTEND_URL` in backend environment variables
2. Should be: `https://co2eportal.com` (no trailing slash)
3. Redeploy backend after adding/updating

**Current CORS config in your code allows:**
- `https://co2e.vercel.app`
- `https://www.co2eportal.com`
- All `.vercel.app` domains

So `co2eportal.com` should already work!

### Issue 3: "502 Bad Gateway" or Function Timeout

**Check:**
1. MongoDB Atlas is running (not paused)
2. Connection string is correct
3. Function timeout limit (default 10s on free plan)

**Increase timeout in vercel.json:**
```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

### Issue 4: Frontend Can't Reach Backend

**Check frontend environment variable:**

1. Go to: Frontend project → **Settings** → **Environment Variables**
2. Verify: `REACT_APP_API_URL=https://co-2e-mern-back-end.vercel.app`
3. Check: Applied to "Production"?
4. If changed: Redeploy frontend

**Check in Frontend Code:**

Look for API calls like:
```javascript
axios.get(`${process.env.REACT_APP_API_URL}/api/directory`)
// or
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/directory`)
```

---

## 📊 Monitor Your Deployments

### Real-time Monitoring:

**Backend Logs:**
```
https://vercel.com/[your-username]/co-2e-mern-back-end/deployments
→ Click deployment → Functions → View Logs
```

**Frontend Logs:**
```
https://vercel.com/[your-username]/[frontend-project]/deployments
→ Click deployment → Build Logs
```

### MongoDB Atlas Monitoring:

1. Go to: https://cloud.mongodb.com
2. Select your cluster
3. Click: **Metrics** tab
4. View: Connections, Operations, Network

---

## 🎯 Quick Command Reference

### Generate Secure JWT Secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Backend Endpoints:

```bash
# Set your backend URL
export API="https://co-2e-mern-back-end.vercel.app"

# Test various endpoints
curl $API/api/directory
curl $API/api/directory/categories
curl $API/api/directory/cities
curl $API/api/news
curl $API/api/blogs
curl $API/api/courses
curl $API/api/products

# Admin login
curl -X POST $API/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'
```

---

## 🚀 Deploy Changes Workflow

### When You Make Changes:

```bash
# 1. Make changes to code
# Edit files in /routes, /models, etc.

# 2. Commit changes
git add .
git commit -m "Description of changes"

# 3. Push to GitHub
git push origin main

# 4. Vercel automatically deploys!
# Watch at: https://vercel.com/dashboard

# 5. Wait 1-2 minutes

# 6. Refresh your website
# https://co2eportal.com
```

### Check Deployment Status:

- ✅ Green checkmark = Deployed successfully
- 🔄 Building... = In progress
- ❌ Red X = Failed (check logs)

---

## 📋 Checklist: Complete Setup

- [ ] MongoDB Atlas: Network Access allows 0.0.0.0/0
- [ ] MongoDB Atlas: Database user has read/write permissions
- [ ] MongoDB Atlas: Got connection string
- [ ] Backend Vercel: Added `MONGODB_URI`
- [ ] Backend Vercel: Added `FRONTEND_URL=https://co2eportal.com`
- [ ] Backend Vercel: Added `JWT_SECRET` (generated securely)
- [ ] Backend Vercel: Added all other env variables
- [ ] Backend Vercel: Redeployed without cache
- [ ] Frontend Vercel: Added `REACT_APP_API_URL=https://co-2e-mern-back-end.vercel.app`
- [ ] Frontend Vercel: Redeployed without cache
- [ ] Tested: Backend API endpoints return data
- [ ] Tested: Frontend loads without errors
- [ ] Tested: Frontend can call backend APIs
- [ ] Tested: Admin login works
- [ ] Checked: No CORS errors in browser console

---

## 🎉 Summary

Your exact configuration:

**Backend:** `https://co-2e-mern-back-end.vercel.app`
- Environment variables configured
- Connected to MongoDB Atlas
- CORS allows your frontend domain

**Frontend:** `https://co2eportal.com`
- Points to your backend API
- No CORS issues

**Database:** MongoDB Atlas
- Whitelisted all IPs (0.0.0.0/0)
- User has proper permissions

**To see changes live:**
1. Make code changes locally
2. Push to GitHub: `git push origin main`
3. Vercel auto-deploys (1-2 min)
4. Refresh: https://co2eportal.com

---

**Need help?**
- Check function logs in Vercel dashboard
- Check MongoDB Atlas metrics
- Test backend endpoints directly in browser
- Check browser console for frontend errors

Let me know if you need help with any of these steps!
