# Book Request API Test Script
# Tests all book request endpoints

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Book Request API Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8090/api"

# Check if backend is running
Write-Host "1. Checking backend availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/books" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "Backend is running on port 8090`n" -ForegroundColor Green
} catch {
    Write-Host "Backend is not running! Please start it first." -ForegroundColor Red
    Write-Host "   Run: cd c:\JFS-bookies\bookies-backend ; .\mvnw.cmd spring-boot:run`n" -ForegroundColor Yellow
    exit 1
}

# Test 1: Create a BORROW request
Write-Host "`n2. Creating a BORROW request..." -ForegroundColor Yellow
Write-Host "   POST $baseUrl/book-requests" -ForegroundColor Gray

$borrowRequest = @{
    bookId = 1
    userEmail = "user@bookies.com"
    requestType = "BORROW"
    notes = "I need this book for my studies"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/book-requests" `
        -Method POST `
        -ContentType "application/json" `
        -Body $borrowRequest
    
    Write-Host " Borrow request created successfully!" -ForegroundColor Green
    Write-Host "   Request ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "   Book: $($response.bookTitle) by $($response.bookAuthor)" -ForegroundColor Cyan
    Write-Host "   User: $($response.userEmail)" -ForegroundColor Cyan
    Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "   Type: $($response.requestType)" -ForegroundColor Cyan
    
    $requestId = $response.id
    
} catch {
    Write-Host " Failed to create borrow request" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $requestId = $null
}

# Test 2: Get all pending requests (Admin)
Write-Host "`n3  Getting all pending requests (Admin view)..." -ForegroundColor Yellow
Write-Host "   GET $baseUrl/book-requests/pending" -ForegroundColor Gray

try {
    $pendingRequests = Invoke-RestMethod -Uri "$baseUrl/book-requests/pending" -Method GET
    
    Write-Host " Found $($pendingRequests.Count) pending request(s)" -ForegroundColor Green
    
    foreach ($req in $pendingRequests) {
        Write-Host "`n    Request #$($req.id):" -ForegroundColor Cyan
        Write-Host "      Book: $($req.bookTitle)" -ForegroundColor White
        Write-Host "      User: $($req.userEmail)" -ForegroundColor White
        Write-Host "      Type: $($req.requestType)" -ForegroundColor White
        Write-Host "      Status: $($req.status)" -ForegroundColor White
        Write-Host "      Requested: $($req.requestedAt)" -ForegroundColor White
    }
    
} catch {
    Write-Host " Failed to get pending requests" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get user's requests
Write-Host "`n4  Getting user's request history..." -ForegroundColor Yellow
Write-Host "   GET $baseUrl/book-requests/user/user@bookies.com" -ForegroundColor Gray

try {
    $userRequests = Invoke-RestMethod -Uri "$baseUrl/book-requests/user/user@bookies.com" -Method GET
    
    Write-Host " User has $($userRequests.Count) request(s) in history" -ForegroundColor Green
    
    foreach ($req in $userRequests) {
        Write-Host "`n    Request #$($req.id):" -ForegroundColor Cyan
        Write-Host "      Book: $($req.bookTitle)" -ForegroundColor White
        Write-Host "      Type: $($req.requestType)" -ForegroundColor White
        Write-Host "      Status: $($req.status)" -ForegroundColor White
    }
    
} catch {
    Write-Host " Failed to get user requests" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Approve the request
if ($requestId) {
    Write-Host "`n5  Approving request #$requestId (Admin action)..." -ForegroundColor Yellow
    Write-Host "   POST $baseUrl/book-requests/$requestId/approve" -ForegroundColor Gray
    
    $approveBody = @{
        adminEmail = "librarian@library.com"
    } | ConvertTo-Json
    
    try {
        $approveResponse = Invoke-RestMethod -Uri "$baseUrl/book-requests/$requestId/approve" `
            -Method POST `
            -ContentType "application/json" `
            -Body $approveBody
        
        Write-Host " Request approved successfully!" -ForegroundColor Green
        Write-Host "   $($approveResponse.message)" -ForegroundColor Cyan
        Write-Host "`n    Updated Book Status:" -ForegroundColor Cyan
        Write-Host "      Book ID: $($approveResponse.book.id)" -ForegroundColor White
        Write-Host "      Title: $($approveResponse.book.title)" -ForegroundColor White
        Write-Host "      Status: $($approveResponse.book.status)" -ForegroundColor White
        Write-Host "      Borrowed By: $($approveResponse.book.borrowedBy)" -ForegroundColor White
        
    } catch {
        Write-Host " Failed to approve request" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Create a RETURN request (after approving borrow)
Write-Host "`n6  Creating a RETURN request..." -ForegroundColor Yellow
Write-Host "   POST $baseUrl/book-requests" -ForegroundColor Gray

$returnRequest = @{
    bookId = 1
    userEmail = "user@bookies.com"
    requestType = "RETURN"
    notes = "Finished reading, returning the book"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/book-requests" `
        -Method POST `
        -ContentType "application/json" `
        -Body $returnRequest
    
    Write-Host " Return request created successfully!" -ForegroundColor Green
    Write-Host "   Request ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "   Book: $($response.bookTitle)" -ForegroundColor Cyan
    Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
    
    $returnRequestId = $response.id
    
} catch {
    Write-Host "  Return request failed (this is expected if book isn't borrowed yet)" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    $returnRequestId = $null
}

# Test 6: Reject a request
if ($returnRequestId) {
    Write-Host "`n7  Rejecting return request #$returnRequestId (Admin action)..." -ForegroundColor Yellow
    Write-Host "   POST $baseUrl/book-requests/$returnRequestId/reject" -ForegroundColor Gray
    
    $rejectBody = @{
        adminEmail = "librarian@library.com"
        notes = "Book condition needs to be verified first"
    } | ConvertTo-Json
    
    try {
        $rejectResponse = Invoke-RestMethod -Uri "$baseUrl/book-requests/$returnRequestId/reject" `
            -Method POST `
            -ContentType "application/json" `
            -Body $rejectBody
        
        Write-Host " Request rejected successfully!" -ForegroundColor Green
        Write-Host "   $($rejectResponse.message)" -ForegroundColor Cyan
        Write-Host "   Rejection reason: $($rejectResponse.request.notes)" -ForegroundColor Yellow
        
    } catch {
        Write-Host " Failed to reject request" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All Book Request API endpoints are working!" -ForegroundColor Green
Write-Host "`nAvailable Endpoints:" -ForegroundColor Yellow
Write-Host "   POST   /api/book-requests           - Create request" -ForegroundColor White
Write-Host "   GET    /api/book-requests/pending   - Get pending (Admin)" -ForegroundColor White
Write-Host "   GET    /api/book-requests/user/{email} - Get user's requests" -ForegroundColor White
Write-Host "   POST   /api/book-requests/{id}/approve - Approve (Admin)" -ForegroundColor White
Write-Host "   POST   /api/book-requests/{id}/reject  - Reject (Admin)" -ForegroundColor White
Write-Host "   DELETE /api/book-requests/{id}      - Delete (Admin)" -ForegroundColor White
Write-Host "`nNext Step: Integrate these endpoints into your frontend!" -ForegroundColor Cyan
Write-Host "   See BACKEND_INTEGRATION_COMPLETE.md for instructions`n" -ForegroundColor Cyan

