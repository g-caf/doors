import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminNav } from './components/admin/AdminNav';
import { KioskPage } from './pages/KioskPage';
import { LoginPage } from './pages/admin/LoginPage';
import { EmployeesPage } from './pages/admin/EmployeesPage';
import { ActivityLogsPage } from './pages/admin/ActivityLogsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Kiosk Routes */}
          <Route path="/" element={<KioskPage />} />
          <Route path="/kiosk" element={<KioskPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <EmployeesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ActivityLogsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <SettingsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
