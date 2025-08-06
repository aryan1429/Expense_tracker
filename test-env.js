// test-env.js
// This file checks if environment variables are properly loaded

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

console.log('Environment variables test:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Not set');
console.log('CALLBACK_URL:', process.env.CALLBACK_URL || '(using default)');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not set');
