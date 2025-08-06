// server/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables first, before requiring passport
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Now require passport after environment variables are loaded
const passport = require('./config/passport');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Debug passport
console.log('Passport initialized:', !!passport);
console.log('Google strategy registered:', !!passport._strategies && !!passport._strategies.google);

// Add direct test routes in server.js for diagnostics
app.get('/server-test', (req, res) => {
  console.log('Direct server test route hit!');
  res.send('Server is working!');
});

app.get('/api/test-direct', (req, res) => {
  console.log('Direct API test route hit!');
  res.json({ 
    status: 'OK', 
    message: 'API is working correctly',
    timestamp: new Date().toISOString()
  });
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://expense-tracker-sigma-green.vercel.app'
  ],
  credentials: true,
  exposedHeaders: ['Cross-Origin-Opener-Policy', 'Cross-Origin-Embedder-Policy']
}));
app.use(express.json()); // Allows us to parse JSON

// Set security headers for OAuth popups to work properly
app.use('/api/auth/google', (req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Initialize Passport
app.use(passport.initialize());

// Routes
const expensesRouter = require('./routes/expenses');
const authRouter = require('./routes/auth');
const googleAuthRouter = require('./routes/googleAuth');
const testRouter = require('./routes/test');

// Add direct test route for debugging
app.get('/api/test-direct', (req, res) => {
  console.log('Direct test route hit!');
  res.json({ status: 'OK', message: 'Direct API test route is working' });
});

// Add route to check if Google Auth is configured
app.get('/api/google-auth-check', (req, res) => {
  const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  console.log('Google Auth check: Configured =', googleConfigured);
  res.json({ 
    configured: googleConfigured,
    callbackUrl: process.env.CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  });
});

app.use('/api/expenses', expensesRouter); // All expense routes will be prefixed with /api/expenses
app.use('/api/auth', authRouter); // All auth routes will be prefixed with /api/auth
app.use('/api/auth', googleAuthRouter); // Google OAuth routes
app.use('/api/test', testRouter); // Test routes

// Content Security Policy Middleware (placed after routes to override any default CSP headers)
app.use((req, res, next) => {
  // Relaxed CSP for auth routes to allow postMessage
  if (req.path.startsWith('/api/auth/google')) {
    res.setHeader("Content-Security-Policy", 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' blob:; " + 
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data:; " +
      "connect-src 'self' https:; " + 
      "frame-ancestors 'self' http://localhost:3000 https://expense-tracker-sigma-green.vercel.app;"
    );
  } else {
    res.setHeader("Content-Security-Policy", 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' blob:; " + 
      "style-src 'self' 'unsafe-inline'; " + 
      "img-src 'self' data:; " + 
      "connect-src 'self' https:;"
    );
  }
  next();
});

// MongoDB Connection
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('Error: MONGO_URI environment variable is not defined');
  console.error('');
  console.error('Please create a .env file in the project root with the following content:');
  console.error('MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority');
  console.error('');
  console.error('For local development, you can use:');
  console.error('MONGO_URI=mongodb://localhost:27017/expenseTracker');
  console.error('');
  console.error('For MongoDB Atlas setup:');
  console.error('1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas');
  console.error('2. Create a new cluster');
  console.error('3. In the Atlas dashboard, go to "Database Access" and add a database user');
  console.error('4. Go to "Network Access" and add your IP address to the whitelist');
  console.error('5. Click "Connect" on your cluster and choose "Connect your application"');
  console.error('6. Copy the connection string and replace the placeholders with your credentials');
  process.exit(1);
}

// Connection options for newer versions of Mongoose (deprecated options removed)
const options = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  // Retry options
  retryWrites: true,
};

// Function to connect to MongoDB with retry mechanism
const connectWithRetry = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(uri, options);
    console.log("MongoDB database connection established successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
  }
};

// Initial connection attempt
connectWithRetry();

// Connection event handlers for better monitoring
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose connection disconnected');
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
