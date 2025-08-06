const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

console.log('\x1b[36m%s\x1b[0m', '===============================================');
console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Expense Tracker Development Environment');
console.log('\x1b[36m%s\x1b[0m', '===============================================\n');

// Paths
const rootDir = path.resolve(__dirname);
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');
const mockServerPath = path.join(serverDir, 'simplified-oauth-server.js');

// Check if mock server exists
if (!fs.existsSync(mockServerPath)) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Mock OAuth server file not found!');
    console.log('\x1b[33m%s\x1b[0m', 'Please ensure simplified-oauth-server.js exists in the server folder.');
    process.exit(1);
}

// Function to start a process
function startProcess(name, command, args, cwd, color) {
    console.log(`\x1b[${color}m%s\x1b[0m`, `Starting ${name}...`);
    
    const proc = spawn(command, args, {
        cwd,
        shell: true,
        stdio: 'pipe',
    });
    
    // Create prefix for log output
    const prefix = `\x1b[${color}m[${name}]\x1b[0m `;
    
    // Handle stdout
    proc.stdout.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                console.log(`${prefix}${line}`);
            }
        });
    });
    
    // Handle stderr
    proc.stderr.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                console.error(`${prefix}${line}`);
            }
        });
    });
    
    // Handle process exit
    proc.on('close', (code) => {
        if (code !== 0) {
            console.error(`\x1b[31m%s\x1b[0m`, `${name} process exited with code ${code}`);
        } else {
            console.log(`\x1b[${color}m%s\x1b[0m`, `${name} process exited successfully`);
        }
    });
    
    return proc;
}

// Start the mock OAuth server
const mockServer = startProcess('Mock OAuth Server', 'node', ['simplified-oauth-server.js'], serverDir, '33');

// Start the client app after a small delay
setTimeout(() => {
    const client = startProcess('React Client', 'npm', ['start'], clientDir, '36');
    
    // Handle cleanup
    const cleanup = () => {
        console.log('\n\x1b[36m%s\x1b[0m', '===============================================');
        console.log('\x1b[36m%s\x1b[0m', '👋 Shutting down development environment...');
        
        // Kill processes if they're still running
        mockServer.kill();
        client.kill();
        
        console.log('\x1b[36m%s\x1b[0m', '✅ All processes terminated');
        console.log('\x1b[36m%s\x1b[0m', '===============================================');
    };
    
    // Handle termination signals
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}, 2000);

// Set up command interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '\nAvailable commands:');
console.log('\x1b[36m%s\x1b[0m', '- q, quit, exit: Exit the development environment');
console.log('\x1b[36m%s\x1b[0m', '- c, clear: Clear the console\n');

rl.on('line', (input) => {
    const command = input.trim().toLowerCase();
    
    if (['q', 'quit', 'exit'].includes(command)) {
        rl.close();
        process.emit('SIGINT');
    } else if (['c', 'clear'].includes(command)) {
        console.clear();
        console.log('\x1b[36m%s\x1b[0m', '🚀 Expense Tracker Development Environment');
        console.log('\x1b[36m%s\x1b[0m', 'Available commands:');
        console.log('\x1b[36m%s\x1b[0m', '- q, quit, exit: Exit the development environment');
        console.log('\x1b[36m%s\x1b[0m', '- c, clear: Clear the console\n');
    } else if (command) {
        console.log('\x1b[33m%s\x1b[0m', `Unknown command: ${command}`);
    }
});
