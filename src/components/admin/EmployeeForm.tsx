import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, User } from 'lucide-react';
import { Employee } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { employeeApi } from '../../services/api';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (employee: Employee) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  isActive: z.boolean(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export function EmployeeForm({ employee, onSubmit, onCancel, isLoading }: EmployeeFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(employee?.photo || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name || '',
      email: employee?.email || '',
      department: employee?.department || '',
      position: employee?.position || '',
      isActive: employee?.isActive ?? true,
    },
    mode: 'onChange',
  });

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (data: EmployeeFormData) => {
    try {
      let photoUrl = employee?.photo || '';

      // Upload photo if a new one was selected
      if (photo && employee?.id) {
        setIsUploading(true);
        try {
          photoUrl = await employeeApi.uploadPhoto(employee.id, photo);
        } catch (error) {
          console.error('Photo upload failed:', error);
          // Continue with form submission even if photo upload fails
        } finally {
          setIsUploading(false);
        }
      }

      const employeeData: Employee = {
        id: employee?.id || '',
        ...data,
        photo: photoUrl,
        createdAt: employee?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSubmit(employeeData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'Design',
    'Human Resources',
    'Finance',
    'Operations',
    'Customer Success',
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Profile Photo
          </label>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary flex items-center space-x-2"
                disabled={isUploading}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>
              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="btn-secondary flex items-center space-x-2"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <p className="mt-2 text-sm text-gray-500">
            JPG, PNG or GIF up to 5MB
          </p>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="input-field w-full"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="input-field w-full"
              placeholder="john@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              {...register('department')}
              id="department"
              className="input-field w-full"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
              Position *
            </label>
            <input
              {...register('position')}
              type="text"
              id="position"
              className="input-field w-full"
              placeholder="Software Engineer"
            />
            {errors.position && (
              <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              {...register('isActive')}
              type="checkbox"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Active Employee (visible in kiosk)
            </span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
            disabled={isLoading || isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={!isValid || isLoading || isUploading}
          >
            {(isLoading || isUploading) ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {isUploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              employee ? 'Update Employee' : 'Create Employee'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
