// verify-env.js - Script to verify environment variables are loaded correctly
const path = require('path');
const fs = require('fs');

console.log('Environment Variable Verification');
console.log('=================================');

// Check if .env file exists in the root
const rootEnvPath = path.resolve(__dirname, '.env');
console.log(`.env file in root directory: ${fs.existsSync(rootEnvPath) ? 'Exists ✅' : 'Missing ❌'}`);

// Load environment variables
require('dotenv').config({ path: rootEnvPath });

// Check critical environment variables
const criticalVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'CALLBACK_URL'
];

const allVarsSet = criticalVars.every(varName => {
  const isSet = !!process.env[varName];
  console.log(`${varName}: ${isSet ? 'Set ✅' : 'Not set ❌'}`);
  return isSet;
});

if (allVarsSet) {
  console.log('\nAll environment variables are set correctly! ✅');
  
  // Additional information
  console.log('\nMongoDB Connection:');
  console.log(`Using: ${process.env.MONGO_URI.substring(0, 20)}...`);
  
  console.log('\nGoogle OAuth:');
  console.log(`Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...`);
  console.log(`Callback URL: ${process.env.CALLBACK_URL}`);
} else {
  console.log('\nSome environment variables are missing! ❌');
  console.log('Please ensure all required variables are set in the .env file.');
}

console.log('\n=================================');
