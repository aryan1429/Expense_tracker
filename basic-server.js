// basic-server.js - A minimal server script for testing
const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://expense-tracker-sigma-green.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Print environment variables
console.log('Environment variables:');
console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set ✓' : 'Not set ✗');
console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set ✓' : 'Not set ✗');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✓' : 'Not set ✗');
console.log('- MONGO_URI:', process.env.MONGO_URI ? 'Set ✓' : 'Not set ✗');
console.log('- CALLBACK_URL:', process.env.CALLBACK_URL || 'Using default');

// Simple test routes
app.get('/api/test', (req, res) => {
  console.log('API test route hit!');
  res.json({ status: 'OK', message: 'API is working correctly' });
});

app.get('/api/test/', (req, res) => {
  console.log('API test route with trailing slash hit!');
  res.json({ status: 'OK', message: 'API is working correctly' });
});

app.get('/api/auth/google-test', (req, res) => {
  console.log('Google test route hit');
  res.json({ status: 'OK', message: 'Google Auth test route working!' });
});

app.get('/api/test-direct', (req, res) => {
  console.log('Direct test route hit!');
  res.json({ status: 'OK', message: 'Direct test route is working' });
});

app.get('/api/google-auth-check', (req, res) => {
  const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  console.log('Google Auth check: Configured =', googleConfigured);
  res.json({ 
    configured: googleConfigured,
    callbackUrl: process.env.CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Basic test server is running on port: ${port}`);
  console.log('Available test endpoints:');
  console.log('- http://localhost:5000/api/test');
  console.log('- http://localhost:5000/api/test/');
  console.log('- http://localhost:5000/api/auth/google-test');
  console.log('- http://localhost:5000/api/test-direct');
  console.log('- http://localhost:5000/api/google-auth-check');
});
