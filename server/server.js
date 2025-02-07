const express = require('express');
const cors = require('./src/middleware/cors');
const errorHandler = require('./src/middleware/errorHandler');
const apiRoutes = require('./src/routes/api');
const { port } = require('./src/config');

const app = express();

// Middleware
app.use(cors);
app.use(express.json());

// Routes with /api prefix
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 