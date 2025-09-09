import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Employee } from '../../types';
import { visitorApi } from '../../services/api';
import { useRateLimit } from '../../hooks/useRateLimit';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const visitorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  company: z.string().optional(),
});

type VisitorFormData = z.infer<typeof visitorSchema>;

export function NotificationModal({ isOpen, onClose, employee }: NotificationModalProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const rateLimit = useRateLimit({
    maxAttempts: 3,
    windowMs: 60000, // 1 minute
    message: 'Too many notifications sent. Please wait before trying again.',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      setStatus('idle');
      setError('');
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: VisitorFormData) => {
    if (!employee || rateLimit.isLimited) return;

    setStatus('loading');
    setError('');

    try {
      await visitorApi.notify(employee.id, data.name);
      rateLimit.increment();
      setStatus('success');
      
      // Auto-close after 2 seconds on success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to send notification:', err);
      setStatus('error');
      setError('Failed to send notification. Please try again.');
    }
  };

  const handleClose = () => {
    if (status !== 'loading') {
      onClose();
    }
  };

  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Visitor Check-in" size="md">
      <div className="space-y-6">
        {/* Employee Info */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {employee.photo ? (
              <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                {employee.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{employee.name}</h3>
            <p className="text-gray-600">{employee.position}</p>
            <p className="text-gray-500 text-sm">{employee.department}</p>
          </div>
        </div>

        {/* Rate Limit Warning */}
        {rateLimit.isLimited && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" />
              <div>
                <p className="text-yellow-800 text-sm">{rateLimit.message}</p>
                <p className="text-yellow-600 text-xs mt-1">
                  Please wait {Math.ceil(rateLimit.timeUntilReset / 1000)} seconds
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <div>
                <p className="text-green-800 font-medium">Notification sent!</p>
                <p className="text-green-600 text-sm">
                  {employee.name} has been notified of your arrival.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {status !== 'success' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="input-field w-full text-lg py-3 touch-target"
                placeholder="Enter your full name"
                disabled={status === 'loading' || rateLimit.isLimited}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company (Optional)
              </label>
              <input
                {...register('company')}
                type="text"
                id="company"
                className="input-field w-full text-lg py-3 touch-target"
                placeholder="Your company name"
                disabled={status === 'loading' || rateLimit.isLimited}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary flex-1 py-3 text-lg touch-target"
                disabled={status === 'loading'}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 py-3 text-lg touch-target disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={!isValid || status === 'loading' || rateLimit.isLimited}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Notification'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
