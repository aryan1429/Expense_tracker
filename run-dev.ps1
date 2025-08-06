# run-dev.ps1 - PowerShell script to run both client and server for local development

Write-Host "Starting Expense Tracker Development Environment..." -ForegroundColor Green

# Check if server is running and start it if needed
Write-Host "Checking server status..." -ForegroundColor Cyan
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/test-direct" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "Server is already running!" -ForegroundColor Green
        $serverRunning = $true
    }
}
catch {
    Write-Host "Server is not running. Starting server..." -ForegroundColor Yellow
}

if (-not $serverRunning) {
    # Start server in a new window
    Start-Process powershell.exe -ArgumentList "-Command cd '$PSScriptRoot\server' ; node server.js" -WindowStyle Normal
    
    # Wait a bit for server to start
    Write-Host "Waiting for server to start..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
}

# Set environment variables for client
$env:REACT_APP_API_URL = "http://localhost:5000"

# Start client in the current window
Write-Host "Starting React client..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\client"
npm start

# Note: When the user stops the client (Ctrl+C), this script will end, but the server will keep running
Write-Host "Development environment stopped. Note: The server may still be running." -ForegroundColor Yellow
