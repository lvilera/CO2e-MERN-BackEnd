# ✅ Vercel Production Setup Checklist

**Your URLs:**
- Backend: https://co-2e-mern-back-end.vercel.app
- Frontend: https://co2eportal.com

---

## 📋 Setup Checklist

### 🗄️ MongoDB Atlas

- [ ] **1.1** Go to https://cloud.mongodb.com
- [ ] **1.2** Click on your cluster → **Network Access**
- [ ] **1.3** Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
- [ ] **1.4** Verify database user exists with **read/write** permissions
- [ ] **1.5** Get connection string (Connect → Connect your application)
- [ ] **1.6** Replace `<password>` and set database to `co2e-portal`

**Connection string format:**
```
mongodb+srv://username:password@cluster.mongodb.net/co2e-portal?retryWrites=true&w=majority
```

---

### 🔧 Backend Environment Variables (Vercel)

Go to: https://vercel.com → **co-2e-mern-back-end** → Settings → Environment Variables

- [ ] **2.1** `MONGODB_URI` = Your Atlas connection string
- [ ] **2.2** `NODE_ENV` = `production`
- [ ] **2.3** `PORT` = `5001`
- [ ] **2.4** `FRONTEND_URL` = `https://co2eportal.com`
- [ ] **2.5** `FRONTEND_SUCCESS_URL` = `https://co2eportal.com/success`
- [ ] **2.6** `FRONTEND_CANCEL_URL` = `https://co2eportal.com/cancel`
- [ ] **2.7** `FRONTEND_RESET_PASSWORD_URL` = `https://co2eportal.com/reset-password`
- [ ] **2.8** `JWT_SECRET` = Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] **2.9** `STRIPE_SECRET_KEY` = Your Stripe key (test or live)
- [ ] **2.10** `STRIPE_PUBLISHABLE_KEY` = Your Stripe publishable key
- [ ] **2.11** `CLOUDINARY_CLOUD_NAME` = `dftnqqcjz`
- [ ] **2.12** `CLOUDINARY_API_KEY` = `419724397335875`
- [ ] **2.13** `CLOUDINARY_API_SECRET` = `Q7usOM7s5EsyeubXFzy5fQ1I_7A`
- [ ] **2.14** `EMAIL_USER` = Your Gmail address
- [ ] **2.15** `EMAIL_PASS` = Your Gmail App Password

**Important:** Select **Production**, **Preview**, and **Development** for all variables!

---

### 🌐 Frontend Environment Variables (Vercel)

Go to: https://vercel.com → Your Frontend Project → Settings → Environment Variables

- [ ] **3.1** `REACT_APP_API_URL` = `https://co-2e-mern-back-end.vercel.app`

  *OR if using Next.js:*
- [ ] **3.2** `NEXT_PUBLIC_API_URL` = `https://co-2e-mern-back-end.vercel.app`

**Check which one your frontend uses!**

---

### 🔄 Redeploy

- [ ] **4.1** Backend: Go to Deployments → Click ⋯ → Redeploy (Uncheck "Use existing Build Cache")
- [ ] **4.2** Wait for backend deployment to complete (Status: Ready ✅)
- [ ] **4.3** Frontend: Go to Deployments → Click ⋯ → Redeploy (Uncheck cache)
- [ ] **4.4** Wait for frontend deployment to complete (Status: Ready ✅)

---

### 🧪 Testing

#### Backend API Tests

- [ ] **5.1** Open: https://co-2e-mern-back-end.vercel.app/api/directory
  - Should return: `[]` or array of listings

- [ ] **5.2** Open: https://co-2e-mern-back-end.vercel.app/api/directory/categories
  - Should return: Array of categories

- [ ] **5.3** Test admin login:
  ```bash
  curl -X POST https://co-2e-mern-back-end.vercel.app/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@admin.com","password":"admin123"}'
  ```
  - Should return: JSON with token

#### Frontend Tests

- [ ] **5.4** Open: https://co2eportal.com
  - Page loads without errors

- [ ] **5.5** Open Browser DevTools (F12) → Console
  - No CORS errors
  - No 404 errors to backend

- [ ] **5.6** Check Network tab
  - API calls go to: `co-2e-mern-back-end.vercel.app`
  - Requests return 200 status

#### MongoDB Atlas Check

- [ ] **5.7** Go to MongoDB Atlas → Metrics
  - See active connections
  - See operations

---

### 🔍 Check Function Logs (If Issues)

- [ ] **6.1** Backend: Vercel → Deployments → Click deployment → Functions → View Logs
  - Look for: "✅ Connected to MongoDB successfully!"
  - Look for: "🚀 Server is running on port 5001"
  - Check for errors

- [ ] **6.2** Frontend: Vercel → Deployments → Click deployment → Build Logs
  - Check for build errors
  - Verify environment variables are picked up

---

## 🎯 Quick Tests (Copy & Paste)

```bash
# Set your backend URL
export API="https://co-2e-mern-back-end.vercel.app"

# Test endpoints
curl $API/api/directory
curl $API/api/directory/categories
curl $API/api/news
curl $API/api/blogs

# Test admin login
curl -X POST $API/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'
```

---

## 🐛 Common Issues

### MongoDB Connection Failed
- [ ] Whitelisted 0.0.0.0/0 in Network Access?
- [ ] Connection string has correct password?
- [ ] Database name is `co2e-portal`?
- [ ] `MONGODB_URI` set in Vercel?

### CORS Errors
- [ ] `FRONTEND_URL` = `https://co2eportal.com` (no trailing slash)?
- [ ] Backend redeployed after adding env variables?
- [ ] Check backend CORS config in api/index.js

### 502 Bad Gateway
- [ ] MongoDB Atlas cluster is running (not paused)?
- [ ] Check Vercel function logs for errors
- [ ] Try redeploying backend

### Frontend Can't Call Backend
- [ ] Frontend has `REACT_APP_API_URL` or `NEXT_PUBLIC_API_URL`?
- [ ] URL is correct: `https://co-2e-mern-back-end.vercel.app`?
- [ ] Frontend redeployed after adding env variable?

---

## ✅ Success Criteria

You're all set when:

- ✅ Backend API returns data (test endpoints in browser)
- ✅ Frontend loads without errors
- ✅ No CORS errors in browser console
- ✅ MongoDB Atlas shows active connections
- ✅ Admin login works
- ✅ You can submit directory listings
- ✅ Vercel function logs show successful MongoDB connection

---

## 🚀 After Setup

To deploy changes in the future:

```bash
# 1. Make changes locally
# 2. Commit
git add .
git commit -m "Your changes"

# 3. Push
git push origin main

# 4. Vercel auto-deploys (1-2 minutes)
# 5. Refresh: https://co2eportal.com
```

---

**Need help?** Check PRODUCTION_CONFIG.md for detailed instructions!
