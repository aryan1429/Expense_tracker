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

// MongoDB Connection
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('Error: MONGO_URI environment variable is not defined');
  process.exit(1);
}

// Add SSL options to handle connection issues
const options = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  tlsInsecure: true, // This bypasses SSL validation completely
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

mongoose.connect(uri, options)
  .then(() => {
    console.log("MongoDB database connection established successfully");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
const expensesRouter = require('./routes/expenses');
app.use('/api/expenses', expensesRouter); // All expense routes will be prefixed with /api/expenses

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
