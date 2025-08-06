# start-dev.ps1 - PowerShell script to start both client and server
Write-Host "Starting development environment..." -ForegroundColor Cyan

# Function to check if server is responding
function Test-ServerRunning {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/test-direct" -UseBasicParsing -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Start the basic test server
Write-Host "Starting server..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "basic-server.js" -NoNewWindow -PassThru

# Wait for server to start
Write-Host "Waiting for server to become available..." -ForegroundColor Yellow
$count = 0
$maxRetries = 10
$serverRunning = $false

while (-not $serverRunning -and $count -lt $maxRetries) {
    $count++
    $serverRunning = Test-ServerRunning
    if (-not $serverRunning) {
        Write-Host "Attempt $count of $maxRetries: Server not responding yet, waiting..." -ForegroundColor Yellow
        Start-Sleep -Seconds 1
    }
}

if ($serverRunning) {
    Write-Host "Server is running!" -ForegroundColor Green
    
    # Start React client
    Write-Host "Starting React client..." -ForegroundColor Yellow
    Set-Location -Path "client"
    npm start
} else {
    Write-Host "Failed to start server after $maxRetries attempts." -ForegroundColor Red
    Write-Host "Please check for errors in the server console." -ForegroundColor Red
}
