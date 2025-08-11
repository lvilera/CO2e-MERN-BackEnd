# Location-Based Contractor System

This system enables users to find contractors in their local area based on their IP location or by searching specific cities.

## Features

- **Automatic Location Detection**: Automatically detects user's city, state, and country from IP address
- **Local Contractor Search**: Find contractors in the same city as the user
- **City-Based Search**: Search for contractors in specific cities
- **Advanced Search**: Filter contractors by industry and location
- **Real-time Location Updates**: Update user location on login and via API

## Database Schema Changes

### User Model
Added three new location fields:
```javascript
city: { type: String, trim: true }
state: { type: String, trim: true }
country: { type: String, trim: true }
```

### Directory Model
Added three new required location fields:
```javascript
city: { type: String, required: true, trim: true }
state: { type: String, required: true, trim: true }
country: { type: String, required: true, trim: true }
```

## New API Endpoints

### Directory Routes

#### GET `/api/directory/local/:city`
Find contractors in a specific city
- **Parameters**: 
  - `city` (path): City name
  - `state` (query, optional): State name
  - `country` (query, optional): Country name
- **Response**: List of contractors in the specified city

#### GET `/api/directory/nearby`
Find contractors near the user's current location (based on IP)
- **Response**: List of contractors in the user's city

#### GET `/api/directory/search`
Advanced search with multiple filters
- **Query Parameters**:
  - `industry`: Industry type
  - `city`: City name
  - `state`: State name
  - `country`: Country name
- **Response**: Filtered list of contractors

#### GET `/api/directory/cities`
Get all available cities in the database
- **Response**: Array of city names

### Auth Routes

#### PUT `/api/auth/update-location`
Update user's location based on current IP
- **Headers**: Authorization token required
- **Response**: Updated location information

## Geolocation Service

The system uses `geoip-lite` package for IP-based geolocation:

```javascript
const { getUserLocation } = require('../services/geolocationService');

// Get user location from request
const userLocation = getUserLocation(req);
```

### Features:
- Automatic IP detection from various headers
- Fallback handling for localhost/private IPs
- Error handling for geolocation failures

## Frontend Integration

### Location Service Hook
```javascript
import { useLocationService } from '../services/locationService';

const { 
  getLocalContractors, 
  getNearbyContractors, 
  searchContractors,
  updateUserLocation 
} = useLocationService();
```

### LocalContractorsSearch Component
A React component that provides:
- Three search modes: Near Me, By City, Advanced Search
- Automatic location detection
- Contractor results display
- Responsive design

## Installation & Setup

### Backend Dependencies
```bash
npm install geoip-lite
```

### Environment Variables
No additional environment variables required for basic functionality.

### Database Migration
Existing users and directory entries will need to have location fields populated. You can:

1. **Manual Update**: Update existing records with location data
2. **Default Values**: Set default location values for existing records
3. **User Input**: Prompt users to enter their location on next login

## Usage Examples

### Finding Local Contractors
```javascript
// Get contractors in user's city
const nearbyContractors = await getNearbyContractors();

// Get contractors in specific city
const localContractors = await getLocalContractors('New York', 'NY', 'US');

// Advanced search
const results = await searchContractors({
  industry: 'Plumbing',
  city: 'Los Angeles',
  state: 'CA'
});
```

### Updating User Location
```javascript
// Update user's location based on current IP
const updatedLocation = await updateUserLocation();
```

## Security Considerations

- IP geolocation is approximate and should not be used for critical security decisions
- Location data is stored in plain text (consider encryption for sensitive applications)
- Validate and sanitize all location inputs

## Error Handling

The system handles various error scenarios:
- IP geolocation failures
- Invalid location data
- Network errors
- Database connection issues

## Performance Notes

- IP geolocation is fast and doesn't require external API calls
- Database queries use case-insensitive regex matching
- Consider adding database indexes on location fields for large datasets

## Future Enhancements

- **GPS Integration**: Use browser geolocation API for more accurate positioning
- **Distance Calculation**: Calculate actual distances between users and contractors
- **Location Validation**: Validate city/state/country combinations
- **Caching**: Cache geolocation results to reduce processing
- **External APIs**: Integrate with Google Maps or similar services for enhanced location data

## Troubleshooting

### Common Issues

1. **Location not detected**: Check if user is behind VPN or proxy
2. **No contractors found**: Verify location data in database
3. **IP detection fails**: Check request headers and network configuration

### Debug Mode
Enable debug logging in the geolocation service:
```javascript
console.log('User IP:', getClientIP(req));
console.log('Detected location:', getUserLocation(req));
```

## Support

For issues or questions about the location system, check:
1. Database connection and schema
2. IP address detection
3. Geolocation service configuration
4. Frontend API calls and error handling 