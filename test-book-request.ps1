# Test Book Request API
# This script simulates a book request to help debug the issue

Write-Host "`n=== TESTING BOOK REQUEST API ===" -ForegroundColor Cyan

# Step 1: Test if backend is accessible
Write-Host "`n1. Testing backend connectivity..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:8090/api/books" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Backend is accessible (Status: $($healthCheck.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend not accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Test authentication endpoint
Write-Host "`n2. Testing user login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "user@bookies.com"
        password = "user123"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8090/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -TimeoutSec 5 `
        -ErrorAction Stop
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.token
    $userEmail = $loginData.user.email
    
    Write-Host "   ✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host "   User: $userEmail" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# Step 3: Get available books
Write-Host "`n3. Fetching available books..." -ForegroundColor Yellow
try {
    $booksResponse = Invoke-WebRequest -Uri "http://localhost:8090/api/books" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -TimeoutSec 5 `
        -ErrorAction Stop
    
    $books = $booksResponse.Content | ConvertFrom-Json
    
    if ($books.Count -eq 0) {
        Write-Host "   ⚠️  No books found in database" -ForegroundColor Yellow
        Write-Host "   Please add books through the admin interface first" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "   ✅ Found $($books.Count) books" -ForegroundColor Green
    
    # Find an available book
    $availableBook = $books | Where-Object { $_.status -eq "available" } | Select-Object -First 1
    
    if (-not $availableBook) {
        Write-Host "   ⚠️  No available books (all borrowed or pending)" -ForegroundColor Yellow
        Write-Host "`nBook statuses:" -ForegroundColor Gray
        $books | Select-Object -First 5 | ForEach-Object {
            Write-Host "   - $($_.title): $($_.status)" -ForegroundColor Gray
        }
        exit 0
    }
    
    Write-Host "   Testing with book: '$($availableBook.title)' (ID: $($availableBook.id))" -ForegroundColor Gray
    
} catch {
    Write-Host "   ❌ Failed to fetch books: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Create book request
Write-Host "`n4. Creating book request..." -ForegroundColor Yellow
try {
    $requestBody = @{
        bookId = $availableBook.id
        userEmail = $userEmail
        requestType = "BORROW"
    } | ConvertTo-Json
    
    Write-Host "   Request payload:" -ForegroundColor Gray
    Write-Host "   $requestBody" -ForegroundColor Gray
    
    $requestResponse = Invoke-WebRequest -Uri "http://localhost:8090/api/book-requests" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{
            "Authorization" = "Bearer $token"
        } `
        -Body $requestBody `
        -TimeoutSec 5 `
        -ErrorAction Stop
    
    $requestData = $requestResponse.Content | ConvertFrom-Json
    
    Write-Host "`n   ✅ SUCCESS! Book request created" -ForegroundColor Green
    Write-Host "   Request ID: $($requestData.id)" -ForegroundColor Green
    Write-Host "   Status: $($requestData.status)" -ForegroundColor Green
    Write-Host "   Book: $($requestData.bookTitle)" -ForegroundColor Green
    
} catch {
    Write-Host "`n   ❌ BOOK REQUEST FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "`n   Response Body:" -ForegroundColor Yellow
            Write-Host "   $responseBody" -ForegroundColor Red
            
            # Try to parse as JSON for better display
            try {
                $errorJson = $responseBody | ConvertFrom-Json
                Write-Host "`n   Error Details:" -ForegroundColor Yellow
                Write-Host "   Message: $($errorJson.message)" -ForegroundColor Red
                if ($errorJson.error) {
                    Write-Host "   Error Type: $($errorJson.error)" -ForegroundColor Red
                }
            } catch {
                # Not JSON, already displayed above
            }
        } catch {
            Write-Host "   Could not read response body" -ForegroundColor Red
        }
    }
    
    Write-Host "`n   Troubleshooting tips:" -ForegroundColor Cyan
    Write-Host "   1. Check backend console for ERROR messages" -ForegroundColor White
    Write-Host "   2. Verify book exists in database" -ForegroundColor White
    Write-Host "   3. Verify user exists in database" -ForegroundColor White
    Write-Host "   4. Check if table exists: SHOW TABLES LIKE 'book_requests'" -ForegroundColor White
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
Write-Host ""
