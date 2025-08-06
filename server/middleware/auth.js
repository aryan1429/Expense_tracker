// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
    try {
        console.log('Auth headers received:', req.headers);
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        console.log('Token decoded:', { userId: decoded.userId });
        
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            console.log('No user found with ID:', decoded.userId);
            return res.status(401).json({ message: 'Token is not valid - user not found' });
        }

        console.log('User authenticated:', user.username);
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        res.status(401).json({ message: 'Token is not valid - ' + error.message });
    }
};

module.exports = auth;
