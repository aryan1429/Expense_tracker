// server/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON

// Routes
const expensesRouter = require('./routes/expenses');
app.use('/api/expenses', expensesRouter); // All expense routes will be prefixed with /api/expenses

// Content Security Policy Middleware (placed after routes to override any default CSP headers)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https:;");
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
  // SSL options to handle connection issues
  tls: true,
  tlsInsecure: false,
  // Additional options to handle SSL/TLS errors
  sslValidate: false,
  // Retry options
  retryWrites: true,
  // For Render deployment issues
  directConnection: false,
  connectTimeoutMS: 10000,
  // Handle potential IP whitelisting issues
  useUnifiedTopology: true,
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
