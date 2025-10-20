# Test Login Script - No Postman Needed
# This script tests both login endpoints

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TESTING LOGIN ENDPOINTS" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Wait for backend to be ready
Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    $null = Invoke-WebRequest -Uri "http://localhost:8090" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend is running on port 8090`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is NOT running. Please start it first." -ForegroundColor Red
    Write-Host "   Run: cd c:\JFS-bookies\bookies-backend ; mvn spring-boot:run`n" -ForegroundColor Yellow
    exit 1
}

# Test 1: Login via /api/users/login
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TEST 1: /api/users/login" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

$loginData1 = @{
    email = "user@bookies.com"
    password = "user123"
} | ConvertTo-Json

Write-Host "`nSending request to: http://localhost:8090/api/users/login" -ForegroundColor Gray
Write-Host "Payload:" -ForegroundColor Gray
Write-Host $loginData1 -ForegroundColor Gray

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:8090/api/users/login" `
        -Method POST `
        -Body $loginData1 `
        -ContentType "application/json"
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response1 | ConvertTo-Json -Depth 3
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    Write-Host "`n❌ FAILED!" -ForegroundColor Red
    Write-Host "Status Code: $statusCode" -ForegroundColor Red
    Write-Host "Error: $errorBody" -ForegroundColor Red
    
    # Try to parse error message
    try {
        $errorObj = $errorBody | ConvertFrom-Json
        Write-Host "`nError Message: $($errorObj.message)" -ForegroundColor Yellow
    } catch {
        Write-Host "`nRaw Error: $errorBody" -ForegroundColor Yellow
    }
}

# Test 2: Login via /api/auth/login
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "TEST 2: /api/auth/login" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

$loginData2 = @{
    email = "user@bookies.com"
    password = "user123"
} | ConvertTo-Json

Write-Host "`nSending request to: http://localhost:8090/api/auth/login" -ForegroundColor Gray
Write-Host "Payload:" -ForegroundColor Gray
Write-Host $loginData2 -ForegroundColor Gray

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:8090/api/auth/login" `
        -Method POST `
        -Body $loginData2 `
        -ContentType "application/json"
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response2 | ConvertTo-Json -Depth 3
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    Write-Host "`n❌ FAILED!" -ForegroundColor Red
    Write-Host "Status Code: $statusCode" -ForegroundColor Red
    Write-Host "Error: $errorBody" -ForegroundColor Red
    
    # Try to parse error message
    try {
        $errorObj = $errorBody | ConvertFrom-Json
        Write-Host "`nError Message: $($errorObj.message)" -ForegroundColor Yellow
    } catch {
        Write-Host "`nRaw Error: $errorBody" -ForegroundColor Yellow
    }
}

# Test 3: Try with librarian (admin)
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "TEST 3: Admin Login (/api/users/login)" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

$adminData = @{
    email = "librarian@library.com"
    password = "1234"
} | ConvertTo-Json

Write-Host "`nSending request to: http://localhost:8090/api/users/login" -ForegroundColor Gray
Write-Host "Payload:" -ForegroundColor Gray
Write-Host $adminData -ForegroundColor Gray

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:8090/api/users/login" `
        -Method POST `
        -Body $adminData `
        -ContentType "application/json"
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response3 | ConvertTo-Json -Depth 3
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    Write-Host "`n❌ FAILED!" -ForegroundColor Red
    Write-Host "Status Code: $statusCode" -ForegroundColor Red
    Write-Host "Error: $errorBody" -ForegroundColor Red
    
    # Try to parse error message
    try {
        $errorObj = $errorBody | ConvertFrom-Json
        Write-Host "`nError Message: $($errorObj.message)" -ForegroundColor Yellow
    } catch {
        Write-Host "`nRaw Error: $errorBody" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TESTS COMPLETE" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📝 Note: Check the backend console for detailed logs" -ForegroundColor Cyan
Write-Host "   Look for lines starting with 'Login attempt for email:'" -ForegroundColor Gray
Write-Host "   and 'Login failed:' or 'User logged in successfully:'" -ForegroundColor Gray
