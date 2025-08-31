# Directory Models Implementation

This document explains the implementation of separate models for admin and user directory uploads as requested.

## Overview

The system now uses two separate MongoDB models to handle directory listings:

1. **AdminDirectory** - For admin bulk uploads via Excel/CSV files
2. **UserDirectory** - For user form submissions via the directory listing page

## Models

### AdminDirectory Model (`models/AdminDirectory.js`)

**Purpose**: Stores directory entries uploaded by admins through bulk file uploads.

**Key Features**:
- Tracks upload batch information (batch ID, file name, sheet name, row number)
- Preserves original data for debugging and validation
- Includes validation status tracking ('pending', 'validated', 'error')
- Stores validation errors for failed entries
- Admin-specific metadata (uploaded by, source file info)

**Additional Fields**:
```javascript
socialType: String         // Social media platform name from SOCIAL MEDIA column
socialLink: String         // Social media URL from LINK column
imageUrl: String           // Image URL from uploaded file (optional)
package: String            // Package type from USER column ('free', 'pro', 'premium')
uploadBatch: String         // Batch ID to group entries from same upload
originalFileName: String    // Name of the uploaded file
sheetName: String          // Excel sheet/tab name
rowNumber: Number          // Row number in the original file
uploadedBy: String         // Who uploaded this entry (default: 'admin')
validationStatus: String   // 'pending', 'validated', 'error'
validationErrors: [String] // Array of validation error messages
originalData: Mixed        // Store original row data for debugging
```

### UserDirectory Model (`models/UserDirectory.js`)

**Purpose**: Stores directory entries submitted by users through the form interface.

**Key Features**:
- Enforces unique email constraint to prevent duplicate submissions
- Supports premium features (image uploads, package types)
- Includes social media information
- User-specific tracking and moderation
- Premium listing features

**Additional Fields**:
```javascript
socialType: String         // Social media platform type
socialLink: String         // Social media link
imageUrl: String          // Only for premium users
package: String           // 'free', 'pro', 'premium'
userId: ObjectId          // Reference to User model
userEmail: String         // Email of the user who submitted
submissionMethod: String  // 'form' for directory listing form
status: String           // 'pending', 'approved', 'rejected'
moderationNotes: String  // Admin notes for moderation
isVerified: Boolean      // Verification status
isPremiumListing: Boolean // Premium listing flag
premiumExpiry: Date      // Premium listing expiry
```

## API Endpoints

### Updated Existing Endpoints

#### `GET /api/directory/`
- **Changed**: Now returns combined results from both models
- **Behavior**: Merges approved UserDirectory entries and validated/pending AdminDirectory entries
- **Response**: Includes `source: 'user'` or `source: 'admin'` field for each entry

#### `POST /api/directory/`
- **Changed**: Now saves to UserDirectory model instead of original Directory model
- **Behavior**: Enforces unique email constraint for user submissions
- **Features**: Supports premium features, social media fields

#### `POST /api/directory/bulk-upload`
- **Changed**: Now saves to AdminDirectory model with enhanced tracking
- **Behavior**: Creates batch ID, tracks source file info, preserves original data
- **Features**: Enhanced error tracking and validation status

#### `GET /api/directory/categories`
- **Changed**: Returns categories from both models combined
- **Behavior**: Deduplicates categories across both collections

#### `GET /api/directory/cities`
- **Changed**: Returns cities from both models combined
- **Behavior**: Deduplicates cities across both collections

#### `GET /api/directory/search`
- **Changed**: Searches both models and returns combined results
- **Response**: Includes breakdown of results from each source

### New Endpoints

#### `GET /api/directory/admin-uploads`
- **Purpose**: Get AdminDirectory entries only
- **Query Parameters**: 
  - `batchId` - Filter by upload batch
  - `status` - Filter by validation status
- **Response**: Admin uploads with metadata

#### `GET /api/directory/user-submissions`
- **Purpose**: Get UserDirectory entries only
- **Query Parameters**:
  - `status` - Filter by approval status
  - `package` - Filter by user package type
- **Response**: User submissions with user-specific data

#### `PUT /api/directory/admin-uploads/:id/validate`
- **Purpose**: Update validation status of admin uploads
- **Body**: `{ validationStatus, validationErrors }`
- **Response**: Updated admin directory entry

## Migration Notes

### Backward Compatibility
- Original Directory model is kept for backward compatibility
- Existing API endpoints continue to work but now query both new models
- All GET endpoints return combined results from both models

### Data Migration
- Existing data in the Directory model should be migrated to appropriate new models
- Admin bulk uploads should go to AdminDirectory
- User form submissions should go to UserDirectory

### Frontend Changes Required
- No changes required for basic functionality
- Optional: Update admin interfaces to use new admin-specific endpoints
- Optional: Add admin validation interface using new validation endpoints

## Benefits

1. **Separation of Concerns**: Admin and user data are clearly separated
2. **Enhanced Tracking**: Admin uploads include comprehensive metadata
3. **Better Validation**: Separate validation workflows for each source
4. **Improved Features**: User submissions support premium features
5. **Data Integrity**: User submissions have unique email constraint
6. **Audit Trail**: Complete tracking of data source and processing

## Usage Examples

### Admin Bulk Upload
```javascript
// Upload file to /api/directory/bulk-upload
// Data automatically saved to AdminDirectory with batch tracking
// Excel/CSV files can include these columns:
// - COMPANY (required)
// - EMAIL (required) 
// - PHONE NUMBER (required)
// - CONTACT/ADDRESS (required)
// - WEBSITE (optional)
// - CATEGORY (required)
// - SUB-CATEGORY2 (optional)
// - IMAGE or IMAGE URL (optional) - Full URLs to images
// - LINK (optional) - Social media URLs
// - SOCIAL MEDIA (optional) - Platform name (facebook, twitter, linkedin, etc.)
// - USER (optional) - Package type (free, pro, premium)

// Get admin uploads
const adminUploads = await fetch('/api/directory/admin-uploads?status=pending');

// Validate an upload
await fetch(`/api/directory/admin-uploads/${id}/validate`, {
  method: 'PUT',
  body: JSON.stringify({ validationStatus: 'validated' })
});
```

### User Form Submission
```javascript
// Submit form to /api/directory/
// Data automatically saved to UserDirectory with user features

// Get user submissions
const userSubmissions = await fetch('/api/directory/user-submissions?package=premium');
```

### Combined Directory Listing
```javascript
// Get all approved listings (both sources)
const allListings = await fetch('/api/directory/');
// Returns combined results with source field indicating origin
```

## Display Behavior on Services Page

### Package-Based Styling
- **Free Users**: Normal text weight, standard font size
- **Pro Users**: Bold text, slightly larger font size
- **Premium Users**: Bold text, slightly larger font size + images shown

### Image Display
- **Based on USER column data from uploaded file**
- **Free entries**: No images shown (shows "Free" text placeholder)
- **Pro entries**: No images shown (shows "Pro" text placeholder)  
- **Premium entries**: Company images displayed (60x60px with rounded corners) if IMAGE column has URL
- **Note**: Only premium users get images displayed, all others show text placeholders

### Social Media Buttons
- **All Users**: Social media buttons created if both `socialType` and `socialLink` are provided
- **Button Text**: Shows the social media platform name (from SOCIAL MEDIA column)
- **Button Action**: Links to the social media URL (from LINK column)
- **Button Styling**: Inherits the package-based styling (bold for pro/premium)

### Column Mapping
The bulk upload supports these column variations:

| Feature | Column Names Supported |
|---------|----------------------|
| Social Link | `LINK`, `link`, `Link`, `SOCIAL LINK`, `social_link` |
| Social Platform | `SOCIAL MEDIA`, `SOCIAL_MEDIA`, `socialMedia`, `social media`, `socialType` |
| Package Type | `USER`, `user`, `User`, `PACKAGE`, `package` |
| Image URL | `IMAGE`, `Images`, `images`, `IMAGE URL`, `IMAGE_URL`, `image`, `imageUrl`, `Image` |

## Testing

Run the test script to verify models work correctly:

```bash
node test-models.js
```

This will test both models and verify they can save, query, and validate data correctly.

## Memory Reference

This implementation follows the user's memory preference: [[memory:5752777]] - All services in the project are stored in MongoDB using these new specialized models. 