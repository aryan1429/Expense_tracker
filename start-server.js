// start-server.js - A simplified script to start the server with proper environment variables
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { execSync } = require('child_process');

console.log('======== SERVER STARTER ========');
console.log('Checking environment setup...');

// Check if .env file exists in the root directory
const rootEnvPath = path.resolve(__dirname, '.env');
if (fs.existsSync(rootEnvPath)) {
    console.log('✅ .env file found in project root');
    
    // Display env contents (without sensitive values)
    console.log('Environment variables configured:');
    const envContent = fs.readFileSync(rootEnvPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
        if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key) {
                if (['JWT_SECRET', 'MONGO_URI', 'GOOGLE_CLIENT_SECRET'].includes(key.trim())) {
                    console.log(`  ${key.trim()}: <value set>`);
                } else {
                    console.log(`  ${key.trim()}: ${value}`);
                }
            }
        }
    });
} else {
    console.error('❌ .env file NOT found in project root');
    process.exit(1);
}

// Check if server dependencies are installed
console.log('\nChecking server dependencies...');
try {
    const packageJsonPath = path.resolve(__dirname, 'server', 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = require(packageJsonPath);
        console.log('Required server dependencies:');
        
        const requiredDeps = ['express', 'mongoose', 'cors', 'passport'];
        let missingDeps = [];
        
        requiredDeps.forEach(dep => {
            if (packageJson.dependencies && packageJson.dependencies[dep]) {
                console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`);
            } else {
                console.log(`  ❌ ${dep}: Missing`);
                missingDeps.push(dep);
            }
        });
        
        if (missingDeps.length > 0) {
            console.log(`\nInstalling missing dependencies: ${missingDeps.join(', ')}`);
            execSync(`cd server && npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
        }
    } else {
        console.error('❌ server/package.json not found');
        process.exit(1);
    }
} catch (error) {
    console.error('Error checking dependencies:', error);
    process.exit(1);
}

console.log('\nStarting server with proper environment...');
console.log('Server will run on port 5000');

// Start the server with proper path to .env
const serverProcess = spawn('node', ['server/server.js'], {
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: 'inherit'
});

// Handle server exit
serverProcess.on('close', (code) => {
    if (code !== 0) {
        console.error(`Server process exited with code ${code}`);
    }
});

console.log(`\nServer is now starting with PID: ${serverProcess.pid}`);
console.log('Press Ctrl+C to stop the server');
