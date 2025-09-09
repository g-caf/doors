import axios from 'axios';
import { Employee, VisitorLog, NotificationSettings, ApiResponse, PaginatedResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const employeeApi = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get<ApiResponse<Employee[]>>('/employees');
    return response.data.data;
  },

  getById: async (id: string): Promise<Employee> => {
    const response = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
    return response.data.data;
  },

  create: async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> => {
    const response = await api.post<ApiResponse<Employee>>('/employees', employee);
    return response.data.data;
  },

  update: async (id: string, employee: Partial<Employee>): Promise<Employee> => {
    const response = await api.put<ApiResponse<Employee>>(`/employees/${id}`, employee);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  uploadPhoto: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post<ApiResponse<{ photoUrl: string }>>(`/employees/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.photoUrl;
  },
};

export const visitorApi = {
  notify: async (employeeId: string, visitorName: string): Promise<void> => {
    await api.post('/visitors/notify', { employeeId, visitorName });
  },

  getLogs: async (page = 1, limit = 50): Promise<PaginatedResponse<VisitorLog>> => {
    const response = await api.get<PaginatedResponse<VisitorLog>>(`/visitors/logs?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export const authApi = {
  login: async (username: string, password: string): Promise<{ token: string; user: any }> => {
    const response = await api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', {
      username,
      password,
    });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

export const settingsApi = {
  getNotifications: async (): Promise<NotificationSettings> => {
    const response = await api.get<ApiResponse<NotificationSettings>>('/settings/notifications');
    return response.data.data;
  },

  updateNotifications: async (settings: NotificationSettings): Promise<NotificationSettings> => {
    const response = await api.put<ApiResponse<NotificationSettings>>('/settings/notifications', settings);
    return response.data.data;
  },
};

// Mock data for development
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    department: 'Engineering',
    position: 'Software Engineer',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@company.com',
    department: 'Marketing',
    position: 'Marketing Manager',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e1?w=400&h=400&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@company.com',
    department: 'Sales',
    position: 'Sales Director',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@company.com',
    department: 'Design',
    position: 'UI/UX Designer',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Override API calls with mock data in development
if (import.meta.env.DEV) {
  employeeApi.getAll = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockEmployees;
  };
}

export { api };
