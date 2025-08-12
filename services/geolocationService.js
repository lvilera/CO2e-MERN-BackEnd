const geoip = require('geoip-lite');

/**
 * Get location information from IP address using multiple services
 * @param {string} ip - IP address to geolocate
 * @returns {Object} Location object with city, state, country
 */
const getLocationFromIP = async (ip) => {
  try {
    // Handle localhost and private IPs
    if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      // Try to get location from a public IP geolocation service
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          console.log('IP API response:', data);
          return {
            city: data.city || 'Unknown',
            state: data.region || data.region_code || 'Unknown',
            country: data.country_name || data.country_code || 'Unknown'
          };
        }
      } catch (apiError) {
        console.log('IP API failed, trying alternative service:', apiError.message);
        
        // Try alternative service
        try {
          const altResponse = await fetch('https://ipinfo.io/json');
          if (altResponse.ok) {
            const altData = await altResponse.json();
            console.log('IPInfo response:', altData);
            return {
              city: altData.city || 'Unknown',
              state: altData.region || 'Unknown',
              country: altData.country || 'Unknown'
            };
          }
        } catch (altError) {
          console.log('IPInfo also failed:', altError.message);
        }
      }
      
      // If all external services fail, return unknown instead of hardcoded location
      console.log('All external IP services failed, returning unknown location');
      return {
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown'
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

    // Try external IP geolocation service first for better accuracy
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      if (response.ok) {
        const data = await response.json();
        console.log(`IP API response for ${ip}:`, data);
        return {
          city: data.city || 'Unknown',
          state: data.region || data.region_code || 'Unknown',
          country: data.country_name || data.country_code || 'Unknown'
        };
      }
    } catch (apiError) {
      console.log(`IP API failed for ${ip}, falling back to geoip-lite:`, apiError.message);
    }

    // Fallback to geoip-lite
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
const getUserLocation = async (req) => {
  const ip = getClientIP(req);
  return await getLocationFromIP(ip);
};

module.exports = {
  getLocationFromIP,
  getClientIP,
  getUserLocation
}; 