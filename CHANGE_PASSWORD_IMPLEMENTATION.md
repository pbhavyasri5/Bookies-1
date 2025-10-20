# Change Password Feature Implementation

## Summary
Added a complete "Change Password" feature that allows logged-in users and admins to change their passwords securely.

## Frontend Changes

### 1. **ChangePasswordForm Component** (`frontend/src/components/ChangePasswordForm.tsx`)
**Complete rewrite with self-contained dialog trigger**

**Features:**
- ✅ Dialog-based modal with trigger button
- ✅ Three password fields: Current Password, New Password, Confirm New Password
- ✅ Show/Hide password toggle for all fields (Eye/EyeOff icons)
- ✅ Client-side validation:
  - All fields required
  - New password minimum 6 characters
  - New password must match confirm password
  - New password must differ from current password
- ✅ Form auto-clears on success or cancel
- ✅ Loading states during submission
- ✅ Proper error handling with specific messages

**Button Styling:**
```tsx
<Button
  variant="outline"
  size="sm"
  className="font-medium border-accent/50 text-primary-foreground hover:bg-accent/10 hover:text-accent"
>
  <Key className="h-4 w-4 mr-2" />
  Change Password
</Button>
```

### 2. **LibraryHeader Component** (`frontend/src/components/LibraryHeader.tsx`)
**Added Change Password button in header navigation**

**Location:** Appears next to Logout button when user is logged in
**Props:** Passes user email to ChangePasswordForm component

**Integration:**
```tsx
<div className="flex items-center gap-2">
  <ChangePasswordForm userEmail={user.email} />
  <Button onClick={onLogout}>
    <LogOut className="h-4 w-4 mr-2" />
    Logout
  </Button>
</div>
```

### 3. **API Service** (`frontend/src/services/api.ts`)
**Added user operations with changePassword method**

```typescript
user: {
  changePassword: (data: { 
    email: string; 
    currentPassword: string; 
    newPassword: string 
  }) => axiosInstance.put(`${API_BASE}/users/change-password`, data),
}
```

**Features:**
- Uses authenticated axios instance (includes Bearer token)
- Sends PUT request to `/api/users/change-password`
- Returns promise for async handling

---

## Backend Changes

### 1. **UserController** (`bookies-backend/src/main/java/com/bookies/controller/UserController.java`)
**New controller for user-related operations**

**Endpoint:** `PUT /api/users/change-password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- **401 Unauthorized** - Incorrect current password
- **404 Not Found** - User not found
- **400 Bad Request** - New password same as current

**Features:**
- ✅ Validates current password using BCrypt
- ✅ Checks new password is different from current
- ✅ Hashes new password with BCrypt before saving
- ✅ Comprehensive logging
- ✅ Proper exception handling

### 2. **ChangePasswordRequest DTO** (`bookies-backend/src/main/java/com/bookies/dto/ChangePasswordRequest.java`)
**New DTO for password change requests**

**Validation:**
- `@NotBlank` for all fields
- `@Email` for email field
- `@Size(min = 6)` for new password

**Properties:**
- email: String
- currentPassword: String
- newPassword: String

---

## Security Features

### Frontend:
1. **Token Authentication**: Uses Bearer token from localStorage
2. **Client Validation**: Prevents invalid requests
3. **Secure Input**: Password fields masked by default
4. **Clear on Close**: Sensitive data cleared when dialog closes

### Backend:
1. **BCrypt Verification**: Current password verified with BCrypt
2. **BCrypt Hashing**: New password hashed before storage
3. **Password Comparison**: Ensures new password differs from current
4. **JWT Protection**: Endpoint protected by JWT filter
5. **Validation**: Jakarta validation on all inputs

---

## User Experience

### Visibility:
- **Button appears ONLY when logged in** (admin or user)
- Located in header navigation bar next to Logout

### Workflow:
1. User clicks "Change Password" button
2. Modal dialog opens with three fields
3. User enters current and new passwords
4. Client validates input
5. On submit, sends request to backend
6. Backend verifies current password
7. Backend updates password with BCrypt hash
8. Success toast appears
9. Modal closes and form clears

### Error Handling:
- **Empty fields** → "Please fill in all fields"
- **Short password** → "New password must be at least 6 characters long"
- **Mismatch** → "New password and confirm password do not match"
- **Same password** → "New password must be different from current password"
- **Wrong current** → "Incorrect current password"
- **Network error** → "Failed to change password"

---

## Testing

### Test Scenarios:

1. **Valid Password Change**
   - Login as: `librarian@library.com` / `1234`
   - Change to: `newpass123`
   - Expected: Success toast, can login with new password

2. **Invalid Current Password**
   - Enter wrong current password
   - Expected: "Incorrect current password" error

3. **Validation Errors**
   - Try password < 6 characters
   - Try non-matching passwords
   - Expected: Appropriate error messages

4. **Same Password**
   - Enter current password as new password
   - Expected: "New password must be different" error

### Test Accounts:
```
Admin: librarian@library.com / 1234
Admin: admin@bookies.com / admin123
User:  user@bookies.com / user123
```

---

## Files Modified/Created

### Frontend:
- ✅ `frontend/src/components/ChangePasswordForm.tsx` - **Modified**
- ✅ `frontend/src/components/LibraryHeader.tsx` - **Modified**
- ✅ `frontend/src/services/api.ts` - **Modified**

### Backend:
- ✅ `bookies-backend/src/main/java/com/bookies/controller/UserController.java` - **Created**
- ✅ `bookies-backend/src/main/java/com/bookies/dto/ChangePasswordRequest.java` - **Created**

---

## API Endpoint

**Method:** PUT  
**URL:** `http://localhost:8090/api/users/change-password`  
**Authentication:** Required (Bearer token)  
**Content-Type:** application/json

**Example cURL:**
```bash
curl -X PUT http://localhost:8090/api/users/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "librarian@library.com",
    "currentPassword": "1234",
    "newPassword": "newpass123"
  }'
```

---

**Implementation Date:** October 19, 2025  
**Status:** ✅ Complete and Ready for Testing
