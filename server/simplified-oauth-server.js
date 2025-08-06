// Simplified mock server for testing Google OAuth flow
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Log all incoming requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Enable CORS for all routes with extensive options
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'https://expense-tracker-sigma-green.vercel.app'];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not allowed by CORS policy`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set a permissive Content-Security-Policy to allow our inline scripts
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';"
  );
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Test server is running!');
});

// API test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API test route working!' });
});

// Simple auth test route
app.get('/api/auth/simple-test', (req, res) => {
  res.send('Auth test route working!');
});

// Mock Google OAuth route
app.get('/api/auth/google', (req, res) => {
  console.log('Mock Google auth route accessed');
  
  // Immediately simulate the callback for testing
  simulateGoogleCallback(req, res);
});

function simulateGoogleCallback(req, res) {
  console.log('Simulating Google OAuth callback');
  
  // Create a mock JWT token
  const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
  
  // Create a mock user
  const mockUser = {
    id: 'google_user_' + Math.random().toString(36).substring(2),
    username: 'TestUser',
    email: 'testuser@gmail.com',
    profilePicture: 'https://lh3.googleusercontent.com/mock-profile-picture'
  };
  
  // Set content type explicitly
  res.setHeader('Content-Type', 'text/html');
  
  // Send the HTML response that will post a message to the parent window
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentication Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 30px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #4285F4;
          }
          .spinner {
            margin: 20px auto;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4285F4;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Google Authentication Successful</h1>
          <p>Authentication complete! This window will close automatically...</p>
          <div class="spinner"></div>
        </div>
        
        <script>
          // Function to safely post message
          function postMessageToOpener() {
            console.log('Sending auth data to parent window');
            if (window.opener && !window.opener.closed) {
              try {
                window.opener.postMessage({ 
                  token: "${mockToken}", 
                  user: ${JSON.stringify(mockUser)}
                }, "*");
                console.log('Message posted successfully');
              } catch (error) {
                console.error('Error posting message:', error);
              }
            } else {
              console.error('Window opener not available');
            }
            
            // Close this window after a short delay
            setTimeout(() => window.close(), 1500);
          }
          
          // Execute when DOM is fully loaded
          document.addEventListener('DOMContentLoaded', function() {
            // Post the message with a small delay
            setTimeout(postMessageToOpener, 1000);
          });
        </script>
      </body>
    </html>
  `);
}

// Additional mock routes for Google OAuth flow testing

// Mock callback route for Google OAuth
app.get('/api/auth/google/callback', (req, res) => {
  console.log('Mock Google OAuth callback route accessed');
  simulateGoogleCallback(req, res);
});

// Mock route to verify token
app.post('/api/auth/verify-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  // Mock token verification - in a real app this would verify with JWT
  if (token.startsWith('mock_jwt_token_')) {
    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        id: 'google_user_' + Math.random().toString(36).substring(2),
        username: 'TestUser',
        email: 'testuser@gmail.com',
        profilePicture: 'https://lh3.googleusercontent.com/mock-profile-picture'
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Mock user profile endpoint
app.get('/api/user/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token provided'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Mock authentication check
  if (token.startsWith('mock_jwt_token_')) {
    return res.status(200).json({
      success: true,
      user: {
        id: 'google_user_' + Math.random().toString(36).substring(2),
        username: 'TestUser',
        email: 'testuser@gmail.com',
        profilePicture: 'https://lh3.googleusercontent.com/mock-profile-picture',
        preferences: {
          currency: 'USD',
          theme: 'light'
        }
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Catch-all route for handling unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`
  });
});

// Start the server
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  const divider = '='.repeat(50);
  console.log('\n' + divider);
  console.log(`🚀 MOCK OAUTH SERVER RUNNING ON PORT ${port}`);
  console.log(divider);
  console.log('Available test routes:');
  console.log('📌 Basic routes:');
  console.log(`  - http://localhost:${port}/`);
  console.log(`  - http://localhost:${port}/api/test`);
  console.log('\n📌 Auth routes:');
  console.log(`  - http://localhost:${port}/api/auth/simple-test`);
  console.log(`  - http://localhost:${port}/api/auth/google`);
  console.log(`  - http://localhost:${port}/api/auth/google/callback`);
  console.log('\n📌 Protected routes (require Bearer token):');
  console.log(`  - http://localhost:${port}/api/user/profile`);
  console.log('\n📌 POST endpoints:');
  console.log(`  - http://localhost:${port}/api/auth/verify-token`);
  console.log(divider);
  console.log('Press Ctrl+C to stop the server');
  console.log(divider + '\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server has been gracefully terminated');
    process.exit(0);
  });
});
