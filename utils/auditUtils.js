const axios = require('axios');

const extractHostname = url => {
    try { return new URL(url).hostname; } catch { return null; }
};

const isGreenHost = async domain => {
    try {
        const res = await axios.get(`https://api.thegreenwebfoundation.org/greencheck/${domain}`);
        return res.data.green;
    } catch {
        return false;
    }
};

// New function to get suggestions based on page weight
const getSuggestions = (totalBytes) => {
    const suggestions = [];
    const minPageWeightKB = 500;
    const maxPageWeightKB = 1500;
    const totalKb = totalBytes / 1024;

    // Base recommendations that are always shown
    suggestions.push(
        'Use a CDN and Caching: A Content Delivery Network (CDN) and caching can significantly reduce data transfer.',
        'Choose Efficient Fonts: Use system fonts or self-host optimized font files to avoid large font transfers.',
        'Choose Green Hosting: Select a hosting provider that uses renewable energy sources.'
    );

    // Recommendations based on page weight thresholds
    if (totalKb > maxPageWeightKB) {
        suggestions.push(
            'Optimize Images and Videos: Use compression tools, choose modern formats like WebP, and resize images to their display dimensions.',
            'Minify Files: Minify your CSS, JavaScript, and HTML to remove unnecessary characters and white space.',
            'Remove Unused Code: Regularly audit your site to remove unused code, plugins, or themes.'
        );
    } else if (totalKb > minPageWeightKB) {
        suggestions.push(
            'Consider Optimizing Images: Use compression tools and resize images for better performance.',
            'Consider Minifying Files: Small optimizations to your CSS and JavaScript can help reduce page weight.'
        );
    } else {
        suggestions.push('Your page weight is well optimized. Great job!');
    }

    return suggestions;
};

module.exports = {
    extractHostname,
    isGreenHost,
    getSuggestions
};