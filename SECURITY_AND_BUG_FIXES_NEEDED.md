# Security and Bug Fixes Needed

**Date:** November 9, 2025
**Review of commits:** November 3-4, 2025
**Status:** Documentation only - no changes made to codebase

---

## 🚨 CRITICAL ISSUES (Fix Immediately)

### 1. Inverted Cookie Security Settings
**Files:** `routes/auth.js:77-78, 127-128`
**Severity:** CRITICAL 🔴
**Impact:** Authentication cookies are insecure in production

#### Problem:
The cookie security settings were changed from `production` to `development`, which is backwards:

```javascript
// CURRENT (WRONG):
res.cookie('token', adminToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'development',  // ❌ BACKWARDS
  sameSite: process.env.NODE_ENV === 'development' ? 'None' : 'Lax',  // ❌ BACKWARDS
  maxAge: 2 * 24 * 60 * 60 * 1000
});
```

#### Fix:
```javascript
// CORRECT:
res.cookie('token', adminToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  // ✅ HTTPS in production
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',  // ✅ Correct
  maxAge: 2 * 24 * 60 * 60 * 1000
});
```

#### Security Impact:
- Cookies will NOT be HTTPS-only in production
- Vulnerable to man-in-the-middle attacks
- Session tokens can be intercepted over HTTP
- Easy session hijacking

#### Affected Lines:
- Line 77-78: Admin login
- Line 127-128: User login
- Note: Instructor login (lines 214-215) is still correct

---

### 2. Broken Stripe Customer Creation
**Files:** `routes/stripe.js:66-67` + `services/stripeService.js:49-57`
**Severity:** HIGH 🔴
**Impact:** Database will store customer objects instead of customer IDs

#### Problem:
The `createCustomer` function was refactored to return the full customer object, but the calling code wasn't updated:

```javascript
// services/stripeService.js:49-57 (CHANGED)
async function createCustomer(name, email, opts = {}) {
  const params = { name, email };
  const requestOptions = {};
  if (opts.idempotencyKey) requestOptions.idempotencyKey = opts.idempotencyKey;

  const customer = await stripe.customers.create(params, requestOptions);
  return customer; // ⚠️ Now returns FULL OBJECT, not just customer.id
}

// routes/stripe.js:66-67 (NOT UPDATED)
stripeCustomerId = await stripeService.createCustomer(name, user.email);
// ❌ This now contains the full object: { id: "cus_123", object: "customer", ... }
await userService.updateUser(userId, { stripeCustomerId });
// ❌ Saves entire object to database instead of just the ID
```

#### Fix:
```javascript
// routes/stripe.js:66-68
const customer = await stripeService.createCustomer(name, user.email);
stripeCustomerId = customer.id;  // ✅ Extract the ID
await userService.updateUser(userId, { stripeCustomerId });
```

#### Data Migration Needed:
```javascript
// You may need to fix existing corrupted user records
// Run this query to check:
db.users.find({
  stripeCustomerId: { $type: "object" }
}).forEach(user => {
  if (user.stripeCustomerId && user.stripeCustomerId.id) {
    db.users.updateOne(
      { _id: user._id },
      { $set: { stripeCustomerId: user.stripeCustomerId.id } }
    );
  }
});
```

---

## 🟡 HIGH PRIORITY ISSUES

### 3. Route Import Mismatch
**File:** `api/index.js:25 vs :30`
**Severity:** MEDIUM 🟡
**Impact:** Potential runtime errors

#### Problem:
```javascript
// Line 25: imports from 'audits'
const auditRoutes = require('../routes/audits');

// Line 30: tries to destructure from 'auditRoutes'
({ pickAuditFields } = require('../routes/auditRoutes'));
```

#### Verify which file exists:
```bash
ls -la routes/audit*
```

#### Fix (option 1 - if file is auditRoutes.js):
```javascript
// Line 25
const auditRoutes = require('../routes/auditRoutes');  // ✅ Match actual filename
```

#### Fix (option 2 - if file is audits.js):
```javascript
// Line 30
({ pickAuditFields } = require('../routes/audits'));  // ✅ Match actual filename
```

---

### 4. Missing Space in Name Concatenation
**File:** `routes/stripe.js:65`
**Severity:** LOW 🟡
**Impact:** Customer names in Stripe will be "FirstNameLastName" instead of "FirstName LastName"

#### Problem:
```javascript
const name = user.firstName + '' + user.lastName  // ❌ No space
// Results in: "JohnDoe"
```

#### Fix:
```javascript
const name = user.firstName + ' ' + user.lastName  // ✅ Add space
// Results in: "John Doe"
```

---

## 🔒 SECURITY CONCERNS

### 5. Hardcoded Admin Credentials
**File:** `routes/auth.js:68`
**Severity:** CRITICAL 🔴

```javascript
// ❌ REMOVE THIS:
if (email === 'admin@admin.com' && password === 'admin123') {
  // ...
}
```

**Recommendation:** Remove hardcoded admin or use environment variables:
```javascript
if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
  // ...
}
```

---

### 6. Hardcoded JWT Secret
**File:** `routes/auth.js:13`
**Severity:** CRITICAL 🔴

```javascript
// ❌ CURRENT:
const JWT_SECRET = 'this_is_a_secure_jwt_secret_123456';

// ✅ FIX:
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

**Note:** JWT_SECRET is already in `.env` file (line 14), just not being used!

---

### 7. Hardcoded Email Credentials
**File:** `routes/auth.js:330-331`
**Severity:** CRITICAL 🔴

```javascript
// ❌ CURRENT:
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aryanarshad5413@gmail.com',
    pass: 'gvyqmapsqsrrtwjm',
  },
});

// ✅ FIX:
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

**Note:** These values already exist in `.env` file (lines 17-18), just not being used!

---

### 8. .ENV File Was Exposed in Git History
**Severity:** CRITICAL 🔴
**Status:** Partially fixed (now gitignored, but history contains secrets)

#### What was exposed:
- Stripe test keys
- JWT secret
- Email password
- Cloudinary API credentials

#### Actions needed:
1. ✅ Already done: `.env` is now in `.gitignore`
2. ⚠️ **TODO:** Rotate all exposed credentials:
   - Generate new Stripe test keys
   - Change JWT_SECRET to a new random string
   - Generate new Gmail app password
   - Rotate Cloudinary API secret

#### Remove from git history (optional but recommended):
```bash
# WARNING: This rewrites history - coordinate with all developers first
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# Then force push (dangerous - coordinate first!)
git push origin --force --all
```

---

## 🧹 CODE QUALITY ISSUES

### 9. Debug Console.log Statements Left in Production Code

**Files:**
- `routes/stripe.js:64` - `console.log(user);`
- `routes/stripe.js:67` - `console.log(stripeCustomerId);`
- `routes/auditRoutes.js:13` - `console.log(req);`

**Recommendation:**
- Remove before production deployment
- Or replace with proper logging library (Winston, Pino, etc.)

---

### 10. Incomplete Webhook Secret Validation
**File:** `services/stripeService.js:7-11`
**Severity:** LOW 🟡

```javascript
// CURRENT: Only warns
if (!WEBHOOK_SECRET) {
  console.warn('[stripe] Missing STRIPE_WEBHOOK_KEY in env. Webhook verify will fail.');
}

// BETTER: Fail hard in production
if (!WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_WEBHOOK_KEY is required in production');
}
```

---

## ✅ POSITIVE CHANGES (Keep These)

1. ✅ Fixed Stripe API call structure in `services/stripeService.js`
2. ✅ Added `STRIPE_WEBHOOK_KEY` to environment variables
3. ✅ `.env` now properly gitignored
4. ✅ Improved error handling in Stripe service
5. ✅ Better parameter validation in `createCheckoutSession`

---

## 📋 RECOMMENDED FIX ORDER

### Phase 1: Security Fixes (Deploy ASAP)
1. Fix cookie security settings (routes/auth.js)
2. Move hardcoded JWT_SECRET to env variable
3. Move hardcoded email credentials to env variables
4. Remove or secure hardcoded admin credentials

### Phase 2: Bug Fixes (Deploy Same Day)
5. Fix Stripe customer creation + run data migration
6. Fix route import inconsistency
7. Fix name concatenation spacing

### Phase 3: Code Quality (Next Sprint)
8. Remove debug console.log statements
9. Improve webhook secret validation
10. Rotate exposed credentials from git history

### Phase 4: Infrastructure (When Possible)
11. Remove .env from git history (coordinate with team)
12. Implement proper logging library
13. Add pre-commit hooks to prevent secret commits

---

## 🧪 TESTING CHECKLIST

After implementing fixes, test:

- [ ] User login works in development (HTTP)
- [ ] User login works in production (HTTPS)
- [ ] Admin login works (if keeping this feature)
- [ ] Stripe checkout creates customers correctly
- [ ] Customer IDs are stored as strings, not objects
- [ ] Stripe webhooks validate correctly
- [ ] Password reset emails send successfully
- [ ] Application starts without environment variable errors

---

## 📞 QUESTIONS?

If you need clarification on any of these issues, please reach out. All issues have been documented with:
- Exact file locations and line numbers
- Code examples showing the problem
- Code examples showing the fix
- Explanation of security/functional impact

**Git Status at Time of Review:**
- Branch: `claude/check-recent-changes-011CUwThKfTdducYvSjGDvJf`
- Last commit: `0542367` (Nov 4, 2025)
- Working tree: Clean (no uncommitted changes)
- Server status: Not running
