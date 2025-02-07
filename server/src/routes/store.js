const express = require('express');
const router = express.Router();

// Store variable in memory (Note: This will reset when server restarts)
let storedString = '';

// POST endpoint to store a string
router.post('/', (req, res) => {
  const { data } = req.body;

  if (!data || typeof data !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid string in the data field' });
  }

  storedString = data;
  res.json({ message: 'String stored successfully', data: storedString });
});

module.exports = router; 