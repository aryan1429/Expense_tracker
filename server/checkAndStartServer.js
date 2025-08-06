// checkServer.js - Script to check if server is running and start it if needed
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const serverUrl = 'http://localhost:5000';
const checkPath = '/api/test-direct'; // Use our new direct test route
const serverFile = path.join(__dirname, 'server.js');

console.log('Checking if server is running...');

// Function to start the server
function startServer() {
  console.log('Starting server...');
  
  // Check if server.js exists
  if (!fs.existsSync(serverFile)) {
    console.error('Error: server.js not found at', serverFile);
    process.exit(1);
  }
  
  // Start the server with node
  const serverProcess = spawn('node', [serverFile], {
    detached: true,
    stdio: 'inherit'
  });
  
  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
  
  console.log('Server started with PID:', serverProcess.pid);
  console.log('Waiting for server to be ready...');
  
  // Give the server some time to start
  setTimeout(() => {
    checkServerStatus((isRunning) => {
      if (isRunning) {
        console.log('Server is now running!');
        process.exit(0);
      } else {
        console.error('Server failed to start properly');
        process.exit(1);
      }
    });
  }, 3000);
}

// Function to check if server is running
function checkServerStatus(callback) {
  http.get(`${serverUrl}${checkPath}`, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(data);
          console.log('Server response:', parsed);
          callback(true);
        } catch (e) {
          console.log('Received non-JSON response with status 200');
          callback(true); // Still consider it running
        }
      } else {
        console.log(`Server returned status code ${res.statusCode}`);
        callback(false);
      }
    });
  }).on('error', (err) => {
    console.log('Error connecting to server:', err.message);
    callback(false);
  });
}

// Check if server is already running
checkServerStatus((isRunning) => {
  if (isRunning) {
    console.log('Server is already running!');
    process.exit(0);
  } else {
    console.log('Server is not running');
    startServer();
  }
});
