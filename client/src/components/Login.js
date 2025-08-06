// client/src/components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GoogleAuth from './GoogleAuth';
import './Auth.css';

const Login = ({ onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user starts typing
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);
        
        if (!result.success) {
            setError(result.message);
        }
        
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="auth-logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5b86e5" width="48" height="48">
                        <path d="M19 5c-1.5 0-2.8 1.1-3 2.5V8c0 1.1-.9 2-2 2H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-7 12H5v-2h7v2zm7 0h-4v-2h4v2zm0-4H5v-2h14v2z" />
                    </svg>
                </div>
                <h2>Welcome Back!</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="form-divider">
                    <span>or continue with</span>
                </div>
                
                <div className="social-login">
                    <GoogleAuth type="login" />
                </div>
                
                <p className="auth-switch">
                    Don't have an account?
                    <span onClick={onSwitchToRegister} className="auth-link">
                        Sign up
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
