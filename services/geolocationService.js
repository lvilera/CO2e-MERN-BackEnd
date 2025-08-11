const geoip = require('geoip-lite');

/**
 * Get location information from IP address
 * @param {string} ip - IP address to geolocate
 * @returns {Object} Location object with city, state, country
 */
const getLocationFromIP = (ip) => {
  try {
    // Handle localhost and private IPs
    if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      // Return default location for development/testing
      return {
        city: 'New York',
        state: 'NY',
        country: 'US'
      };
    }

    // Validate IP format
    if (!ip || ip === 'Unknown' || ip === '') {
      return {
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown'
      };
    }

    const geo = geoip.lookup(ip);
    
    if (!geo) {
      console.log(`No geolocation data found for IP: ${ip}`);
      return {
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown'
      };
    }

    const location = {
      city: geo.city || 'Unknown',
      state: geo.region || 'Unknown',
      country: geo.country || 'Unknown'
    };

    console.log(`IP ${ip} resolved to:`, location);
    return location;
  } catch (error) {
    console.error('Error getting location from IP:', error);
    return {
      city: 'Unknown',
      state: 'Unknown',
      country: 'Unknown'
    };
  }
};

/**
 * Extract IP address from request object
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
const getClientIP = (req) => {
  // Check various headers for IP address (Vercel-specific)
  let ip = req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.headers['x-client-ip'] ||
           req.headers['cf-connecting-ip'] || // Cloudflare
           req.headers['x-forwarded'] ||
           req.headers['forwarded-for'] ||
           req.headers['forwarded'] ||
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.connection?.socket?.remoteAddress ||
           '127.0.0.1';
  
  // Handle IPv6 format
  if (ip.includes('::ffff:')) {
    ip = ip.split('::ffff:')[1];
  }
  
  // Handle multiple IPs in x-forwarded-for (take the first one)
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  
  // Clean up the IP
  ip = ip.replace(/[^0-9.]/g, '');
  
  return ip;
};

/**
 * Get user location from request
 * @param {Object} req - Express request object
 * @returns {Object} Location object
 */
const getUserLocation = (req) => {
  const ip = getClientIP(req);
  return getLocationFromIP(ip);
};

module.exports = {
  getLocationFromIP,
  getClientIP,
  getUserLocation
}; 