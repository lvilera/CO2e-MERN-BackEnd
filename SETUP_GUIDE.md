# CO2e MERN Backend - Setup Guide

Welcome to the CO2e Carbon Credits Portal Backend! This guide will help you set up the development environment and get the application running locally.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [MongoDB Setup](#mongodb-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **MongoDB** (Local or Atlas account) - [See MongoDB Setup](#mongodb-setup)

### Verify Installation

```bash
node --version    # Should show v18.x or higher
npm --version     # Should show 8.x or higher
git --version     # Should show 2.x or higher
```

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/lvilera/CO2e-MERN-BackEnd.git
cd CO2e-MERN-BackEnd
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js (Web framework)
- Mongoose (MongoDB ODM)
- bcrypt (Password hashing)
- jsonwebtoken (JWT authentication)
- Stripe (Payment processing)
- Cloudinary (Image hosting)
- And more...

---

## MongoDB Setup

You have two options for MongoDB:

### Option A: Local MongoDB (Recommended for Development)

#### Windows

1. Download MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will typically install to `C:\Program Files\MongoDB\Server\{version}\`
4. Start MongoDB:
   ```cmd
   "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath="C:\data\db"
   ```

#### macOS

```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community@8.0

# Start MongoDB service
brew services start mongodb-community@8.0

# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

#### Linux (Ubuntu/Debian)

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-8.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod
```

#### Verify MongoDB is Running

```bash
# Connect to MongoDB shell
mongosh

# Should see:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017/
# Using MongoDB: 8.0.x
```

### Option B: MongoDB Atlas (Cloud - Free Tier Available)

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (M0 Sandbox)
   - Select a cloud provider and region (closest to you)
   - Click "Create Cluster"

3. **Set Up Database Access**
   - Go to "Database Access" in left menu
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Set "Database User Privileges" to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" in left menu
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP addresses

5. **Get Connection String**
   - Go back to "Database" in left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `co2e-portal`

   Example:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/co2e-portal?retryWrites=true&w=majority
   ```

---

## Environment Configuration

The repository includes a `.env` file that has been pre-configured for local development.

### Review and Update .env File

Open the `.env` file in the root directory and verify/update the following:

```env
# =============================================================================
# Database Configuration
# =============================================================================
# For LOCAL MongoDB:
MONGODB_URI=mongodb://localhost:27017/co2e-portal

# For MongoDB Atlas (uncomment and update):
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/co2e-portal?retryWrites=true&w=majority

# =============================================================================
# Server Configuration
# =============================================================================
PORT=5001
NODE_ENV=development

# =============================================================================
# Frontend Configuration
# =============================================================================
FRONTEND_URL=http://localhost:3000
FRONTEND_SUCCESS_URL=http://localhost:3000/success
FRONTEND_CANCEL_URL=http://localhost:3000/cancel
FRONTEND_RESET_PASSWORD_URL=http://localhost:3000/reset-password

# =============================================================================
# JWT Configuration
# =============================================================================
# IMPORTANT: Change this in production!
JWT_SECRET=this_is_a_secure_jwt_secret_for_local_dev_change_in_production

# =============================================================================
# Email Configuration (Gmail)
# =============================================================================
# Update with your Gmail credentials for password reset emails
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# How to generate Gmail App Password:
# 1. Go to https://myaccount.google.com/apppasswords
# 2. Select "Mail" and device, then generate
# 3. Use the generated 16-character password

# =============================================================================
# Stripe Configuration (Payment Processing)
# =============================================================================
# Test keys provided (safe for development)
STRIPE_SECRET_KEY=sk_test_51Rj1BHBwwMNNzzzsjwDBeLycAGXndWqDaOM3izFSPAOP8xf7eXBmvGpunL90DhyZCvVaXvHvfgApufjRxt3GliV5008cNT31Nn
STRIPE_PUBLISHABLE_KEY=pk_test_51Rj1dnBOoulucdCvghV3vwtwYiAgrFek2IsnGS9WH0Sd1IQR3qdU0zGnpbWevLioQT3tKeOm4ifQBEQUxpMzrnm700Zw6YCpDl

# =============================================================================
# Cloudinary Configuration (Image Hosting)
# =============================================================================
# Development credentials provided
CLOUDINARY_CLOUD_NAME=dftnqqcjz
CLOUDINARY_API_KEY=419724397335875
CLOUDINARY_API_SECRET=Q7usOM7s5EsyeubXFzy5fQ1I_7A
```

### Important Notes:

1. **MongoDB URI**: Choose either local or Atlas connection string
2. **Email Credentials**: Required for password reset functionality
3. **JWT Secret**: Use a strong secret for production (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
4. **Stripe Keys**: Test keys are safe for development, use live keys for production
5. **Cloudinary**: Provided credentials are for development only

---

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

This will:
- Start the server on `http://localhost:5001`
- Connect to MongoDB
- Watch for file changes and auto-restart

### Production Mode

```bash
npm start
```

### Expected Console Output

```
🔄 Attempting to connect to MongoDB (option 1/1)...
✅ Connected to MongoDB successfully!
🚀 Server is running on port 5001
🌐 Server URL: http://localhost:5001
Using Stripe key: sk_test_51Rj1BHBwwMN...
```

---

## Testing

### Test the API

#### 1. Health Check

```bash
curl http://localhost:5001/api/directory
```

Should return an empty array `[]` if database is empty.

#### 2. Create a Test User

```bash
curl -X POST http://localhost:5001/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 3. Login

```bash
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Should return a JWT token and user info.

#### 4. Admin Login

```bash
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@admin.com",
    "password": "admin123"
  }'
```

### Seed Test Data (Optional)

```bash
# Seed local contractors
npm run seed

# Seed test data
npm run seed:test

# Seed Pakistan contractors
npm run seed:pakistan
```

### Using Postman or Insomnia

1. Import the API collection (if provided)
2. Set base URL to `http://localhost:5001`
3. Test all endpoints

---

## Database Management

### Access MongoDB Shell

```bash
# Local MongoDB
mongosh

# MongoDB Atlas
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/co2e-portal" --username <username>
```

### Useful Commands

```javascript
// Use the database
use co2e-portal

// Show all collections
show collections

// Count documents in collections
db.users.countDocuments()
db.userdirectories.countDocuments()
db.admindirectories.countDocuments()

// View sample data
db.users.find().limit(5).pretty()
db.userdirectories.find({ status: 'approved' }).pretty()

// Drop a collection (be careful!)
db.users.drop()

// Drop entire database (BE VERY CAREFUL!)
db.dropDatabase()
```

### Database Backup

```bash
# Backup entire database
mongodump --db=co2e-portal --out=/backup

# Restore database
mongorestore --db=co2e-portal /backup/co2e-portal
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Failed

**Error:**
```
❌ MongoDB connection failed: MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Verify MongoDB is running: `mongosh` or check system services
- Check MONGODB_URI in `.env` matches your setup
- For Atlas: Verify IP whitelist and credentials

#### 2. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5001
```

**Solution:**
```bash
# Find process using port 5001
# Windows:
netstat -ano | findstr :5001

# Mac/Linux:
lsof -i :5001

# Kill the process or change PORT in .env
```

#### 3. Module Not Found

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Email Sending Fails

**Error:**
```
Error sending reset email: Invalid login
```

**Solution:**
- Verify EMAIL_USER and EMAIL_PASS in `.env`
- For Gmail, use App Password (not regular password)
- Enable "Less secure app access" (not recommended) or use OAuth2

#### 5. Stripe Webhook Errors

**Error:**
```
Stripe webhook signature verification failed
```

**Solution:**
- For local testing, use Stripe CLI for webhook forwarding
- Install: https://stripe.com/docs/stripe-cli
- Forward webhooks: `stripe listen --forward-to localhost:5001/api/stripe/webhooks`

#### 6. CORS Errors

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Verify FRONTEND_URL in `.env` matches your frontend
- Check CORS configuration in `api/index.js`
- For development, the CORS is already configured permissively

---

## Development Workflow

### Recommended Tools

1. **VS Code Extensions**
   - REST Client (for API testing)
   - MongoDB for VS Code
   - ESLint
   - GitLens

2. **Database Tools**
   - MongoDB Compass (GUI for MongoDB)
   - Studio 3T (alternative MongoDB GUI)

3. **API Testing**
   - Postman
   - Insomnia
   - Thunder Client (VS Code extension)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

---

## Project Structure

```
CO2e-MERN-BackEnd/
├── api/
│   └── index.js                 # Main Express app
├── models/                      # Mongoose schemas
│   ├── User.js
│   ├── Directory.js
│   ├── AdminDirectory.js
│   ├── UserDirectory.js
│   ├── Booking.js
│   ├── Course.js
│   └── ...
├── routes/                      # API route handlers
│   ├── auth.js
│   ├── directoryRoutes.js
│   ├── bookingRoutes.js
│   └── ...
├── services/                    # Business logic
│   ├── geolocationService.js
│   ├── stripeService.js
│   └── ...
├── middlewares/                 # Express middlewares
│   ├── authMiddleware.js
│   └── errorHandlerMiddleware.js
├── configs/                     # Configuration files
├── utils/                       # Utility functions
├── .env                         # Environment variables
├── package.json                 # Dependencies
├── MONGODB_SCHEMA_DOCUMENTATION.md  # Database schema docs
└── SETUP_GUIDE.md              # This file
```

---

## Next Steps

After successful setup:

1. **Review the Schema Documentation**
   - Read `MONGODB_SCHEMA_DOCUMENTATION.md`
   - Understand the data models and relationships

2. **Explore the API**
   - Test all endpoints
   - Check the routes files for available endpoints

3. **Connect Frontend**
   - Clone the frontend repository
   - Update frontend `.env` to point to `http://localhost:5001`

4. **Start Development**
   - Make changes to models, routes, or services
   - Test your changes
   - Commit and push to Git

---

## Production Deployment

### Preparation Checklist

- [ ] Update JWT_SECRET with strong random string
- [ ] Configure MongoDB Atlas for production
- [ ] Update FRONTEND_URL to production domain
- [ ] Use Stripe live keys (not test keys)
- [ ] Set up Cloudinary production account
- [ ] Configure Gmail OAuth2 (not app passwords)
- [ ] Set NODE_ENV=production
- [ ] Enable MongoDB authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging

### Deployment Platforms

- **Vercel** (Recommended for this project)
- **Heroku**
- **AWS EC2**
- **DigitalOcean**
- **Railway**

---

## Support and Resources

### Documentation

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Stripe Documentation](https://stripe.com/docs)

### Community

- GitHub Issues: [Report bugs or request features]
- Stack Overflow: Tag with `mongodb`, `express`, `mongoose`

### Contact

For project-specific questions, contact the development team.

---

## License

[Specify your license here]

---

**Last Updated:** October 31, 2025
**Version:** 1.0.0
**Maintained by:** CO2e Development Team

---

Happy coding! 🚀
