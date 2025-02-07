const path = require('path');

module.exports = {
    port: process.env.PORT || 3000,
    verificationKeyPath: path.join(__dirname, '../../verification_key.json'),
    corsOptions: {
        origin: 'http://localhost:3001',
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
    }
}; 