// check-server-status.js - Script to test if server is running correctly
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:5000';
const TEST_ENDPOINTS = [
  '/api/test',
  '/api/test/',
  '/api/test-direct',
  '/api/auth/google-test',
  '/api/google-auth-check'
];

console.log('Checking server status...');

// Function to check a single endpoint
function checkEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`Testing ${url}...`);
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log(`✅ ${endpoint}: Success (${res.statusCode})`);
            console.log(`   Response: ${JSON.stringify(parsed)}`);
            resolve(true);
          } catch (e) {
            console.log(`❓ ${endpoint}: Got status 200 but invalid JSON response`);
            resolve(false);
          }
        } else {
          console.log(`❌ ${endpoint}: Failed with status ${res.statusCode}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ ${endpoint}: Error - ${err.message}`);
      resolve(false);
    });
  });
}

// Check all endpoints
async function checkAllEndpoints() {
  let allSuccess = true;
  
  for (const endpoint of TEST_ENDPOINTS) {
    const success = await checkEndpoint(endpoint);
    if (!success) {
      allSuccess = false;
    }
  }
  
  console.log('\nSummary:');
  if (allSuccess) {
    console.log('✅ All endpoints are working properly!');
  } else {
    console.log('❌ Some endpoints failed. The server might not be running correctly.');
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure the server is running (node server/server.js or node basic-server.js)');
    console.log('2. Check if another process is using port 5000');
    console.log('3. Verify your .env file has the correct configuration');
    console.log('4. Try running the simplified server with: node basic-server.js');
  }
}

// Run the checks
checkAllEndpoints();
