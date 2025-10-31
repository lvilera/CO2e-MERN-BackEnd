# 🚀 Quick Start - CO2e Backend

Get up and running in minutes!

---

## ✅ What's Been Set Up

1. **✅ Backend Code Restored** - All code is present and ready
2. **✅ Local .env File Created** - Pre-configured for development
3. **✅ MongoDB Documentation** - Complete schema documentation
4. **✅ Setup Guide** - Step-by-step instructions
5. **✅ Verification Script** - Automated setup checker

---

## 🎯 Quick Start Steps

### 1. Install MongoDB

**Choose ONE option:**

#### Option A: Local MongoDB (Easiest)
```bash
# macOS
brew install mongodb-community@8.0
brew services start mongodb-community@8.0

# Linux
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows
# Download from: https://www.mongodb.com/try/download/community
# Run installer, then start MongoDB service
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster
4. Get connection string
5. Update `MONGODB_URI` in `.env` file

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Verify Setup

```bash
node verify-setup.js
```

This will check:
- ✓ .env file exists
- ✓ All required environment variables are set
- ✓ MongoDB connection works
- ✓ Database collections (if any)

---

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# OR production mode
npm start
```

You should see:
```
✅ Connected to MongoDB successfully!
🚀 Server is running on port 5001
🌐 Server URL: http://localhost:5001
```

---

### 5. Test the API

Open a new terminal and run:

```bash
# Test health
curl http://localhost:5001/api/directory

# Create admin login test
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'
```

---

## 📚 Documentation

- **SETUP_GUIDE.md** - Complete setup instructions
- **MONGODB_SCHEMA_DOCUMENTATION.md** - Full database schema
- **verify-setup.js** - Setup verification script

---

## 🔧 Configuration Files

### .env File Location
```
/home/user/CO2e-MERN-BackEnd/.env
```

### Key Configuration (Already Done ✅)

```env
# Database (Update if using Atlas)
MONGODB_URI=mongodb://localhost:27017/co2e-portal

# Server
PORT=5001
NODE_ENV=development

# Frontend (Update when you have frontend running)
FRONTEND_URL=http://localhost:3000

# JWT Secret (Change for production!)
JWT_SECRET=this_is_a_secure_jwt_secret_for_local_dev_change_in_production
```

---

## 🎲 Optional: Seed Test Data

```bash
# Seed local contractors
npm run seed

# Seed test data
npm run seed:test

# Seed Pakistan contractors
npm run seed:pakistan
```

---

## 📊 MongoDB Collections

The database includes 19 collections:

1. **users** - User accounts
2. **instructors** - Training instructors
3. **userdirectories** - User-submitted listings
4. **admindirectories** - Admin bulk uploads
5. **blogs** - Blog posts (multi-language)
6. **news** - News articles (multi-language)
7. **courses** - Training courses
8. **bookings** - Course bookings with payment
9. **products** - Digital products
10. **orders** - Product orders
11. **subscriptions** - Recurring subscriptions
12. **featuredlistings** - Homepage carousel
13. **serviceimages** - Service images
14. **guides** - Downloadable guides
15. **cards** - Homepage cards
16. **newsletters** - Newsletter subscriptions
17. **uploadedfiles** - File tracking
18. **directoryuploads** - Bulk upload history
19. **directories** - Legacy directory model

See **MONGODB_SCHEMA_DOCUMENTATION.md** for complete details.

---

## 🌐 API Endpoints

### Authentication
- `POST /api/signup` - Register user
- `POST /api/login` - User login
- `POST /api/instructor-login` - Instructor login
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password
- `GET /api/me` - Get current user

### Directory
- `GET /api/directory` - List all listings
- `POST /api/directory` - Submit listing (user)
- `POST /api/directory/bulk-upload` - Bulk upload (admin)
- `GET /api/directory/search` - Search listings
- `GET /api/directory/categories` - Get industries
- `GET /api/directory/cities` - Get cities

### Content
- `GET /api/blogs` - List blogs
- `GET /api/news` - List news
- `GET /api/courses` - List courses
- `GET /api/guides` - List guides

### Commerce
- `GET /api/products` - List products
- `POST /api/bookings` - Create booking
- `POST /api/stripe/*` - Payment endpoints

And many more! See route files in `/routes` directory.

---

## 🔍 Database Access

### MongoDB Shell
```bash
# Connect
mongosh

# Use database
use co2e-portal

# Show collections
show collections

# View data
db.users.find().pretty()
db.userdirectories.find().limit(5).pretty()
```

### MongoDB Compass (GUI)
1. Download: https://www.mongodb.com/try/download/compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `co2e-portal`

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# If error, start MongoDB:
# macOS: brew services start mongodb-community@8.0
# Linux: sudo systemctl start mongod
# Windows: Start MongoDB service from Services panel
```

### Port Already in Use
```bash
# Change PORT in .env file to 5002 or different port
PORT=5002
```

### Missing Modules
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support

If you encounter issues:

1. Check **SETUP_GUIDE.md** troubleshooting section
2. Review error messages carefully
3. Verify MongoDB is running
4. Check .env configuration

---

## 🎉 You're All Set!

Your CO2e backend is now ready for development.

**Next Steps:**
1. ✅ Start the server: `npm run dev`
2. ✅ Test the API endpoints
3. ✅ Connect your frontend
4. ✅ Start building features!

Happy coding! 🚀

---

**Last Updated:** October 31, 2025
