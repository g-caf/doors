export interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  email: string;
  phone?: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: number;
  employeeId: number;
  guestName: string;
  guestPhone?: string;
  guestEmail?: string;
  purpose: string;
  checkInTime: string;
  checkOutTime?: string;
  notes?: string;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'employee';
  createdAt: string;
}

export interface NotificationRequest {
  type: 'email' | 'sms' | 'both';
  employeeId: number;
  guestName: string;
  guestPhone?: string;
  guestEmail?: string;
  purpose: string;
  message?: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
      };
    }
  }
}
