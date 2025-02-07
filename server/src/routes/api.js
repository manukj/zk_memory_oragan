const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// All these routes will be prefixed with /api
router.post('/store', dataController.storeData);
router.get('/data', dataController.getAllData);
router.get('/data/:userId', dataController.getUserData);
router.delete('/data/:userId/:id', dataController.deleteData);

module.exports = router; 