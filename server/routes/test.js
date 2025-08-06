// server/routes/test.js
const router = require('express').Router();

// Add a root route for simple API test with logging
router.get('/', (req, res) => {
  console.log('API test route hit!');
  res.json({ status: 'OK', message: 'API is working correctly' });
});

// Detailed environment check
router.get('/check-env', (req, res) => {
  const env = {
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
    callbackUrl: process.env.CALLBACK_URL || 'Using default',
    mongoUri: process.env.MONGO_URI ? 'Set' : 'Not set',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
    nodeEnv: process.env.NODE_ENV || 'Not set',
    port: process.env.PORT || '5000 (default)'
  };
  
  console.log('Environment variables check:', env);
  res.json(env);
});

// Add detailed server info route
router.get('/server-info', (req, res) => {
  const info = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime() + ' seconds',
    nodeVersion: process.version,
    platform: process.platform,
    memory: process.memoryUsage(),
    cors: {
      enabled: true,
      origins: [
        'http://localhost:3000',
        'https://expense-tracker-sigma-green.vercel.app'
      ]
    }
  };
  
  console.log('Server info requested');
  res.json(info);
});

module.exports = router;
