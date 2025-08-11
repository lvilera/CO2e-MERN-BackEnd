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

    const geo = geoip.lookup(ip);
    
    if (!geo) {
      return {
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown'
      };
    }

    return {
      city: geo.city || 'Unknown',
      state: geo.region || 'Unknown',
      country: geo.country || 'Unknown'
    };
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
  // Check various headers for IP address
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress || 
             req.connection.socket?.remoteAddress ||
             '127.0.0.1';
  
  // Handle IPv6 format
  return ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip;
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