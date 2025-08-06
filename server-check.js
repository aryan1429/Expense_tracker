// server-check.js
// A simple script to verify server connection

// Get command line arguments or use default URL
const serverUrl = process.argv[2] || 'https://expense-tracker-api-s7za.onrender.com';
const endpoints = [
  '/api/test',
  '/api/auth/google-test',
  '/api/auth/simple-test',
  '/api/google-auth-check',
  '/api/test-direct',
  '/server-test'
];

console.log(`Testing connection to ${serverUrl}`);

// Test each endpoint
async function testEndpoints() {
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${serverUrl}${endpoint}...`);
      const response = await fetch(`${serverUrl}${endpoint}`, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        console.log(`✅ ${endpoint} is available`);
        try {
          const data = await response.text();
          console.log(`   Response: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
        } catch (e) {
          console.log('   Could not parse response');
        }
      } else {
        console.log(`❌ ${endpoint} returned status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error accessing ${endpoint}: ${error.message}`);
    }
  }
}

testEndpoints().catch(err => console.error('Test failed:', err));

/*
To run this script:
node server-check.js [optional-server-url]

Example:
node server-check.js https://your-api-server.render.com
*/
