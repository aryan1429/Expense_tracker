// server/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

// Get environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

// Debug environment variables
console.log('Environment variables check:');
console.log('GOOGLE_CLIENT_ID set:', !!GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET set:', !!GOOGLE_CLIENT_SECRET);
console.log('CALLBACK_URL:', CALLBACK_URL);

// Check if Google credentials are properly set
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('WARNING: Google OAuth credentials not set in environment variables!');
  console.error('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
  console.error('Make sure you run the server from the root directory or properly set the path to .env');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err, null);
    });
});

// Only initialize Google Strategy if credentials are available
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      passReqToCallback: true,
      // Add a route for handling cancellation/failure
      failureRedirect: '/api/auth/google/cancel',
      // Don't store auth state between sessions
      store: false,
      // Don't use any session
      session: false
    },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // First, check if user exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // User already exists with this Google account
        return done(null, user);
      }
      
      // Check if user exists with the same email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // User exists but hasn't linked Google yet - update with Google info
        user.googleId = profile.id;
        
        // Update profile picture if available
        if (profile.photos && profile.photos.length > 0) {
          user.profilePicture = profile.photos[0].value;
        }
        
        await user.save();
        return done(null, user);
      } 
      
      // If not, create a new user
      const username = profile.displayName.replace(/\s+/g, '').toLowerCase() + 
        Math.floor(Math.random() * 1000); // Ensure username uniqueness
      
      // Create random password for Google users
      const password = Math.random().toString(36).slice(-10);
      
      // Get profile picture if available
      const profilePicture = profile.photos && profile.photos.length > 0 
        ? profile.photos[0].value 
        : null;
      
      user = new User({
        username: username,
        email: profile.emails[0].value,
        password: password, // This will be hashed by the pre-save hook
        googleId: profile.id, // Store Google ID for future logins
        profilePicture: profilePicture // Store profile picture URL
      });
      
      await user.save();
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));
}

module.exports = passport;
