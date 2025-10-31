# 🎯 Step-by-Step Setup Guide for Production

Follow these steps in order. Don't skip ahead!

---

## ✅ STEP 1: MongoDB Atlas Setup

### 1.1 Access MongoDB Atlas

1. Go to: **https://cloud.mongodb.com**
2. Log in with your account
3. You should see your cluster dashboard

**Screenshot what you see:** Is there a cluster shown? What's its name?

---

### 1.2 Whitelist All IP Addresses (Critical!)

1. Click **"Network Access"** in the left sidebar
2. Click the green **"ADD IP ADDRESS"** button
3. A popup appears - click **"ALLOW ACCESS FROM ANYWHERE"**
4. You'll see `0.0.0.0/0` appear
5. Click **"Confirm"**

**Why?** Vercel servers use dynamic IP addresses, so we need to allow all IPs.

**Verify:** You should see an entry with `0.0.0.0/0` in the IP Access List.

---

### 1.3 Get Your Connection String

1. Click **"Database"** in the left sidebar
2. Find your cluster and click the **"Connect"** button
3. Choose **"Connect your application"**
4. Make sure **"Node.js"** is selected as the driver
5. You'll see a connection string like:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. Click the **"Copy"** button

---

### 1.4 Modify Your Connection String

Take the copied string and modify it:

**Original:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Replace:**
- `<username>` with your actual MongoDB username
- `<password>` with your actual MongoDB password
- Add `/co2e-portal` before the `?` (this is your database name)

**Final format should be:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/co2e-portal?retryWrites=true&w=majority
```

**Save this string!** You'll need it in Step 2.

---

### 1.5 Verify Database User

1. Click **"Database Access"** in the left sidebar
2. You should see at least one user listed
3. Check that the user has **"Read and write to any database"** privilege

**If no user exists:**
1. Click **"ADD NEW DATABASE USER"**
2. Choose **"Password"** authentication
3. Enter a username (e.g., `co2e-admin`)
4. Click **"Autogenerate Secure Password"** (save this!)
5. Under privileges, select **"Read and write to any database"**
6. Click **"Add User"**

---

## ✅ STEP 2: Backend Environment Variables (Vercel)

### 2.1 Go to Vercel Dashboard

1. Go to: **https://vercel.com/dashboard**
2. Find and click on your project: **co-2e-mern-back-end**
3. Click **"Settings"** (top tab)
4. Click **"Environment Variables"** in the left sidebar

---

### 2.2 Add MONGODB_URI

1. Click **"Add New"** button
2. In **"Key"** field, type: `MONGODB_URI`
3. In **"Value"** field, paste your connection string from Step 1.4
4. **Check ALL THREE boxes:** Production ✅ Preview ✅ Development ✅
5. Click **"Save"**

**Your connection string should look like:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/co2e-portal?retryWrites=true&w=majority
```

---

### 2.3 Generate JWT Secret

Open a terminal and run this command:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output** (it will look like: `8f7d6e5c4b3a2918f7d6e5c4b3a29...`)

---

### 2.4 Add JWT_SECRET

1. Click **"Add New"** button again
2. **Key:** `JWT_SECRET`
3. **Value:** Paste the random string you just generated
4. **Check ALL THREE boxes:** Production ✅ Preview ✅ Development ✅
5. Click **"Save"**

---

### 2.5 Add Frontend URL

1. Click **"Add New"**
2. **Key:** `FRONTEND_URL`
3. **Value:** `https://co2eportal.com`
4. **Check all boxes** ✅ ✅ ✅
5. Click **"Save"**

---

### 2.6 Add NODE_ENV

1. Click **"Add New"**
2. **Key:** `NODE_ENV`
3. **Value:** `production`
4. **Check all boxes** ✅ ✅ ✅
5. Click **"Save"**

---

### 2.7 Add All Remaining Variables

Add these one by one (click "Add New" for each):

| Key | Value | Boxes to Check |
|-----|-------|----------------|
| `PORT` | `5001` | All three ✅ |
| `FRONTEND_SUCCESS_URL` | `https://co2eportal.com/success` | All three ✅ |
| `FRONTEND_CANCEL_URL` | `https://co2eportal.com/cancel` | All three ✅ |
| `FRONTEND_RESET_PASSWORD_URL` | `https://co2eportal.com/reset-password` | All three ✅ |
| `STRIPE_SECRET_KEY` | `sk_test_51Rj1BHBwwMNNzzzsjwDBeLycAGXndWqDaOM3izFSPAOP8xf7eXBmvGpunL90DhyZCvVaXvHvfgApufjRxt3GliV5008cNT31Nn` | All three ✅ |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_51Rj1dnBOoulucdCvghV3vwtwYiAgrFek2IsnGS9WH0Sd1IQR3qdU0zGnpbWevLioQT3tKeOm4ifQBEQUxpMzrnm700Zw6YCpDl` | All three ✅ |
| `CLOUDINARY_CLOUD_NAME` | `dftnqqcjz` | All three ✅ |
| `CLOUDINARY_API_KEY` | `419724397335875` | All three ✅ |
| `CLOUDINARY_API_SECRET` | `Q7usOM7s5EsyeubXFzy5fQ1I_7A` | All three ✅ |
| `EMAIL_USER` | `aryanarshad5413@gmail.com` | All three ✅ |
| `EMAIL_PASS` | `gvyqmapsqsrrtwjm` | All three ✅ |

**After adding all variables, you should have 15 environment variables total.**

---

## ✅ STEP 3: Frontend Environment Variables (Vercel)

### 3.1 Go to Frontend Project

1. Stay in Vercel dashboard
2. Click **"View All Projects"** (top left)
3. Find and click your **frontend project** (the one for co2eportal.com)
4. Click **"Settings"** → **"Environment Variables"**

---

### 3.2 Add API URL

**First, check if your frontend uses React or Next.js:**
- If it's **Create React App**: Use `REACT_APP_API_URL`
- If it's **Next.js**: Use `NEXT_PUBLIC_API_URL`

**Let's add both to be safe:**

1. Click **"Add New"**
2. **Key:** `REACT_APP_API_URL`
3. **Value:** `https://co-2e-mern-back-end.vercel.app`
4. **Check all boxes** ✅ ✅ ✅
5. Click **"Save"**

6. Click **"Add New"** again
7. **Key:** `NEXT_PUBLIC_API_URL`
8. **Value:** `https://co-2e-mern-back-end.vercel.app`
9. **Check all boxes** ✅ ✅ ✅
10. Click **"Save"**

---

## ✅ STEP 4: Redeploy Backend

### 4.1 Trigger Backend Redeploy

1. Go back to **co-2e-mern-back-end** project in Vercel
2. Click **"Deployments"** tab
3. Find the most recent deployment (top of the list)
4. Click the **⋯** (three dots menu) on the right
5. Click **"Redeploy"**
6. A popup appears - **UNCHECK** the box that says "Use existing Build Cache"
7. Click **"Redeploy"**

---

### 4.2 Watch the Deployment

1. You'll see status: **"Building..."**
2. Click on the deployment to see logs in real-time
3. Look for these success messages:
   - `✅ Connected to MongoDB successfully!`
   - `🚀 Server is running on port 5001`
4. Wait until status shows: **"Ready"** ✅

**If deployment fails:**
- Click on the failed deployment
- Check the **"Function Logs"** tab
- Look for error messages
- Common issues:
  - Wrong MongoDB connection string
  - MongoDB Atlas not whitelisting 0.0.0.0/0
  - Missing environment variables

---

## ✅ STEP 5: Redeploy Frontend

### 5.1 Trigger Frontend Redeploy

1. Go to your **frontend project** in Vercel
2. Click **"Deployments"** tab
3. Click **⋯** on the latest deployment
4. Click **"Redeploy"**
5. **UNCHECK** "Use existing Build Cache"
6. Click **"Redeploy"**

---

### 5.2 Wait for Completion

1. Watch for status: **"Building..."** → **"Ready"** ✅
2. This usually takes 1-3 minutes

---

## ✅ STEP 6: Test Your Setup

### 6.1 Test Backend API

Open these URLs in your browser (one at a time):

**Test 1:** https://co-2e-mern-back-end.vercel.app/api/directory
- **Expected:** `[]` or array of data
- **If error:** Check Step 4.2 for deployment logs

**Test 2:** https://co-2e-mern-back-end.vercel.app/api/directory/categories
- **Expected:** Array like `["Broker", "Exchange", "Project"]`
- **If empty:** Database is empty (normal for new setup)

**Test 3:** https://co-2e-mern-back-end.vercel.app/api/news
- **Expected:** Array of news articles or `[]`

**Test 4:** https://co-2e-mern-back-end.vercel.app/api/blogs
- **Expected:** Array of blogs or `[]`

---

### 6.2 Test Frontend

1. Open: **https://co2eportal.com**
2. Page should load normally
3. Press **F12** to open DevTools
4. Click **"Console"** tab
5. Look for any red error messages

**Good signs:**
- ✅ No CORS errors
- ✅ No 404 errors
- ✅ API calls to `co-2e-mern-back-end.vercel.app` succeed

**Bad signs:**
- ❌ CORS error → Check `FRONTEND_URL` in backend env vars
- ❌ 404 to backend → Check `REACT_APP_API_URL` in frontend env vars

---

### 6.3 Test Admin Login (Advanced)

Open terminal and run:

```bash
curl -X POST https://co-2e-mern-back-end.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'
```

**Expected response:**
```json
{
  "message": "Admin login successful",
  "package": "admin",
  "userId": "admin",
  "token": "eyJhbGc...",
  "role": "admin"
}
```

**If this works, your backend is fully functional!** ✅

---

## 🎉 Success Checklist

Your setup is complete when:

- [ ] MongoDB Atlas shows active connections (Metrics tab)
- [ ] Backend API endpoints return data (or empty arrays)
- [ ] Frontend loads without errors in console
- [ ] No CORS errors in browser DevTools
- [ ] Admin login test returns a JWT token
- [ ] Vercel deployments show "Ready" status
- [ ] All environment variables are set (15 in backend, 2 in frontend)

---

## 🆘 Troubleshooting

### Issue: "MongoDB connection failed" in Vercel logs

**Fix:**
1. Double-check connection string format
2. Verify password has no special characters (or is URL-encoded)
3. Check MongoDB Atlas Network Access has 0.0.0.0/0
4. Verify database user exists with read/write permissions

### Issue: CORS error in browser console

**Fix:**
1. Check `FRONTEND_URL` in backend = `https://co2eportal.com`
2. Redeploy backend (Step 4)
3. Clear browser cache

### Issue: Frontend shows "Network Error"

**Fix:**
1. Check `REACT_APP_API_URL` in frontend env vars
2. Make sure it's `https://co-2e-mern-back-end.vercel.app`
3. Redeploy frontend (Step 5)

### Issue: 502 Bad Gateway

**Fix:**
1. Check Vercel function logs for errors
2. Verify MongoDB Atlas cluster is running (not paused)
3. Try redeploying backend

---

## 📞 Need More Help?

If you're stuck on a specific step:

1. **Take a screenshot** of what you see
2. **Copy any error messages** from Vercel logs or browser console
3. **Note which step** you're on (e.g., "Step 2.2 - Adding MONGODB_URI")
4. **Ask for help** with those specific details

---

## 🚀 What's Next?

After successful setup:

1. **Add content** to your database (via admin panel)
2. **Test all features** on your live site
3. **Make changes** to code locally
4. **Push to GitHub** → Vercel auto-deploys
5. **Refresh** https://co2eportal.com to see changes

**Deployment is now automatic!** Every git push triggers a new deployment.

---

**Start with STEP 1** and work your way through. Take your time on each step!
