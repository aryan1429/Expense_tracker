// server/test-server.js
const express = require('express');
const path = require('path');
const cors = require('cors');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Create Express app
const app = express();
const port = 5001; // Using a different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const testRoutes = require('./test-routes');

// Use routes
app.use('/api/test', testRoutes);

// Add a simple test route directly in server file
app.get('/server-test', (req, res) => {
  console.log('Server test route hit');
  res.send('Server is working!');
});

// Start server
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  console.log(`Try accessing: http://localhost:${port}/server-test`);
  console.log(`Try accessing: http://localhost:${port}/api/test/hello`);
});
