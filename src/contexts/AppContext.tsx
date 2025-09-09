import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Employee, AuthState, AdminUser, NotificationSettings } from '../types';

interface AppState {
  employees: Employee[];
  auth: AuthState;
  notifications: NotificationSettings;
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'SET_AUTH'; payload: { user: AdminUser | null; isAuthenticated: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: NotificationSettings };

const initialState: AppState = {
  employees: [],
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  },
  notifications: {
    method: 'email',
    enabled: true,
  },
  isLoading: false,
  error: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(emp =>
          emp.id === action.payload.id ? action.payload : emp
        ),
      };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload),
      };
    case 'SET_AUTH':
      return {
        ...state,
        auth: { ...state.auth, ...action.payload, isLoading: false },
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // In a real app, validate token with server
      const user = JSON.parse(localStorage.getItem('admin_user') || 'null');
      dispatch({ type: 'SET_AUTH', payload: { user, isAuthenticated: !!user } });
    } else {
      dispatch({ type: 'SET_AUTH', payload: { user: null, isAuthenticated: false } });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
