# Approval System Test Script
# This script tests the complete book request approval workflow

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BOOK APPROVAL SYSTEM TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8090/api"
$userToken = $null
$adminToken = $null
$bookId = 1
$requestId = $null

# Test 1: Login as User
Write-Host "Test 1: Login as User" -ForegroundColor Yellow
Write-Host "POST /api/auth/login" -ForegroundColor Gray

try {
    $loginBody = @{
        email = "user@bookies.com"
        password = "user123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $userToken = $response.token
    
    if ($userToken) {
        Write-Host "✅ User login successful" -ForegroundColor Green
        Write-Host "   Token: $($userToken.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ User login failed - No token received" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "❌ User login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 2: Get Available Books
Write-Host "Test 2: Get Available Books" -ForegroundColor Yellow
Write-Host "GET /api/books" -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $userToken"
        "Content-Type" = "application/json"
    }
    
    $books = Invoke-RestMethod -Uri "$baseUrl/books" -Method GET -Headers $headers
    
    if ($books.Count -gt 0) {
        Write-Host "✅ Found $($books.Count) books" -ForegroundColor Green
        $availableBooks = $books | Where-Object { $_.status -eq "available" }
        
        if ($availableBooks.Count -gt 0) {
            $bookId = $availableBooks[0].id
            Write-Host "   Using Book ID: $bookId - $($availableBooks[0].title)" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  No available books found. Using book ID 1." -ForegroundColor Yellow
            $bookId = 1
        }
    } else {
        Write-Host "⚠️  No books in database. Using book ID 1." -ForegroundColor Yellow
        $bookId = 1
    }
} catch {
    Write-Host "❌ Failed to get books: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Create Book Request
Write-Host "Test 3: Create Book Request (User)" -ForegroundColor Yellow
Write-Host "POST /api/book-requests" -ForegroundColor Gray

try {
    $requestBody = @{
        bookId = $bookId
        userEmail = "user@bookies.com"
        requestType = "BORROW"
    } | ConvertTo-Json

    Write-Host "   Payload: $requestBody" -ForegroundColor Gray
    
    $headers = @{
        "Authorization" = "Bearer $userToken"
        "Content-Type" = "application/json"
    }
    
    $bookRequest = Invoke-RestMethod -Uri "$baseUrl/book-requests" -Method POST -Headers $headers -Body $requestBody
    $requestId = $bookRequest.id
    
    Write-Host "✅ Book request created successfully" -ForegroundColor Green
    Write-Host "   Request ID: $requestId" -ForegroundColor Gray
    Write-Host "   Status: $($bookRequest.status)" -ForegroundColor Gray
    Write-Host "   Book: $($bookRequest.bookTitle)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create book request: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    # Try to get more info
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "⚠️  Cannot continue without a request. Please check:" -ForegroundColor Yellow
    Write-Host "   1. Backend is running on port 8090" -ForegroundColor Yellow
    Write-Host "   2. Book with ID $bookId exists in database" -ForegroundColor Yellow
    Write-Host "   3. User 'user@bookies.com' exists in database" -ForegroundColor Yellow
    exit
}

Write-Host ""

# Test 4: Login as Admin
Write-Host "Test 4: Login as Admin" -ForegroundColor Yellow
Write-Host "POST /api/auth/login" -ForegroundColor Gray

try {
    $adminLoginBody = @{
        email = "librarian@library.com"
        password = "1234"
    } | ConvertTo-Json

    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminLoginBody -ContentType "application/json"
    $adminToken = $adminResponse.token
    
    if ($adminToken) {
        Write-Host "✅ Admin login successful" -ForegroundColor Green
        Write-Host "   Token: $($adminToken.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ Admin login failed - No token received" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 5: Get Pending Requests (Admin)
Write-Host "Test 5: Get Pending Requests (Admin)" -ForegroundColor Yellow
Write-Host "GET /api/book-requests/pending" -ForegroundColor Gray

try {
    $adminHeaders = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    $pendingRequests = Invoke-RestMethod -Uri "$baseUrl/book-requests/pending" -Method GET -Headers $adminHeaders
    
    Write-Host "✅ Found $($pendingRequests.Count) pending request(s)" -ForegroundColor Green
    
    if ($pendingRequests.Count -gt 0) {
        foreach ($req in $pendingRequests) {
            Write-Host "   Request ID: $($req.id) | Book: $($req.bookTitle) | User: $($req.userEmail)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Failed to get pending requests: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Approve Request (Admin)
Write-Host "Test 6: Approve Book Request (Admin)" -ForegroundColor Yellow
Write-Host "POST /api/book-requests/$requestId/approve" -ForegroundColor Gray

try {
    $approvalBody = @{
        adminEmail = "librarian@library.com"
    } | ConvertTo-Json

    $adminHeaders = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    $approvalResponse = Invoke-RestMethod -Uri "$baseUrl/book-requests/$requestId/approve" -Method POST -Headers $adminHeaders -Body $approvalBody
    
    Write-Host "✅ Request approved successfully!" -ForegroundColor Green
    Write-Host "   Request Status: $($approvalResponse.request.status)" -ForegroundColor Gray
    Write-Host "   Book Status: $($approvalResponse.book.status)" -ForegroundColor Gray
    Write-Host "   Borrowed By: $($approvalResponse.book.borrowedBy)" -ForegroundColor Gray
    Write-Host "   Message: $($approvalResponse.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to approve request: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 7: Verify Book Status Changed
Write-Host "Test 7: Verify Book Status Changed" -ForegroundColor Yellow
Write-Host "GET /api/books" -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    $books = Invoke-RestMethod -Uri "$baseUrl/books" -Method GET -Headers $headers
    $updatedBook = $books | Where-Object { $_.id -eq $bookId }
    
    if ($updatedBook) {
        Write-Host "✅ Book status verified" -ForegroundColor Green
        Write-Host "   Book ID: $($updatedBook.id)" -ForegroundColor Gray
        Write-Host "   Title: $($updatedBook.title)" -ForegroundColor Gray
        Write-Host "   Status: $($updatedBook.status)" -ForegroundColor Gray
        Write-Host "   Borrowed By: $($updatedBook.borrowedBy)" -ForegroundColor Gray
        
        if ($updatedBook.status -eq "borrowed" -and $updatedBook.borrowedBy -eq "user@bookies.com") {
            Write-Host ""
            Write-Host "🎉 APPROVAL SYSTEM WORKING PERFECTLY! 🎉" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "⚠️  Book status not updated correctly" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Failed to verify book status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
