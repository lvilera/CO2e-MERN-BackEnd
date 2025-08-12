# Database Seeding for Local Contractors

This script adds sample local contractor data to your database for testing the location-based filtering feature.

## What it does

- Adds 10 sample local contractors with different locations across New York State
- Each contractor has complete information including company details, contact info, and location data
- Clears any existing local contractors before adding new ones
- Perfect for testing the location filtering feature in your Services page

## Sample Data Includes

The script adds contractors from various New York locations:
- New York City (Manhattan, Brooklyn, Queens, Bronx, Staten Island)
- Long Island
- Westchester County
- Hudson Valley

## How to Run

### Option 1: Using npm script (Recommended)
```bash
cd Backend/EBack
npm run seed
```

### Option 2: Direct execution
```bash
cd Backend/EBack
node seedLocalContractors.js
```

## Prerequisites

1. **MongoDB Connection**: Make sure your MongoDB is running and accessible
2. **Environment Variables**: Set your `MONGODB_URI` environment variable, or update the connection string in the script
3. **Dependencies**: Ensure all required packages are installed (`npm install`)

## Environment Setup

Before running the script, make sure to set your MongoDB connection string:

```bash
export MONGODB_URI="mongodb://your-connection-string"
```

Or update the `MONGODB_URI` variable in `seedLocalContractors.js` with your actual connection string.

## Expected Output

When successful, you should see:
```
✅ Connected to MongoDB
🗑️  Cleared existing local contractors
✅ Successfully added 10 local contractors to the database

📋 Added Local Contractors:
1. Green Thumb Landscaping - New York, New York
2. Metro Plumbing Solutions - New York, New York
3. Brooklyn Electric Co. - Brooklyn, New York
4. Queens HVAC Services - Queens, New York
5. Manhattan Construction Group - Manhattan, New York
6. Bronx Roofing Experts - Bronx, New York
7. Staten Island Paint Pros - Staten Island, New York
8. Long Island Home Services - Long Island, New York
9. Westchester Contracting - White Plains, New York
10. Hudson Valley Renovations - Poughkeepsie, New York

🎉 Seeding completed!
```

## Testing the Location Feature

After seeding, you can test the location filtering:

1. Go to your Services page
2. Select "Local Contractors" from the industry filter
3. The system will automatically filter contractors based on your detected location
4. You should see contractors from your area (if any match your location)

## Troubleshooting

- **Connection Error**: Check your MongoDB connection string and ensure the database is running
- **Permission Error**: Make sure you have write access to your database
- **Model Error**: Ensure the Directory model is properly defined and accessible

## Customization

You can modify the `localContractors` array in the script to:
- Add more contractors
- Change locations
- Modify company details
- Add different industries

## Notes

- The script will clear existing local contractors before adding new ones
- Each contractor has realistic contact information and descriptions
- All contractors are marked as "Local Contractors" industry for proper filtering
- The script is safe to run multiple times 