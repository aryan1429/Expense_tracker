// client/src/components/GoogleAuth.js
import React, { useState, useEffect } from 'react';

// Helper function to clear Google cookies for the current domain
const clearGoogleSiteSpecificCookies = () => {
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
};

const GoogleAuth = ({ type }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Check if server is available on component mount (just for logging)
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    console.log('Checking server availability at:', apiUrl);
    
    // Check if we need to force account selection (user has logged out)
    const forceSelection = localStorage.getItem('forceAccountSelection') === 'true';
    if (forceSelection) {
      console.log('Found forceAccountSelection flag in storage');
      localStorage.removeItem('forceAccountSelection');
      
      // For Google sign-out, first clear any Google authentication cookies for this site
      clearGoogleSiteSpecificCookies();
      console.log('Cleared Google site-specific cookies due to previous logout');
    }
    
    // Try multiple endpoints to see if any respond
    const testEndpoints = [
      '/api/auth/google-test', 
      '/api/auth/simple-test', 
      '/api/google-auth-check',
      '/api/test-direct'  // Direct test endpoint in server.js
    ];
    
    // Try each endpoint
    const checkEndpoint = (index) => {
      if (index >= testEndpoints.length) {
        console.log('Server check complete - unable to connect to test endpoints, will try direct connection');
        // Even if test endpoints fail, we'll still try the actual Google auth when the button is clicked
        return;
      }
      
      const endpoint = testEndpoints[index];
      console.log(`Trying endpoint: ${apiUrl}${endpoint}`);
      
      // Add a timeout to prevent hanging connections
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      fetch(`${apiUrl}${endpoint}`, { 
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      })
        .then(response => {
          if (response.ok) {
            console.log(`Server endpoint ${endpoint} is available`);
            if (endpoint === '/api/auth/google-test') {
              console.log('Google Auth endpoint is available');
            }
            return;
          } else {
            console.log(`Server endpoint ${endpoint} responded with status:`, response.status);
            // Try the next endpoint
            checkEndpoint(index + 1);
          }
        })
        .catch(error => {
          if (error.name === 'AbortError') {
            console.log(`Request to ${endpoint} timed out. Server might be slow to respond.`);
          } else {
            console.log(`Error accessing ${endpoint}:`, error);
          }
          // Try the next endpoint
          checkEndpoint(index + 1);
        });
    };
    
    // Start checking endpoints
    checkEndpoint(0);
  }, []);

  const handleGoogleLogin = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Before opening a new auth window, clear any potential tokens that might affect the auth flow
    localStorage.removeItem('googleAuthInProgress');
    
    // Open the Google OAuth flow in a popup window
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // Get the API URL from environment or use the default
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    console.log('Opening Google Auth popup to:', `${apiUrl}/api/auth/google`);
    
    // Mark that auth is in progress with timestamp
    localStorage.setItem('googleAuthInProgress', Date.now().toString());
    
    // Check if we need to force account selection (user has logged out)
    const forceSelection = localStorage.getItem('forceAccountSelection') === 'true';
    if (forceSelection) {
      console.log('Forcing Google account selection due to previous logout');
      localStorage.removeItem('forceAccountSelection');
      
      // For Google sign-out, first clear any Google authentication cookies for this site
      clearGoogleSiteSpecificCookies();
    }
    
    // Use the helper function to open the popup
    openAuthPopup(apiUrl, width, height, left, top, forceSelection || true); // Always force selection for better UX
  };

  // Helper function to handle popup window interaction and message events
  const handlePopupInteraction = (popup, uniqueId, width, height, left, top) => {
    // Check if popup was blocked
    if (!popup) {
      console.error('Popup blocked or could not be opened');
      alert('Please enable popups for this website to use Google Sign In');
      setIsLoading(false);
      return;
    }
    
    // Listen for messages from the popup
    window.addEventListener('message', function authListener(event) {
      // Verify origin to prevent XSS
      const clientURL = process.env.REACT_APP_CLIENT_URL || 'http://localhost:3000';
      const serverURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Accept messages from either our client or server URL
      if (event.origin !== clientURL && event.origin !== serverURL) {
        return;
      }
      
      // Check if the message contains authentication data
      if (event.data && event.data.token) {
        console.log('Received auth data from popup');
        
        if (!authCompleted.current) {
          // Store the token and user data to match AuthContext
          localStorage.setItem('token', event.data.token);
          if (event.data.user) {
            localStorage.setItem('user', JSON.stringify(event.data.user));
          }
          
          // Mark auth as completed
          authCompleted.current = true;
          
          // Clean up
          window.removeEventListener('message', authListener);
          clearInterval(popupCheckInterval);
          setIsLoading(false);
          
          // Redirect or update UI as needed
          window.location.reload();
        }
      } else if (event.data && event.data.canceled) {
        console.log('Authentication was canceled');
        
        if (!authCompleted.current) {
          // Mark auth as completed
          authCompleted.current = true;
          
          // Clean up
          window.removeEventListener('message', authListener);
          clearInterval(popupCheckInterval);
          setIsLoading(false);
        }
      }
    });
    
    // Check if popup closes without sending a message (e.g., user closes the popup)
    // We use a reference to track if auth is completed to avoid duplicate state updates
    const authCompleted = { current: false };
    
    const popupCheckInterval = setInterval(() => {
      try {
        // We'll try to access popup properties, but this might fail due to COOP
        // Instead of checking popup.closed directly, we'll use a more robust approach
        if (!popup) {
          // Popup reference is lost
          if (!authCompleted.current) {
            console.log('Auth popup reference lost');
            clearInterval(popupCheckInterval);
            setIsLoading(false);
            authCompleted.current = true;
          }
        } else {
          // Try to detect if the popup is closed without directly accessing .closed
          try {
            // Try to access popup location - this will throw if popup is closed
            // We don't actually need to use the result, just see if it throws
            popup.location.href; // eslint-disable-line no-unused-expressions
          } catch (e) {
            // Error when trying to access popup - likely closed
            if (!authCompleted.current) {
              console.log('Auth popup was closed without completing authentication');
              clearInterval(popupCheckInterval);
              setIsLoading(false);
              authCompleted.current = true;
            }
          }
        }
      } catch (e) {
        // Any other error, clear the interval and reset loading state
        console.log('Error checking popup state:', e.message);
        if (!authCompleted.current) {
          clearInterval(popupCheckInterval);
          setIsLoading(false);
          authCompleted.current = true;
        }
      }
    }, 1000);
    
    // Set a timeout to handle cases where the popup may be closed without sending a message
    setTimeout(() => {
      if (!authCompleted.current) {
        console.log('Auth flow timed out after 60 seconds');
        clearInterval(popupCheckInterval);
        setIsLoading(false);
        authCompleted.current = true;
        
        // Try to close the popup if it's still open
        try {
          if (popup) {
            popup.close();
          }
        } catch (e) {
          console.error('Error closing popup after timeout:', e.message);
        }
      }
    }, 60000);
  };
  
  // Helper function to open the auth popup
  const openAuthPopup = (apiUrl, width, height, left, top, forceSelection = false) => {
    try {
      // Generate a unique identifier for this auth attempt
      const uniqueId = Math.random().toString(36).substring(2, 15);
      
      // Generate a unique window name to prevent reuse of existing windows
      const popupName = `GoogleAuth_${uniqueId}`;
      
      // Add a timeout to prevent hanging connections
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000); // 5 second timeout

      // First check if Google Auth is configured on the server
      fetch(`${apiUrl}/api/google-auth-check`, { signal: controller.signal })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (!data.configured) {
            console.log('Google Auth check indicates auth is not configured on server');
            // Continue anyway - the server might still work
          } else {
            console.log('Google Auth is configured, opening popup...');
            if (data.callbackUrl) {
              console.log('Callback URL configured as:', data.callbackUrl);
            }
          }
          
          // Create URL with parameters - ALWAYS force account selection
          let authUrl = `${apiUrl}/api/auth/google?prompt=select_account&access_type=online&include_granted_scopes=false&login_hint=&gsiwebsdk=3&unique=${uniqueId}`;
          
          // If we're forcing selection after a logout, add stronger parameters
          if (forceSelection) {
            authUrl = `${apiUrl}/api/auth/google?prompt=select_account&access_type=online&include_granted_scopes=false&login_hint=&gsiwebsdk=3&force_selection=true&unique=${uniqueId}&authuser=select_account&approval_prompt=force`;
          }
          
          const popup = window.open(
            authUrl,
            popupName,
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
          );
          
          handlePopupInteraction(popup, uniqueId, width, height, left, top);
        })
        .catch(error => {
          console.log('Error checking Google Auth configuration, will attempt auth anyway:', error);
          // Continue with auth attempt even if the check fails
          
          // Create URL with parameters - ALWAYS force account selection
          let authUrl = `${apiUrl}/api/auth/google?prompt=select_account&access_type=online&include_granted_scopes=false&login_hint=&gsiwebsdk=3&unique=${uniqueId}`;
          
          if (forceSelection) {
            authUrl = `${apiUrl}/api/auth/google?prompt=select_account&access_type=online&include_granted_scopes=false&login_hint=&gsiwebsdk=3&force_selection=true&unique=${uniqueId}&authuser=select_account&approval_prompt=force`;
          }
          
          const popup = window.open(
            authUrl,
            popupName,
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
          );
          
          handlePopupInteraction(popup, uniqueId, width, height, left, top);
        });
    } catch (error) {
      console.error('Error in Google Auth flow:', error);
      setIsLoading(false);
      alert('An error occurred during authentication. Please check your internet connection and try again.');
    }
  };

  // Google button with text and logo - always clickable
  return (
    <button 
      className={`google-auth-btn ${isLoading ? 'loading' : ''}`}
      title="Sign in with Google"
      onClick={handleGoogleLogin}
      type="button"
    >
      {isLoading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <span className="google-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#DB4437">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>
          </span>
          <span className="google-text">
            {type === "login" ? "Sign in with Google" : "Sign up with Google"}
          </span>
        </>
      )}
    </button>
  );
};

export default GoogleAuth;
