import { useState, useEffect, useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { EmployeeCard } from '../components/kiosk/EmployeeCard';
import { SearchBar } from '../components/kiosk/SearchBar';
import { NotificationModal } from '../components/kiosk/NotificationModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useAppContext } from '../contexts/AppContext';
import { Employee } from '../types';
import { employeeApi } from '../services/api';

export function KioskPage() {
  const { state, dispatch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError('');
      const employees = await employeeApi.getAll();
      dispatch({ type: 'SET_EMPLOYEES', payload: employees.filter(emp => emp.isActive) });
    } catch (err) {
      console.error('Failed to load employees:', err);
      setError('Failed to load employee directory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return state.employees;
    
    const search = searchTerm.toLowerCase();
    return state.employees.filter(employee =>
      employee.name.toLowerCase().includes(search) ||
      employee.department.toLowerCase().includes(search) ||
      employee.position.toLowerCase().includes(search)
    );
  }, [state.employees, searchTerm]);

  const handleNotifyEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading employee directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <Building2 className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Guest Check-in
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name, department, or position..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={loadEmployees}
            className="mb-6"
          />
        )}

        {/* Instructions */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600">
            Please find and select the person you're here to see
          </p>
        </div>

        {/* Employee Grid */}
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No employees found matching your search.' : 'No employees available.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-primary-600 hover:text-primary-700 underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onNotify={handleNotifyEmployee}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {searchTerm && (
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Showing {filteredEmployees.length} of {state.employees.length} employees
            </p>
          </div>
        )}
      </main>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={selectedEmployee !== null}
        onClose={handleCloseModal}
        employee={selectedEmployee}
      />
    </div>
  );
}
