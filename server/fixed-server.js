// server/fixed-server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Create express app first
const app = express();
const port = process.env.PORT || 5000;

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Add simple test routes before loading complex dependencies
app.get('/server-test', (req, res) => {
  res.send('Server is working!');
});

// Configure middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://expense-tracker-sigma-green.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Now load passport after environment variables and basic configuration
const passport = require('./config/passport');

// Initialize Passport
app.use(passport.initialize());

// Debug passport
console.log('Passport initialized:', !!passport);
console.log('Google strategy registered:', !!passport._strategies && !!passport._strategies.google);

// Register routes
const expensesRouter = require('./routes/expenses');
const authRouter = require('./routes/auth');
const googleAuthRouter = require('./routes/googleAuth');
const testRouter = require('./routes/test');

app.use('/api/expenses', expensesRouter); 
app.use('/api/auth', authRouter);
app.use('/api/auth', googleAuthRouter);
app.use('/api/test', testRouter);

// Add a debug route that's defined right in this file
app.get('/api/direct-test', (req, res) => {
  res.send('Direct test route is working!');
});

// Content Security Policy Middleware
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https:;");
  next();
});

// MongoDB Connection
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('Error: MONGO_URI environment variable is not defined');
  process.exit(1);
}

// Connection options
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
};

// Connect to MongoDB
const connectWithRetry = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(uri, options);
    console.log("MongoDB database connection established successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Connection event handlers
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
  console.log(`Test these routes:`);
  console.log(`- http://localhost:${port}/server-test`);
  console.log(`- http://localhost:${port}/api/direct-test`);
  console.log(`- http://localhost:${port}/api/test/check-env`);
  console.log(`- http://localhost:${port}/api/auth/simple-test`);
});
