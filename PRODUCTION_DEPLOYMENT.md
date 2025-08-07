# Production Deployment Checklist

## Updated Configuration

✅ **Environment Variables Updated:**
- Backend: `https://expense-tracker-api-s7za.onrender.com`
- Frontend: `https://expense-tracker-sigma-green.vercel.app`
- Callback URL: `https://expense-tracker-api-s7za.onrender.com/api/auth/google/callback`

## Google Cloud Console Configuration ✅

**Authorized JavaScript Origins:**
- ✅ `http://localhost:3000` (for local development)
- ✅ `https://expense-tracker-sigma-green.vercel.app` (Vercel frontend)

**Authorized Redirect URIs:**
- ✅ `https://expense-tracker-api-s7za.onrender.com/api/auth/google/callback` (Render backend)
- ✅ `http://localhost:5000/api/auth/google/callback` (for local development)

## Deployment Steps

### 1. Deploy Backend to Render
```bash
# Make sure your server code is pushed to your GitHub repo
# Render will automatically deploy from your main branch
```

**Render Environment Variables to Set:**
```
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
CALLBACK_URL=https://expense-tracker-api-s7za.onrender.com/api/auth/google/callback
PORT=5000
NODE_ENV=production
```

### 2. Deploy Frontend to Vercel
```bash
# Build command: npm run build
# Output directory: build
```

**Vercel Environment Variables to Set:**
```
REACT_APP_API_URL=https://expense-tracker-api-s7za.onrender.com
REACT_APP_CLIENT_URL=https://expense-tracker-sigma-green.vercel.app
```

### 3. Test Production OAuth Flow

Use the updated `oauth-test.html` file to test the production OAuth flow.

**Expected Flow:**
1. User clicks "Sign in with Google" on your Vercel app
2. Redirects to Google OAuth
3. User authenticates with Google
4. Google redirects to: `https://expense-tracker-api-s7za.onrender.com/api/auth/google/callback`
5. Your Render server processes the callback and sends JWT back to Vercel frontend

## Important Notes

1. **CORS Configuration**: Make sure your Render server allows requests from your Vercel domain
2. **HTTPS**: Production uses HTTPS, so make sure all URLs are https://
3. **Environment Variables**: Double-check all environment variables are set correctly on both platforms
4. **Build Process**: Make sure both frontend and backend build successfully

## Testing Checklist

- [ ] Render server is running and accessible
- [ ] Vercel frontend is deployed and accessible  
- [ ] Google OAuth redirects to the correct callback URL
- [ ] CORS allows communication between Vercel and Render
- [ ] JWT tokens are properly generated and validated
- [ ] User data is stored in MongoDB correctly

## Troubleshooting

**If OAuth fails:**
1. Check Render server logs for errors
2. Verify Google Cloud Console redirect URIs
3. Test the callback URL directly: `https://expense-tracker-api-s7za.onrender.com/api/auth/google-test`
4. Check CORS configuration

**If CORS errors occur:**
- Verify your server allows requests from `https://expense-tracker-sigma-green.vercel.app`
- Check the CORS middleware configuration in your Express server
