# CO2e Portal - MongoDB Schema Documentation

This document provides a comprehensive overview of the MongoDB database schema for the CO2e Carbon Credits Portal backend application.

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Collections Schema](#collections-schema)
   - [Users](#1-users)
   - [Instructors](#2-instructors)
   - [User Directory](#3-userdirectory)
   - [Admin Directory](#4-admindirectory)
   - [Directory (Legacy)](#5-directory-legacy)
   - [Blogs](#6-blogs)
   - [News](#7-news)
   - [Courses](#8-courses)
   - [Bookings](#9-bookings)
   - [Products](#10-products)
   - [Orders](#11-orders)
   - [Subscriptions](#12-subscriptions)
   - [Featured Listings](#13-featuredlistings)
   - [Service Images](#14-serviceimages)
   - [Guides](#15-guides)
   - [Cards](#16-cards)
   - [Newsletters](#17-newsletters)
   - [Uploaded Files](#18-uploadedfiles)
   - [Directory Uploads](#19-directoryuploads)
3. [Indexes](#indexes)
4. [Relationships](#relationships)
5. [Data Flow](#data-flow)

---

## Database Overview

**Database Name:** `co2e-portal` (configurable via `MONGODB_URI` in `.env`)

**Total Collections:** 19

**Technology Stack:**
- MongoDB 8.x
- Mongoose ODM 8.16.1
- Node.js with Express

---

## Collections Schema

### 1. Users

**Collection Name:** `users`

**Purpose:** Stores user account information, authentication, and profile data.

**Schema:**

```javascript
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),

  // Location fields
  city: String,
  state: String,
  country: String,

  // Stripe integration
  stripeCustomerId: String,

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Account status
  isActive: Boolean (default: true),
  emailVerified: Boolean (default: false),
  emailVerificationToken: String,

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now),
  lastLogin: Date
}
```

**Indexes:**
- `email` (unique)
- `role`
- `resetPasswordToken`
- `emailVerificationToken`

**API Endpoints:**
- `POST /api/signup` - Create new user
- `POST /api/login` - Authenticate user
- `GET /api/me` - Get current user info
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password
- `PUT /api/update-location` - Update user location

---

### 2. Instructors

**Collection Name:** `instructors`

**Purpose:** Stores instructor profiles for course bookings.

**Schema:**

```javascript
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),

  // Location
  city: String,
  location: String, // Area/region

  // Availability (Map structure)
  availability: {
    type: Map,
    of: [{
      start: String, // e.g., "09:00"
      end: String    // e.g., "17:00"
    }]
  },

  // Profile
  bio: String,
  specialties: [String],
  experience: String,
  hourlyRate: Number,

  // Contact
  phoneNumber: String,
  preferredContactMethod: String (enum: ['email', 'phone']),

  // Status
  isActive: Boolean (default: true),
  totalBookings: Number (default: 0),

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now),
  lastLogin: Date
}
```

**Indexes:**
- `email` (unique)
- `city`
- `location`
- `isActive`

**API Endpoints:**
- `POST /api/instructor-login` - Instructor authentication
- `GET /api/instructors` - List all instructors
- `GET /api/instructors/:id` - Get instructor details

---

### 3. UserDirectory

**Collection Name:** `userdirectories`

**Purpose:** Stores directory listings submitted by users through the form.

**Schema:**

```javascript
{
  _id: ObjectId,
  company: String (required),
  email: String (required, unique),
  address: String (required),
  phone: String (required),
  industry: String (required),
  city: String (required),
  state: String,
  country: String,
  contractorType: String, // For Local Contractors

  // Enhanced fields
  imageUrl: String (default: ''),
  socialType: String (default: ''), // facebook, instagram, linkedin
  socialLink: String (default: ''),
  package: String (enum: ['free', 'pro', 'premium'], default: 'free'),

  // Submission tracking
  userId: String,
  userEmail: String,
  submissionMethod: String (enum: ['form', 'api'], default: 'form'),

  // Moderation
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  moderationNotes: String (default: ''),
  isVerified: Boolean (default: false),
  isPremiumListing: Boolean (default: false),
  premiumExpiry: Date,

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `email` (unique)
- `industry`
- `city`
- `status`
- `contractorType`
- `package`
- `userId`

**API Endpoints:**
- `POST /api/directory` - Submit directory listing (user form)
- `GET /api/directory` - Get all approved listings
- `GET /api/directory/search` - Search listings
- `GET /api/directory/categories` - Get unique industries
- `GET /api/directory/cities` - Get unique cities

---

### 4. AdminDirectory

**Collection Name:** `admindirectories`

**Purpose:** Stores directory listings uploaded by admin via bulk Excel/CSV upload.

**Schema:**

```javascript
{
  _id: ObjectId,
  company: String (required),
  email: String (required),
  phone: String (required),
  industry: String (required),
  city: String,
  state: String,
  country: String,
  contractorType: String,

  // Enhanced fields
  imageUrl: String (default: ''),
  socialType: String (default: ''),
  socialLink: String (default: ''),
  package: String (enum: ['free', 'pro', 'premium'], default: 'free'),

  // Additional fields
  address: String (default: ''),
  website: String (default: ''),
  description: String (default: ''),
  displayCategory: String (default: ''), // Critical for frontend filtering

  // Admin upload tracking
  uploadBatch: String (required), // Unique batch ID
  originalFileName: String (required),
  sheetName: String,
  rowNumber: Number (required),
  uploadedBy: String (default: 'admin'),

  // Validation
  validationStatus: String (enum: ['pending', 'valid', 'invalid'], default: 'pending'),
  validationErrors: [String],
  originalData: Mixed, // Store original row data

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `uploadBatch, rowNumber` (compound)
- `industry`
- `city`
- `email`
- `contractorType`
- `package`
- `displayCategory`

**API Endpoints:**
- `POST /api/directory/bulk-upload` - Admin bulk upload (Excel/CSV)
- `GET /api/directory/admin-uploads` - Get admin uploaded listings
- `GET /api/directory/upload-history` - Get upload history
- `DELETE /api/directory/upload-history/:id` - Delete upload batch
- `PUT /api/directory/admin-uploads/:id/validate` - Update validation status

---

### 5. Directory (Legacy)

**Collection Name:** `directories`

**Purpose:** Legacy directory model for backward compatibility.

**Schema:**

```javascript
{
  _id: ObjectId,
  company: String (required),
  email: String (required),
  phone: String (required),
  industry: String (required),
  city: String (required),
  state: String,
  country: String,
  contractorType: String,

  // Enhanced fields
  imageUrl: String (default: ''),
  socialType: String (default: ''),
  socialLink: String (default: ''),
  package: String (enum: ['free', 'pro', 'premium'], default: 'free'),

  // Tracking
  submissionMethod: String (enum: ['form', 'admin'], default: 'form'),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'approved'),

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `industry`
- `city`
- `email`
- `contractorType`
- `package`
- `status`

---

### 6. Blogs

**Collection Name:** `blogs`

**Purpose:** Stores blog posts with multi-language support.

**Schema:**

```javascript
{
  _id: ObjectId,
  title: {
    en: String (required),
    fr: String (required),
    es: String (required)
  },
  description: {
    en: String (required),
    fr: String (required),
    es: String (required)
  },
  imageUrl: String (required),
  category: String (default: 'General'),
  tags: [String],
  isPublished: Boolean (default: true),
  publishedDate: Date (default: Date.now),
  author: String (default: 'Admin'),
  viewCount: Number (default: 0),

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `category`
- `publishedDate` (descending)
- `isPublished`
- `tags`

**API Endpoints:**
- `GET /api/blogs` - List all published blogs
- `GET /api/blogs/:id` - Get blog by ID
- `POST /api/blogs` - Create new blog (admin)
- `PUT /api/blogs/:id` - Update blog (admin)
- `DELETE /api/blogs/:id` - Delete blog (admin)

---

### 7. News

**Collection Name:** `news`

**Purpose:** Stores news articles with multi-language support.

**Schema:**

```javascript
{
  _id: ObjectId,
  title: {
    en: String (required),
    fr: String (required),
    es: String (required)
  },
  description: {
    en: String (required),
    fr: String (required),
    es: String (required)
  },
  imageUrl: String (required),
  category: String (default: 'General'),
  tags: [String],
  isPublished: Boolean (default: true),
  publishedDate: Date (default: Date.now),
  author: String (default: 'Admin'),
  viewCount: Number (default: 0),

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `category`
- `publishedDate` (descending)
- `isPublished`
- `tags`

**API Endpoints:**
- `GET /api/news` - List all news articles
- `GET /api/news/:id` - Get news by ID
- `POST /api/news` - Create news (admin)
- `PUT /api/news/:id` - Update news (admin)
- `DELETE /api/news/:id` - Delete news (admin)

---

### 8. Courses

**Collection Name:** `courses`

**Purpose:** Stores training courses information.

**Schema:**

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  professor: String (required),
  commencing: Date (required),
  fileURL: String (required), // Course materials
  imageURL: String (required),

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**API Endpoints:**
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/:id` - Update course (admin)
- `DELETE /api/courses/:id` - Delete course (admin)

---

### 9. Bookings

**Collection Name:** `bookings`

**Purpose:** Stores course booking information with payment integration.

**Schema:**

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  instructor: ObjectId (ref: 'Instructor'),
  courseName: String (required),
  date: Date (required),
  start: String (required), // e.g., "09:00"
  end: String (required),   // e.g., "17:00"
  city: String (required),
  area: String (required),
  status: String (enum: ['on-hold', 'confirmed', 'completed', 'cancelled'], default: 'on-hold'),

  // Notification tracking
  notifiedInstructors: [ObjectId] (ref: 'Instructor'),

  // Payment
  paymentStatus: String (enum: ['pending', 'paid', 'refunded'], default: 'pending'),
  paymentIntentId: String, // Stripe payment intent ID
  amount: Number, // Amount in cents
  currency: String (default: 'usd'),

  // Details
  notes: String,
  duration: Number (default: 8), // Hours
  durationWeeks: Number (default: 1),

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `user`
- `instructor`
- `status`
- `date`
- `city, area` (compound)
- `paymentStatus`

**API Endpoints:**
- `GET /api/bookings` - List bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

---

### 10. Products

**Collection Name:** `products`

**Purpose:** Stores digital products available for purchase.

**Schema:**

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  price: Number (required),
  fileURL: String (required), // Product file/download
  imageURL: String (required),
  stripeProductId: String (required),
  stripePriceId: String (required),

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**API Endpoints:**
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

---

### 11. Orders

**Collection Name:** `orders`

**Purpose:** Stores product purchase orders.

**Schema:**

```javascript
{
  _id: ObjectId,
  stripeSessionId: String (required),
  stripePaymentIntentId: String (required),
  user: ObjectId (ref: 'User', required),
  customerId: String (required, unique),
  product: ObjectId (ref: 'Product', required),
  quantity: Number (required),
  status: String (enum: ['pending', 'paid', 'refunded'], default: 'pending'),

  // Timestamps (auto-generated by Mongoose)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `customerId` (unique)
- `user`
- `product`
- `status`

**API Endpoints:**
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order by ID

---

### 12. Subscriptions

**Collection Name:** `subscriptions`

**Purpose:** Stores user subscription information for recurring payments.

**Schema:**

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required, unique),
  customerId: String (required, unique),
  subscriptions: [{
    subscriptionId: String (required),
    invoiceId: String (required),
    planInfo: {
      productId: String (required),
      name: String (required),
      description: String (required),
      priceId: String (required),
      amount: Number (required),
      currency: String (required)
    },
    paidAmount: Number (required),
    billingReason: String (required),
    startDate: Date (required),
    endDate: Date (required),
    status: String (enum: ['active', 'inactive', 'refunded'], default: 'active'),
    autoRenew: Boolean (default: true)
  }]
}
```

**Indexes:**
- `user` (unique)
- `customerId` (unique)

**API Endpoints:**
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/stripe/create-subscription` - Create subscription
- `POST /api/stripe/cancel-subscription` - Cancel subscription

---

### 13. FeaturedListings

**Collection Name:** `featuredlistings`

**Purpose:** Stores featured/promoted images for the homepage carousel.

**Schema:**

```javascript
{
  _id: ObjectId,
  imageUrl: String (required),
  title: String (default: ''),
  description: String (default: ''),
  link: String (default: ''), // Optional click destination
  isActive: Boolean (default: true),
  uploadedBy: String (default: 'admin'),
  originalFileName: String,
  displayOrder: Number (default: 0),

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `isActive, displayOrder` (compound)
- `createdAt` (descending)

**API Endpoints:**
- `GET /api/featured-listings` - Get active featured listings
- `POST /api/featured-listings` - Create featured listing (admin)
- `DELETE /api/featured-listings/:id` - Delete featured listing (admin)

---

### 14. ServiceImages

**Collection Name:** `serviceimages`

**Purpose:** Stores general service/promotional images.

**Schema:**

```javascript
{
  _id: ObjectId,
  imageUrl: String (required),
  uploadedBy: String (default: 'admin'),
  originalFileName: String,
  isActive: Boolean (default: true),

  // Timestamps
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `isActive, createdAt` (compound, descending)

**API Endpoints:**
- `GET /api/service-images` - Get service images
- `POST /api/service-images` - Upload service image (admin)
- `DELETE /api/service-images/:id` - Delete service image (admin)

---

### 15. Guides

**Collection Name:** `guides`

**Purpose:** Stores downloadable guides and resources.

**Schema:**

```javascript
{
  _id: ObjectId,
  title: String (required),
  fileURL: String (required), // PDF or document URL
  imageURL: String (required), // Thumbnail

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**API Endpoints:**
- `GET /api/guides` - List all guides
- `GET /api/guides/:id` - Get guide by ID
- `POST /api/guides` - Create guide (admin)
- `DELETE /api/guides/:id` - Delete guide (admin)

---

### 16. Cards

**Collection Name:** `cards`

**Purpose:** Stores homepage feature cards with multi-language support.

**Schema:**

```javascript
{
  _id: ObjectId,
  title: {
    en: String (required),
    fr: String (required),
    es: String (required)
  },
  description: {
    en: String (required),
    fr: String (required),
    es: String (required)
  },
  link: String (required),
  imageUrl: String,
  originalFileName: String,
  isActive: Boolean (default: true),
  displayOrder: Number (default: 0),

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `isActive, displayOrder` (compound)
- `createdAt` (descending)

**API Endpoints:**
- `GET /card` - Get active cards
- `POST /card` - Create card (admin)
- `PUT /card/:id` - Update card (admin)
- `DELETE /card/:id` - Delete card (admin)

---

### 17. Newsletters

**Collection Name:** `newsletters`

**Purpose:** Stores newsletter subscription information.

**Schema:**

```javascript
{
  _id: ObjectId,
  email: String (required, unique),
  firstName: String,
  lastName: String,
  isActive: Boolean (default: true),
  language: String (enum: ['en', 'fr', 'es'], default: 'en'),
  subscribedAt: Date (default: Date.now),
  unsubscribedAt: Date,
  source: String (default: 'website'),

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `email` (unique)
- `isActive`
- `language`

**API Endpoints:**
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe
- `GET /api/newsletter` - List subscribers (admin)

---

### 18. UploadedFiles

**Collection Name:** `uploadedfiles`

**Purpose:** Tracks general file uploads and downloads.

**Schema:**

```javascript
{
  _id: ObjectId,
  originalName: String (required),
  filename: String (required),
  mimetype: String (required),
  size: Number (required),
  url: String (required),
  uploadedBy: String (default: 'admin'),
  category: String (default: 'general'),
  description: String,
  isPublic: Boolean (default: false),
  downloadCount: Number (default: 0),

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `uploadedBy`
- `category`
- `mimetype`
- `isPublic`

---

### 19. DirectoryUploads

**Collection Name:** `directoryuploads`

**Purpose:** Tracks admin bulk upload operations and results.

**Schema:**

```javascript
{
  _id: ObjectId,
  originalFileName: String (required),
  fileSize: Number (required),
  fileType: String (required),
  uploadDate: Date (default: Date.now),
  uploadBatch: String (required, unique),

  // Processing results
  totalRows: Number (required),
  successfulUploads: Number (default: 0),
  failedUploads: Number (default: 0),
  status: String (enum: ['processing', 'completed', 'partial', 'failed'], default: 'processing'),

  // Error tracking
  errors: [{
    row: Number,
    sheet: String,
    error: String,
    company: String,
    email: String
  }],

  // Metadata
  uploadedBy: String (default: 'admin'),
  processingTime: Number, // milliseconds
  headers: [String],
  sampleRows: [Object],

  // Timestamps
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `uploadDate` (descending)
- `uploadBatch` (unique)
- `status`
- `uploadedBy`

---

## Indexes

### Performance Optimization

All collections include strategic indexes to optimize query performance:

1. **Unique Indexes** - Prevent duplicate entries (e.g., user emails)
2. **Compound Indexes** - Optimize multi-field queries (e.g., city + area for bookings)
3. **Sparse Indexes** - For optional fields with queries
4. **Text Indexes** - Future implementation for full-text search

### Index Monitoring

Monitor index usage with:
```javascript
db.collection.getIndexes()
db.collection.stats()
```

---

## Relationships

### Entity Relationship Diagram

```
Users ──┬─── Bookings ─── Instructors
        │
        ├─── Orders ─── Products
        │
        ├─── Subscriptions
        │
        └─── UserDirectory

AdminDirectory ─── DirectoryUploads

Blogs, News, Cards (Multi-language content)

Featured Listings, Service Images (Media assets)
```

### Key Relationships

1. **Users → Bookings** (One-to-Many)
   - A user can have multiple bookings

2. **Instructors → Bookings** (One-to-Many)
   - An instructor can have multiple bookings

3. **Users → Orders** (One-to-Many)
   - A user can place multiple orders

4. **Products → Orders** (One-to-Many)
   - A product can appear in multiple orders

5. **Users → Subscriptions** (One-to-One)
   - Each user has one subscription record with multiple subscription periods

6. **DirectoryUploads → AdminDirectory** (One-to-Many)
   - Each upload batch contains multiple directory entries

---

## Data Flow

### User Registration & Authentication Flow

```
1. User signs up → Create User document
2. Password hashed with bcrypt
3. Location detected from IP (geoip-lite)
4. JWT token issued for authentication
5. Token stored in httpOnly cookie
```

### Directory Listing Flow

```
USER SUBMISSION:
1. User fills form → UserDirectory created
2. Image uploaded to Cloudinary (Premium only)
3. Status set to 'approved' (auto-approval)
4. Listing appears in public directory

ADMIN BULK UPLOAD:
1. Admin uploads Excel/CSV → DirectoryUpload created
2. File parsed (XLSX library)
3. Each row → AdminDirectory document
4. Batch ID links entries to upload
5. Validation status tracked per entry
```

### Payment Flow (Stripe Integration)

```
PRODUCT PURCHASE:
1. User selects product
2. Stripe checkout session created
3. Payment processed → Order created
4. Payment webhook updates order status
5. User receives product access

SUBSCRIPTION:
1. User selects plan
2. Stripe subscription created
3. Subscription document created
4. Recurring webhook updates subscription status
```

### Content Management Flow

```
MULTI-LANGUAGE CONTENT (Blogs, News, Cards):
1. Admin creates content with en/fr/es translations
2. Content stored with language object structure
3. Frontend requests specific language version
4. If translation missing, falls back to English
```

---

## Best Practices

### 1. Data Validation

- Always validate required fields
- Use Mongoose schema validation
- Sanitize user input to prevent injection

### 2. Performance

- Use indexes for frequently queried fields
- Limit query results with pagination
- Use projection to return only needed fields

### 3. Security

- Hash passwords with bcrypt (salt rounds: 10)
- Store JWT secret in environment variables
- Use httpOnly cookies for token storage
- Validate admin routes with middleware

### 4. Scalability

- Consider sharding for large collections (AdminDirectory, UserDirectory)
- Use connection pooling (already configured)
- Implement caching for frequently accessed data

### 5. Data Integrity

- Use transactions for multi-document operations
- Implement soft deletes where appropriate
- Maintain audit trails (createdAt, updatedAt)

---

## Local Development Setup

### Prerequisites

```bash
# Option 1: Local MongoDB
# Download and install MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# Start MongoDB
mongod --dbpath=/path/to/data

# Option 2: MongoDB Atlas (Cloud)
# Sign up at https://www.mongodb.com/cloud/atlas
# Create a free cluster
# Whitelist your IP address
```

### Configuration

Update `.env` file:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/co2e-portal

# OR MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/co2e-portal?retryWrites=true&w=majority
```

### Database Initialization

```bash
# Install dependencies
npm install

# Start server (creates indexes automatically)
npm run dev

# Seed test data (optional)
npm run seed:test
```

### Useful MongoDB Commands

```bash
# Connect to MongoDB
mongosh

# Use database
use co2e-portal

# Show collections
show collections

# Count documents
db.users.countDocuments()

# View indexes
db.users.getIndexes()

# Query examples
db.users.find({ role: 'admin' })
db.userdirectories.find({ status: 'approved' }).limit(10)
```

---

## Migration Guide

### From Development to Production

1. **Export data from local MongoDB:**
   ```bash
   mongodump --db=co2e-portal --out=/backup
   ```

2. **Import to Atlas:**
   ```bash
   mongorestore --uri="mongodb+srv://..." --db=co2e-portal /backup/co2e-portal
   ```

3. **Update environment variables**

4. **Verify indexes are created**

5. **Test all endpoints**

---

## API Testing

### Sample API Requests

```bash
# Register user
curl -X POST http://localhost:5001/api/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get directory listings
curl http://localhost:5001/api/directory

# Search directory
curl "http://localhost:5001/api/directory/search?industry=Broker&city=New York"
```

---

## Troubleshooting

### Common Issues

1. **Connection refused:**
   - Check MongoDB is running
   - Verify MONGODB_URI in .env
   - Check network/firewall settings

2. **Duplicate key error:**
   - Check for existing documents with same unique field
   - Drop and recreate indexes if needed

3. **Slow queries:**
   - Add appropriate indexes
   - Use `.explain()` to analyze queries
   - Consider aggregation pipeline optimization

4. **Memory issues:**
   - Implement pagination
   - Use streaming for large datasets
   - Increase connection pool size

---

## Support & Resources

- **MongoDB Documentation:** https://docs.mongodb.com/
- **Mongoose Documentation:** https://mongoosejs.com/docs/
- **Project Repository:** (Add your GitHub URL)

---

**Last Updated:** October 31, 2025
**Version:** 1.0.0
**Maintained by:** CO2e Development Team
