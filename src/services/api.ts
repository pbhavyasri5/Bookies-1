import axios from 'axios';
import { Book, BookFormData } from '@/types/book';
import { User } from '@/types/user';

const API_BASE = '/api';

// Create axios instance with interceptor to add token
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth operations
  auth: {
    login: async (data: { email: string; password: string }) => {
      const response = await axios.post<{ email: string; role: 'ADMIN' | 'USER'; token: string }>(`${API_BASE}/auth/login`, data);
      localStorage.setItem('token', response.data.token);
      return response;
    },
    register: (data: { name: string; email: string; password: string; role: 'ADMIN' | 'USER' }) =>
      axios.post<{ email: string; role: 'ADMIN' | 'USER'; token: string }>(`${API_BASE}/auth/register`, data),
  },

  // Book operations
  books: {
    getAll: () => axiosInstance.get<Book[]>(`${API_BASE}/books`),
    create: (book: BookFormData) => axiosInstance.post<Book>(`${API_BASE}/books`, book),
    update: (id: string, book: Partial<Book>) => axiosInstance.put<Book>(`${API_BASE}/books/${id}`, book),
    delete: (id: string) => axiosInstance.delete(`${API_BASE}/books/${id}`),
  },
  
  // File upload
  upload: {
    image: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return axios.post(`${API_BASE}/upload/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
  },
  
  // Member operations
  members: {
    getAll: () => axios.get<User[]>(`${API_BASE}/members`),
    create: (member: Omit<User, 'id' | 'createdAt'>) => axios.post<User>(`${API_BASE}/members`, member),
  },

  // User operations
  user: {
    changePassword: (data: { email: string; currentPassword: string; newPassword: string }) => 
      axios.post(`${API_BASE}/auth/change-password`, data),
  }
};