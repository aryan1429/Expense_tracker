# Expense Tracker Application

A full-stack application for tracking personal expenses with Google OAuth authentication.

## Features

- User authentication with email/password and Google OAuth
- Track expenses with categories
- Expense visualization with charts
- Secure API with JWT authentication
- Responsive design for mobile and desktop

## Prerequisites

- Node.js (version 14 or higher recommended)
- MongoDB (either local installation or MongoDB Atlas account)
- Google OAuth credentials (for production use)

## Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/aryan1429/Expense_tracker.git
   cd Expense_tracker
   ```

2. Create environment files:
   - Copy `.env.example` to `.env` in the root directory
   - Copy `client/.env.example` to `client/.env`

3. Fill in your environment variables:
   - MongoDB connection string
   - JWT secret (can be any secure random string)
   - Google OAuth credentials (for production)
   - Other configuration options

## Installation

1. Install all dependencies with a single command:
   ```bash
   npm run install-all
   ```

2. Start both the client and server:
   ```bash
   npm run dev
   ```

## Development vs Production

### Development Mode
- Uses `.env` files for configuration
- Includes mock OAuth server for testing without Google credentials
- Runs on localhost with hot reloading

### Production Mode
- Requires valid Google OAuth credentials
- Set NODE_ENV=production in your environment
- Configure proper security settings

## GitHub & Deployment

### Pushing to GitHub
When pushing to GitHub, make sure:
- No `.env` files are included (they should be ignored by `.gitignore`)
- No node_modules directories are included
- Use only `.env.example` files for configuration reference

### Deployment
This application can be deployed to platforms like:
- Vercel (frontend)
- Heroku (backend)
- MongoDB Atlas (database)

## Troubleshooting Server Connection Issues

If you encounter 404 errors or server connection problems, you can use the following scripts:

1. Check if the server is running and start it if needed:
   ```powershell
   # Windows PowerShell
   node .\server\checkAndStartServer.js
   ```

2. Run the client and server together with automated checks:
   ```powershell
   # Windows PowerShell
   .\run-dev.ps1
   ```

3. Test server endpoints directly:
   - http://localhost:5000/api/test
   - http://localhost:5000/api/test/check-env
   - http://localhost:5000/api/test/server-info
   - http://localhost:5000/api/test-direct
   ```

   This will launch:
   - The mock OAuth server on http://localhost:5000
   - The React client on http://localhost:3000

3. Test the Google Sign-In by clicking the Google button on the login page

### How the Mock OAuth Server Works

The simplified OAuth server (`server/simplified-oauth-server.js`) simulates the Google OAuth flow:

1. When you click the Google sign-in button, a popup window opens
2. The mock server returns a successful authentication page
3. The popup window sends authentication data back to the main application
4. Your application receives and processes this data just like it would with a real Google OAuth flow
   ```

### Mock OAuth Endpoints

The mock server provides the following endpoints:

- **`/api/auth/google`**: Main entry point for Google OAuth simulation
- **`/api/auth/google/callback`**: Simulated OAuth callback endpoint
- **`/api/auth/verify-token`**: Endpoint to verify received auth tokens
- **`/api/user/profile`**: Protected endpoint that returns mock user data

### Development Options

#### Option 1: All-in-one Development Mode

```bash
npm run dev
```

This starts both the client and mock OAuth server in a single terminal with color-coded output.

#### Option 2: Separate Terminals

Terminal 1 (Mock Server):
```bash
npm run server
```

Terminal 2 (React Client):
```bash
npm run client
```

### Testing Your OAuth Implementation

1. Navigate to http://localhost:3000
2. Click the Google sign-in button
3. The mock OAuth popup will appear and automatically authenticate
4. The popup will close and you'll be logged in

### Customizing the Mock Server

You can modify `server/simplified-oauth-server.js` to:

- Change the mock user data returned
- Add delays to simulate network latency
- Test error conditions
- Add additional mock endpoints

### Transitioning to Real Google OAuth

When you're ready to use real Google OAuth:

1. Create a Google Cloud Project and OAuth 2.0 credentials
2. Replace the mock server with a real implementation (using Passport.js)
3. Update the client to use the real OAuth endpoints

### Troubleshooting Mock OAuth

#### Popup Blocked

If the authentication popup is blocked:
1. Check your browser's popup blocker settings
2. Allow popups from localhost
3. Try again

#### Authentication Not Working

If the authentication flow isn't completing:
1. Check browser console for errors
2. Verify that the mock server is running (http://localhost:5000/api/test)
3. Check that CORS is properly configured

- SSL/TLS errors:
  - Try adding `tlsInsecure: true` to the connection options (not recommended for production)
  - Check if you're behind a corporate firewall that might be interfering with SSL connections
  - Add `?ssl=true&tlsAllowInvalidCertificates=true` to your connection string for testing
  - For Render deployment, ensure SSL settings are compatible with Render's infrastructure

### Deployment

For deployment on Render:

1. Create a new Web Service on Render
2. Connect your repository
3. Set the following environment variables in Render:
   - `MONGO_URI`: Your MongoDB connection string
   - `NODE_VERSION`: 18.18.0
4. Set build command to: `npm install`
5. Set start command to: `node server/server.js`
