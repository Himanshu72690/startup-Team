# StartupTeam Development script

Write-Host "🚀 Starting StartupTeam Development Environment..." -ForegroundColor Cyan

# 1. Start MongoDB if not running
$mongodPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
if (!(Test-Path $mongodPath)) {
    Write-Host "⚠️ MongoDB executable not found at $mongodPath." -ForegroundColor Yellow
    Write-Host "Please ensure MongoDB is installed."
    # Try generic search or exit
}

$startMongo = $true
if (Get-Process mongod -ErrorAction SilentlyContinue) {
    Write-Host "✅ MongoDB is already running." -ForegroundColor Green
    $startMongo = $false
}

if ($startMongo) {
    Write-Host "📦 Starting MongoDB..." -ForegroundColor Cyan
    $mongoDataPath = Join-Path $PSScriptRoot "Backend\data"
    if (!(Test-Path $mongoDataPath)) {
        New-Item -ItemType Directory -Force -Path $mongoDataPath | Out-Null
    }
    Start-Process -FilePath $mongodPath -ArgumentList "--dbpath `"$mongoDataPath`"" -WindowStyle HttpHidden
    Write-Host "✅ MongoDB started." -ForegroundColor Green
}

# 2. Start Backend
Write-Host "🔙 Starting Backend Server..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory (Join-Path $PSScriptRoot "Backend")
Write-Host "✅ Backend Server started." -ForegroundColor Green

# 3. Check Frontend
$port8000 = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet
if ($port8000) {
    Write-Host "✅ Frontend seems to be running on http://localhost:8000" -ForegroundColor Green
} else {
    Write-Host "⚠️ Frontend not detected on port 8000." -ForegroundColor Yellow
    Write-Host "   You can start it using Python: python -m http.server 8000"
    Write-Host "   Or using Node: npx serve . -p 8000"
}

Write-Host "`n🎉 Development environment is up!" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5000"
Write-Host "Frontend:    http://localhost:8000"