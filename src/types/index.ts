export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorLog {
  id: string;
  visitorName: string;
  employeeId: string;
  employeeName: string;
  timestamp: string;
  status: 'pending' | 'notified' | 'failed';
}

export interface NotificationSettings {
  method: 'email' | 'slack' | 'teams';
  enabled: boolean;
  customMessage?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'manager';
}

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
