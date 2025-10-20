const API_BASE_URL = 'http://localhost:8090/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export interface BookRequestData {
  bookId: number;
  userEmail: string;
  requestType: 'BORROW' | 'RETURN';
  notes?: string;
}

export interface BookRequestResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  userId: number;
  userEmail: string;
  userName: string;
  requestType: 'BORROW' | 'RETURN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  processedAt?: string;
  processedByEmail?: string;
  notes?: string;
}

export interface ApprovalResponse {
  request: BookRequestResponse;
  book?: {
    id: number;
    title: string;
    status: string;
    borrowedBy?: string;
    borrowedDate?: string;
  };
  message: string;
}

export const bookRequestService = {
  /**
   * Create a new book request
   */
  async createRequest(data: BookRequestData): Promise<BookRequestResponse> {
    const response = await fetch(`${API_BASE_URL}/book-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Failed to create book request');
    }

    return response.json();
  },

  /**
   * Get all pending requests (Admin only)
   */
  async getPendingRequests(): Promise<BookRequestResponse[]> {
    const response = await fetch(`${API_BASE_URL}/book-requests/pending`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending requests');
    }

    return response.json();
  },

  /**
   * Get requests for a specific user
   */
  async getUserRequests(email: string): Promise<BookRequestResponse[]> {
    const response = await fetch(`${API_BASE_URL}/book-requests/user/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user requests');
    }

    return response.json();
  },

  /**
   * Approve a book request (Admin only)
   */
  async approveRequest(requestId: number, adminEmail: string): Promise<ApprovalResponse> {
    const response = await fetch(`${API_BASE_URL}/book-requests/${requestId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminEmail }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Approval failed' }));
      throw new Error(error.message || 'Failed to approve request');
    }

    return response.json();
  },

  /**
   * Reject a book request (Admin only)
   */
  async rejectRequest(requestId: number, adminEmail: string, notes?: string): Promise<ApprovalResponse> {
    const response = await fetch(`${API_BASE_URL}/book-requests/${requestId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminEmail, notes }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Rejection failed' }));
      throw new Error(error.message || 'Failed to reject request');
    }

    return response.json();
  },

  /**
   * Delete a book request (Admin only)
   */
  async deleteRequest(requestId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/book-requests/${requestId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete request');
    }
  },
};

export default bookRequestService;
