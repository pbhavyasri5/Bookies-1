export interface Book {
  id: number;  // Changed from string to number to match backend
  title: string;
  author: string;
  category: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  status: 'available' | 'borrowed' | 'pending_request' | 'pending_return';
  coverImage: string;
  description?: string;
  addedDate: string;
  borrowedBy?: string;
  borrowedDate?: string;
  requestedBy?: string;
  requestDate?: string;
  returnRequestDate?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export interface BookFormData {
  title: string;
  author: string;
  category: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  status?: string;
}