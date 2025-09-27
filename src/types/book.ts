export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn?: string;
  publisher?: string;
  status: 'available' | 'borrowed';
  coverImage: string;
  description?: string;
  addedDate: string;
  borrowedBy?: string;
  borrowedDate?: string;
}

export interface BookFormData {
  title: string;
  author: string;
  category: string;
  isbn?: string;
  publisher?: string;
  description?: string;
}