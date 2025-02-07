const { corsOptions } = require('../config');

module.exports = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', corsOptions.origin);
    res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
}; 