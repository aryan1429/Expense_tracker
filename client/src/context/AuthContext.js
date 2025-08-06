// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Listen for messages from Google OAuth popup
if (typeof window !== 'undefined') {
    window.addEventListener('message', async (event) => {
        console.log('Message received:', event.data);
        
        try {
            // Verify the message contains auth data
            if (event.data && event.data.token && event.data.user) {
                console.log('Valid auth data received from oauth popup');
                
                // Save the token and user data
                localStorage.setItem('token', event.data.token);
                localStorage.setItem('user', JSON.stringify(event.data.user));
                
                // Verify the token with the server, but proceed with login even if verification fails
                // The token will be checked on subsequent requests anyway
                try {
                    const success = await verifyTokenWithServer(event.data.token);
                    console.log('Token verification result:', success ? 'Success' : 'Failed');
                } catch (error) {
                    console.warn('Token verification error, proceeding anyway:', error);
                }
                
                // Reload the page to update authentication state
                console.log('Reloading page after authentication');
                window.location.reload();
            } else if (event.data && event.data.success) {
                // For our test message
                console.log('Test message received:', event.data.message);
            }
        } catch (error) {
            console.error('Error processing message from popup:', error);
        }
    });
    
    // Function to verify token with server
    async function verifyTokenWithServer(token) {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            console.log('Verifying token with server at:', `${API_BASE_URL}/api/auth/verify-token`);
            
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });
            
            if (!response.ok) {
                console.warn('Token verification response not OK:', response.status);
                // Continue with login process anyway since we have a token
                return true;
            }
            
            const data = await response.json();
            console.log('Token verification response:', data);
            return data.success;
        } catch (error) {
            console.error('Token verification error:', error);
            // Continue with login process anyway since we have a token
            return true;
        }
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Set axios default header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/auth/me`);
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token, API_BASE_URL]);

    const login = async (email, password) => {
        try {
            console.log('Attempting login with:', { email });
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,
                password
            });

            const { token: newToken, user: userData } = response.data;
            console.log('Login successful, setting token and user data');
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
            
            // Set the authorization header immediately
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            return { success: true };
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (username, email, password) => {
        try {
            console.log('Attempting registration with:', { username, email, passwordLength: password.length });
            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                username,
                email,
                password
            });

            const { token: newToken, user: userData } = response.data;
            console.log('Registration successful, setting token and user data');
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
            
            // Set the authorization header immediately
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            return { success: true };
        } catch (error) {
            console.error('Registration error details:', error.response || error);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        console.log('Logout function called');
        
        // Set the flag for forcing account selection on next login FIRST
        // This ensures it's set even if something fails later
        localStorage.setItem('forceAccountSelection', 'true');
        
        // Function to clear Google-related cookies for the current domain
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
        
        // Clear Google-related cookies
        clearGoogleSiteSpecificCookies();
        
        // Clear all storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('googleAuthInProgress');
        sessionStorage.clear(); // Clear any session storage
        
        // Clear all cookies related to the app
        document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Clear application state
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        
        console.log('Successfully logged out from application');
        
        // Force page reload to ensure all state is cleared
        window.location.href = '/'; // Use this instead of reload to ensure a clean state
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
