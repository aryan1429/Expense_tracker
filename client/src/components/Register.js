// client/src/components/Register.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GoogleAuth from './GoogleAuth';
import './Auth.css';

const Register = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();

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

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        console.log('Submitting registration form:', {
            username: formData.username,
            email: formData.email,
            passwordLength: formData.password.length
        });

        const result = await register(formData.username, formData.email, formData.password);
        
        if (!result.success) {
            console.error('Registration failed with message:', result.message);
            // Display more detailed error message if available
            if (result.errors && result.errors.length > 0) {
                setError(result.errors.map(err => err.msg).join(', '));
            } else {
                setError(result.message);
            }
        } else {
            console.log('Registration successful');
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
                <h2>Create an Account</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            minLength="3"
                            maxLength="20"
                        />
                    </div>
                    
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
                            placeholder="Min. 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                
                <div className="form-divider">
                    <span>or sign up with</span>
                </div>
                
                <div className="social-login">
                    <GoogleAuth type="register" />
                </div>
                
                <p className="auth-switch">
                    Already have an account?
                    <span onClick={onSwitchToLogin} className="auth-link">
                        Sign in
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Register;
