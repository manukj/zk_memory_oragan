const express = require('express');
const router = express.Router();
const snarkjs = require('snarkjs');

// Store variable in memory (Note: This will reset when server restarts)
let storedString = '';

// POST endpoint to store a string with verification
router.post('/', async (req, res) => {
  const { data, proof, publicSignals, signature, message } = req.body;
  
  if (!data || typeof data !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid string in the data field' });
  }

  if (!proof || !publicSignals || !signature || !message) {
    return res.status(400).json({ error: 'Missing proof data' });
  }

  try {
    // Verify the proof
    const vKey = require('../circuits/verification_key.json');
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid proof' });
    }

    // If proof is valid, store the data
    storedString = data;
    res.json({ 
      message: 'Data verified and stored successfully', 
      data: storedString 
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Proof verification failed' });
  }
});

module.exports = router; 