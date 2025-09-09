
import { User } from 'lucide-react';
import { Employee } from '../../types';

interface EmployeeCardProps {
  employee: Employee;
  onNotify: (employee: Employee) => void;
  isDisabled?: boolean;
}

export function EmployeeCard({ employee, onNotify, isDisabled }: EmployeeCardProps) {
  return (
    <div
      className="employee-card touch-target group"
      onClick={() => !isDisabled && onNotify(employee)}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative w-20 h-20 md:w-24 md:h-24">
          {employee.photo ? (
            <img
              src={employee.photo}
              alt={employee.name}
              className="w-full h-full rounded-full object-cover border-2 border-gray-200 group-hover:border-primary-300 transition-colors"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 group-hover:border-primary-300 transition-colors">
              <User className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 text-lg md:text-xl leading-tight">
            {employee.name}
          </h3>
          <p className="text-gray-600 text-sm md:text-base">{employee.position}</p>
          <p className="text-gray-500 text-xs md:text-sm">{employee.department}</p>
        </div>
        
        <button
          className={`btn-primary text-sm md:text-base px-6 py-3 touch-target w-full ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
          } transition-transform duration-150`}
          disabled={isDisabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!isDisabled) onNotify(employee);
          }}
        >
          Notify
        </button>
      </div>
    </div>
  );
}
