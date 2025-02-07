const express = require('express');
const setupCommonMiddleware = require('./middleware/common');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Setup middleware
setupCommonMiddleware(app);

// Setup routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 