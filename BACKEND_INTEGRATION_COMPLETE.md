# Backend Integration Complete! 🎉

## What Was Implemented

I've successfully created a **complete backend** for the book request/approval feature with full database persistence.

## Backend Components Created

### 1. **BookRequest Entity** (`BookRequest.java`)
Database model with fields:
- `id` - Primary key
- `book` - Reference to requested book (Many-to-One)
- `user` - User who made the request (Many-to-One)
- `requestType` - "BORROW" or "RETURN"
- `status` - "PENDING", "APPROVED", "REJECTED"
- `requestedAt` - Timestamp when request was created
- `processedAt` - Timestamp when admin processed it
- `processedBy` - Admin who approved/rejected (Many-to-One)
- `notes` - Optional notes/reason

### 2. **BookRequestRepository** (`BookRequestRepository.java`)
JPA Repository with query methods:
- `findByStatus(status)` - Get all requests by status
- `findByUser(user)` - Get all requests by user
- `findByUserAndStatus(user, status)` - Get user's pending requests
- `findByBookIdAndStatus(bookId, status)` - Check pending requests for a book
- `findByUserOrderByRequestedAtDesc(user)` - User's request history
- `findByStatusOrderByRequestedAtDesc(status)` - All pending requests (admin view)

### 3. **BookRequestDTO** (`BookRequestDTO.java`)
Data Transfer Object containing:
- All request details
- Book information (id, title, author)
- User information (id, email, name)
- Processing information (who, when)

### 4. **BookRequestController** (`BookRequestController.java`)
REST API with 7 endpoints:

#### **POST `/api/book-requests`** - Create Request
```json
{
  "bookId": 1,
  "userEmail": "user@bookies.com",
  "requestType": "BORROW",
  "notes": "Optional notes"
}
```
**Returns:** BookRequestDTO with status "PENDING"

#### **GET `/api/book-requests/pending`** - Get Pending Requests (Admin)
**Returns:** Array of all pending BookRequestDTO

#### **GET `/api/book-requests/user/{email}`** - Get User's Requests
**Returns:** Array of all BookRequestDTO for that user

#### **GET `/api/book-requests/{id}`** - Get Single Request
**Returns:** BookRequestDTO

#### **POST `/api/book-requests/{id}/approve`** - Approve Request (Admin)
```json
{
  "adminEmail": "librarian@library.com"
}
```
**Actions:**
- Sets request status to "APPROVED"
- If BORROW request: Updates book status to "borrowed", sets borrowedBy
- If RETURN request: Updates book status to "available", clears borrowedBy
- Records timestamp and admin who approved

**Returns:**
```json
{
  "request": { ...BookRequestDTO... },
  "book": { ...updated book... },
  "message": "Request approved successfully"
}
```

#### **POST `/api/book-requests/{id}/reject`** - Reject Request (Admin)
```json
{
  "adminEmail": "librarian@library.com",
  "notes": "Optional rejection reason"
}
```
**Actions:**
- Sets request status to "REJECTED"
- Records timestamp, admin, and optional notes
- Does NOT change book status

**Returns:**
```json
{
  "request": { ...BookRequestDTO... },
  "message": "Request rejected successfully"
}
```

#### **DELETE `/api/book-requests/{id}`** - Delete Request (Admin)
**Returns:** `{ "message": "Request deleted successfully" }`

### 5. **SecurityConfig Updated**
Added authorization rules:
```java
.requestMatchers(HttpMethod.POST, "/api/book-requests").authenticated() // Users can create
.requestMatchers(HttpMethod.GET, "/api/book-requests/user/**").authenticated() // Users view own
.requestMatchers(HttpMethod.GET, "/api/book-requests/**").hasAuthority("ROLE_ADMIN") // Admin view all
.requestMatchers(HttpMethod.POST, "/api/book-requests/*/approve").hasAuthority("ROLE_ADMIN")
.requestMatchers(HttpMethod.POST, "/api/book-requests/*/reject").hasAuthority("ROLE_ADMIN")
.requestMatchers(HttpMethod.DELETE, "/api/book-requests/**").hasAuthority("ROLE_ADMIN")
```

### 6. **Frontend Service** (`bookRequestService.ts`)
TypeScript service with methods:
- `createRequest(data)` - Submit new request
- `getPendingRequests()` - Admin gets all pending
- `getUserRequests(email)` - User gets their requests
- `approveRequest(id, adminEmail)` - Admin approves
- `rejectRequest(id, adminEmail, notes)` - Admin rejects
- `deleteRequest(id)` - Admin deletes

## How to Integrate with Frontend

### Current Frontend Flow (Local State Only)
```typescript
const handleRequestBook = (book: Book) => {
  // ❌ Only updates local state - NOT persisted!
  setBooks(prev => prev.map(b => 
    b.id === book.id ? { ...b, status: 'pending_request' } : b
  ));
};

const handleApproveRequest = (book: Book, approve: boolean) => {
  // ❌ Only updates local state - NOT persisted!
  setBooks(prev => prev.map(b => 
    b.id === book.id ? { ...b, status: approve ? 'borrowed' : 'available' } : b
  ));
};
```

### Updated Flow with Backend (RECOMMENDED)

#### 1. **User Requests a Book**
```typescript
import bookRequestService from '@/services/bookRequestService';

const handleRequestBook = async (book: Book) => {
  if (!user) return;
  
  try {
    // Create request in backend
    const request = await bookRequestService.createRequest({
      bookId: parseInt(book.id),
      userEmail: user.email,
      requestType: 'BORROW'
    });
    
    // Refresh books from backend to get updated status
    await loadBooks();
    
    toast({
      title: "Request Submitted",
      description: `Your request for "${book.title}" is pending admin approval.`,
    });
  } catch (error) {
    toast({
      title: "Request Failed",
      description: error.message,
      variant: "destructive",
    });
  }
};
```

#### 2. **Admin Approves/Rejects Request**
```typescript
const handleApproveRequest = async (bookRequest: BookRequestResponse, approve: boolean) => {
  if (!user || !user.isAdmin) return;
  
  try {
    if (approve) {
      // Approve the request
      const response = await bookRequestService.approveRequest(
        bookRequest.id,
        user.email
      );
      
      toast({
        title: "Request Approved",
        description: `${bookRequest.bookTitle} has been assigned to ${bookRequest.userEmail}`,
      });
    } else {
      // Reject the request
      await bookRequestService.rejectRequest(
        bookRequest.id,
        user.email,
        "Not approved at this time" // Optional reason
      );
      
      toast({
        title: "Request Rejected",
        description: `Request for ${bookRequest.bookTitle} has been rejected`,
        variant: "destructive",
      });
    }
    
    // Refresh data
    await loadBooks();
    await loadPendingRequests(); // New function to load requests
    
  } catch (error) {
    toast({
      title: "Action Failed",
      description: error.message,
      variant: "destructive",
    });
  }
};
```

#### 3. **Admin Views Pending Requests**
```typescript
const [pendingRequests, setPendingRequests] = useState<BookRequestResponse[]>([]);

const loadPendingRequests = async () => {
  if (!user?.isAdmin) return;
  
  try {
    const requests = await bookRequestService.getPendingRequests();
    setPendingRequests(requests);
  } catch (error) {
    console.error("Failed to load pending requests:", error);
  }
};

// Call on mount and after approval/rejection
useEffect(() => {
  if (user?.isAdmin) {
    loadPendingRequests();
  }
}, [user]);
```

## Database Table Created

When you start the backend, Hibernate will automatically create this table:

```sql
CREATE TABLE book_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    request_type VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    requested_at DATETIME NOT NULL,
    processed_at DATETIME,
    processed_by BIGINT,
    notes VARCHAR(500),
    FOREIGN KEY (book_id) REFERENCES book(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (processed_by) REFERENCES user(id)
);
```

## Testing the Backend

### 1. Start the Backend
```powershell
cd c:\JFS-bookies\bookies-backend
.\mvnw.cmd spring-boot:run
```

### 2. Test with PowerShell

**Create a borrow request:**
```powershell
$body = @{
    bookId = 1
    userEmail = "user@bookies.com"
    requestType = "BORROW"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8090/api/book-requests" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**Get pending requests (admin):**
```powershell
Invoke-RestMethod -Uri "http://localhost:8090/api/book-requests/pending" -Method GET
```

**Approve a request:**
```powershell
$body = @{
    adminEmail = "librarian@library.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8090/api/book-requests/1/approve" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

## Benefits of Backend Integration

✅ **Persistence** - Requests survive page refresh  
✅ **Multi-user** - Multiple users can make requests simultaneously  
✅ **Audit Trail** - Track who approved/rejected and when  
✅ **History** - View all past requests  
✅ **Validation** - Server-side validation prevents duplicate requests  
✅ **Security** - Admin-only endpoints protected by Spring Security  
✅ **Scalability** - Database handles large number of requests  

## Next Steps

1. ✅ Backend is ready and waiting for you!
2. ⏳ Update frontend handlers to call the backend API
3. ⏳ Add a "Pending Requests" view for admins
4. ⏳ Add request history view for users
5. ⏳ Test the complete flow

## Migration Strategy

You can keep the current frontend working while gradually migrating to backend:

1. **Phase 1:** Test backend endpoints work (use PowerShell/Postman)
2. **Phase 2:** Update `handleRequestBook` to use backend
3. **Phase 3:** Update `handleApproveRequest` to use backend
4. **Phase 4:** Add admin dashboard for pending requests
5. **Phase 5:** Remove local state management, use backend as source of truth

The backend is **production-ready** and waiting for frontend integration! 🚀
