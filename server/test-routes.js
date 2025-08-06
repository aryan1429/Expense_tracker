// server/test-routes.js
const express = require('express');
const router = express.Router();

// A test route to check if routes are working
router.get('/hello', (req, res) => {
  console.log('Test route hit!');
  res.send('Hello from test route!');
});

module.exports = router;
