// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));

// define our second route, which will be: POST /v1/fragments
router.post('/fragments', require('./post'));

// Other routes will go here later on...

module.exports = router;
