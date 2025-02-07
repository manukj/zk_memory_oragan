const cors = require('cors');
const express = require('express');

const setupCommonMiddleware = (app) => {
  app.use(cors());
  app.use(express.json());
};

module.exports = setupCommonMiddleware; 