// Simple Express server without Passport for testing
const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('Starting simplified test server...');

// Create express app
const app = express();

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Debug routes
app.get('/', (req, res) => {
  res.send('Server root is working!');
});

// API test routes
app.get('/api/test', (req, res) => {
  console.log('API test route accessed');
  res.send('API test route working!');
});

// Auth test routes
app.get('/api/auth/simple-test', (req, res) => {
  console.log('Auth simple test route accessed');
  res.send('Simple test in auth route working!');
});

// Mock Google OAuth route that simulates successful authentication
app.get('/api/auth/google', (req, res) => {
  console.log('Mock Google auth route hit');
  
  // Create a mock token and user data
  const mockToken = 'mock-jwt-token-' + Date.now();
  const mockUser = {
    id: 'user-' + Date.now(),
    username: 'googleuser',
    email: 'test@gmail.com',
    profilePicture: 'https://via.placeholder.com/150'
  };
  
  // Send a page that posts a message back to the opener
  res.send(`
    <html>
      <head>
        <title>Google Auth Test</title>
        <script>
          console.log('Mock Google Auth callback executing...');
          try {
            if (window.opener) {
              const message = { 
                token: "${mockToken}", 
                user: ${JSON.stringify(mockUser)} 
              };
              console.log('Posting message to opener:', message);
              window.opener.postMessage(message, "*");
              console.log('Message posted successfully');
            } else {
              console.error('No opener found');
            }
          } catch (e) {
            console.error('Error in postMessage:', e);
          }
          
          // Close the window after a short delay
          setTimeout(() => {
            console.log('Closing popup window');
            window.close();
          }, 2000);
        </script>
      </head>
      <body>
        <h1>Google Auth Test</h1>
        <p>Authentication successful! This window will close automatically.</p>
      </body>
    </html>
  `);
});

// Start server
const port = 5000;
app.listen(port, () => {
  console.log(`=== TEST SERVER RUNNING ===`);
  console.log(`Test server running on port ${port}`);
  console.log(`Test these routes in your browser:`);
  console.log(`- http://localhost:${port}/`);
  console.log(`- http://localhost:${port}/api/test`);
  console.log(`- http://localhost:${port}/api/auth/simple-test`);
  console.log(`- http://localhost:${port}/api/auth/google`);
  console.log(`============================`);
});
