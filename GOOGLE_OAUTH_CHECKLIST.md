# Google Cloud Console OAuth Configuration Checklist

## Current Credentials:
- **Client ID:** your_google_client_id_here
- **Client Secret:** your_google_client_secret_here
- **Redirect URI:** https://expense-tracker-api-s7za.onrender.com/api/auth/google/callback

## Steps to Fix "Error 401: invalid_client":

### 1. Verify Google Cloud Console Setup
Go to: https://console.cloud.google.com/apis/credentials

### 2. Check OAuth 2.0 Client IDs
- Find your client ID: `808088398374-um39euf77vcdggqp0desf15ci72bp6u3.apps.googleusercontent.com`
- Click on it to edit

### 3. Verify Authorized Redirect URIs
**MUST include EXACTLY:**
```
http://localhost:5000/api/auth/google/callback
```

### 4. Verify Authorized JavaScript Origins
**MUST include:**
```
http://localhost:3000
http://localhost:5000
```

### 5. Check Application Type
- Should be: **Web application**

### 6. Verify OAuth Consent Screen
- Go to "OAuth consent screen" in the left menu
- Make sure it's configured with:
  - Application name
  - User support email
  - Developer contact email
- Status should be: **Testing** or **Published**

### 7. Common Issues that cause "invalid_client":
- ❌ Missing redirect URI
- ❌ Incorrect redirect URI (case sensitive)
- ❌ Wrong application type (should be "Web application")
- ❌ OAuth consent screen not configured
- ❌ Client credentials don't match the project

### 8. Test URLs to verify:
Direct OAuth URL (try this in browser):
```
https://accounts.google.com/oauth/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=https%3A%2F%2Fexpense-tracker-api-s7za.onrender.com%2Fapi%2Fauth%2Fgoogle%2Fcallback&scope=profile%20email&response_type=code&access_type=offline&prompt=select_account
```

If this URL gives "invalid_client", the issue is in Google Cloud Console configuration.

### 9. Double-check Project
- Make sure you're looking at the correct Google Cloud Project
- The client ID should belong to the active project

### 10. Screenshot Requirements
Please check and confirm:
- ✅ Redirect URI is exactly: `http://localhost:5000/api/auth/google/callback`
- ✅ JavaScript origins include: `http://localhost:3000` and `http://localhost:5000`
- ✅ Application type is "Web application"
- ✅ OAuth consent screen is configured
