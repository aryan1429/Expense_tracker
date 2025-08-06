// server/routes/googleAuth.js
const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Test routes to verify routing is working
router.get('/google-test', (req, res) => {
  console.log('Google test route hit');
  res.send('Google Auth test route working!');
});

// Simple route without passport to test if basic routes work
router.get('/simple-test', (req, res) => {
  console.log('Simple test route hit');
  res.send('Simple test route working - no passport involved!');
});

// Initialize Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('Google auth route hit');
  console.log('Query parameters:', req.query);
  
  // Generate a unique identifier for this auth attempt if not provided
  const uniqueId = req.query.unique || Math.random().toString(36).substring(2, 15);
  
  // Set auth options with parameters from the client
  const authOptions = { 
    scope: ['profile', 'email'],
    // Always include the client URL and unique ID in state so we can handle cancellation
    state: Buffer.from(JSON.stringify({
      clientURL: process.env.NODE_ENV === 'production' 
        ? 'https://expense-tracker-sigma-green.vercel.app'
        : 'http://localhost:3000',
      uniqueId: uniqueId,
      // Track if this is a force selection after logout
      forceSelection: req.query.force_selection === 'true'
    })).toString('base64'),
    // Default to online access (no refresh tokens)
    accessType: 'online',
    // Default to not include previously granted scopes
    includeGrantedScopes: false,
    // Always force prompt to select account
    prompt: 'select_account'
  };
  
  // Override accessType if specified in the query
  if (req.query.access_type) {
    authOptions.accessType = req.query.access_type;
  }
  
  // Override includeGrantedScopes if specified in the query
  if (req.query.include_granted_scopes) {
    authOptions.includeGrantedScopes = req.query.include_granted_scopes === 'true';
  }
  
  // If login_hint is provided, use it (empty string clears previous hints)
  if (req.query.login_hint !== undefined) {
    authOptions.loginHint = req.query.login_hint;
  }
  
  // If authuser parameter is specified, add it (especially for select_account)
  if (req.query.authuser) {
    authOptions.authuser = req.query.authuser;
  }
  
  // If approval_prompt is specified, add it
  if (req.query.approval_prompt) {
    authOptions.approvalPrompt = req.query.approval_prompt;
  }
  
  console.log('Auth options:', authOptions);
  
  // For force selection, set prompt to select_account explicitly
  if (req.query.force_selection === 'true') {
    authOptions.prompt = 'select_account';
    
    // Also ensure we're clearing any user approval history
    authOptions.approvalPrompt = 'force';
    
    console.log('Force selection enabled for this authentication attempt');
  }
  
  passport.authenticate('google', authOptions)(req, res, next);
});

// Handle Google auth cancellation
router.get('/google/cancel', (req, res) => {
  console.log('Google auth cancellation route hit');
  
  let clientURL = 'http://localhost:3000';
  
  // Try to get client URL from state if available
  try {
    if (req.query.state) {
      const stateData = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
      if (stateData.clientURL) {
        clientURL = stateData.clientURL;
      }
    }
  } catch (error) {
    console.error('Error parsing state from cancel request:', error);
  }
  
  // Set CORS headers to allow communication between windows
  res.header('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Send HTML that will send a cancellation message and close
  res.send(`
    <html>
      <head>
        <title>Authentication Cancelled</title>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage(
                { canceled: true }, 
                "${clientURL}"
              );
              console.log('Cancellation message posted to opener');
            } else {
              console.error('No opener found for cancellation');
            }
          } catch(e) {
            console.error('Error posting cancellation message:', e);
          }
          
          // Close after a short delay
          setTimeout(function() {
            window.close();
          }, 1000);
        </script>
      </head>
      <body>
        <p>Authentication was cancelled. This window will close automatically.</p>
      </body>
    </html>
  `);
});

// Google OAuth callback
router.get('/google/callback', 
  // Authenticate without sessions, ensure account selection happens every time
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: '/api/auth/google/cancel'
  }),
  (req, res) => {
    try {
      console.log('Google auth callback successful');
      
      // Create JWT token
      const token = jwt.sign(
        { userId: req.user._id }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      // Clear Google auth cookies from the response
      res.clearCookie('connect.sid');
      
      // Set headers to ensure page isn't cached
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Get client URL from state if available
      let clientURL = process.env.NODE_ENV === 'production' 
        ? 'https://expense-tracker-sigma-green.vercel.app'
        : 'http://localhost:3000';
      
      // Try to extract client URL from state
      try {
        if (req.query.state) {
          const stateData = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
          if (stateData.clientURL) {
            clientURL = stateData.clientURL;
          }
        }
      } catch (error) {
        console.error('Error parsing state data:', error);
      }

      // Create a user object with necessary fields
      const userObject = {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      };
      
      // Add profile picture if available
      if (req.user.profilePicture) {
        userObject.profilePicture = req.user.profilePicture;
      }
      
      // Set CORS headers to allow communication between windows
      res.header('Cross-Origin-Opener-Policy', 'unsafe-none');
      res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
      
      // Clear any existing Google auth cookies
      res.clearCookie('connect.sid');
      
      // Check if this was a force selection after logout
      let forceSelection = false;
      try {
        if (req.query.state) {
          const stateData = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
          if (stateData.forceSelection) {
            forceSelection = true;
            console.log('Detected force selection flag, ensuring cookies are cleared');
          }
        }
      } catch (error) {
        console.error('Error parsing force selection state:', error);
      }

      // Redirect to frontend with token (using a temporary page that will redirect with the token)
      res.send(`
        <html>
          <head>
            <title>Authentication Successful</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                max-width: 500px;
                margin: 30px auto;
                text-align: center;
                line-height: 1.6;
              }
              .button {
                display: inline-block;
                background-color: #4285F4;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 4px;
                margin-top: 20px;
              }
              .button:hover {
                background-color: #357AE8;
              }
              .button-secondary {
                display: inline-block;
                background-color: #757575;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 4px;
                margin-top: 10px;
                margin-left: 10px;
              }
              .button-secondary:hover {
                background-color: #616161;
              }
              .button-row {
                display: flex;
                justify-content: center;
                margin-top: 20px;
              }
            </style>
            <script>
              // Clear Google's session cookies for just your site domain
              function clearGoogleSiteSpecificCookies() {
                // Get current domain
                const domain = window.location.hostname;
                
                // List of Google auth-related cookies to clear
                const googleCookies = [
                  'SID', 'HSID', 'SSID', 'APISID', 'SAPISID', 'LSID', 
                  '__Secure-1PSID', '__Secure-3PSID', '__Secure-OSID',
                  'NID', 'SNID', '1P_JAR', 'AEC'
                ];
                
                // Remove each cookie for this domain
                googleCookies.forEach(cookieName => {
                  document.cookie = cookieName + '=; path=/; domain=' + domain + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                });
                
                console.log('Cleared Google cookies for ' + domain);
              }
              
              // Post the auth data to the parent window
              try {
                if (window.opener) {
                  // If this was a force selection (after logout), clear site cookies
                  if (${forceSelection}) {
                    clearGoogleSiteSpecificCookies();
                  }
                  
                  window.opener.postMessage(
                    { token: "${token}", user: ${JSON.stringify(userObject)} }, 
                    "${clientURL}"
                  );
                  console.log('Message posted to opener');
                } else {
                  console.error('No opener found');
                }
              } catch(e) {
                console.error('Error posting message:', e);
              }
              
              // Close after a short delay to ensure message is sent
              setTimeout(function() {
                window.close();
              }, 1000);
              
              function useAnotherAccount() {
                // Clear the cookies first
                clearGoogleSiteSpecificCookies();
                // Then navigate to Google's "Choose an Account" page
                window.location.href = "https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID || 'your-client-id'}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback')}&response_type=code&scope=profile%20email&prompt=select_account";
                return false;
              }
              
              function signOutCompletely() {
                // Navigate to Google's logout page, which will sign out of all Google accounts
                window.location.href = "https://accounts.google.com/Logout";
                return false;
              }
            </script>
          </head>
          <body>
            <h2>Authentication Successful</h2>
            <p>You've been successfully signed in as: <strong>${req.user.name}</strong></p>
            <p>This window will close automatically in a moment.</p>
            <p>If this window doesn't close automatically, you can close it manually and return to the application.</p>
            <div class="button-row">
              <a href="#" onclick="return useAnotherAccount();" class="button">Use a different account</a>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).send('Authentication failed');
    }
  }
);

module.exports = router;
