export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  libraryId?: string;
  createdAt: string;
  lastLogin?: string;
}