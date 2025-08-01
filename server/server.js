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
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

// Routes
const expensesRouter = require('./routes/expenses');
app.use('/api/expenses', expensesRouter); // All expense routes will be prefixed with /api/expenses

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});