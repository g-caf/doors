import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Bell, Mail, MessageSquare, Zap } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { useAppContext } from '../../contexts/AppContext';
import { settingsApi } from '../../services/api';
import { NotificationSettings } from '../../types';

const settingsSchema = z.object({
  method: z.enum(['email', 'slack', 'teams']),
  enabled: z.boolean(),
  customMessage: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const { state, dispatch } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    mode: 'onChange',
  });

  const watchMethod = watch('method');
  const watchEnabled = watch('enabled');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError('');
      const settings = await settingsApi.getNotifications();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: settings });
      reset(settings);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings. Please try again.');
      
      // Set default values
      const defaultSettings: NotificationSettings = {
        method: 'email',
        enabled: true,
        customMessage: 'You have a visitor waiting at the front desk.',
      };
      dispatch({ type: 'SET_NOTIFICATIONS', payload: defaultSettings });
      reset(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const updatedSettings = await settingsApi.updateNotifications(data);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedSettings });
      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'slack':
        return <MessageSquare className="w-5 h-5" />;
      case 'teams':
        return <Zap className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'email':
        return 'Send notifications via email to the employee';
      case 'slack':
        return 'Send notifications to Slack channels or direct messages';
      case 'teams':
        return 'Send notifications via Microsoft Teams';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure notification preferences and system settings</p>
      </div>

      {/* Error/Success Messages */}
      {error && <ErrorMessage message={error} onRetry={loadSettings} />}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Notification Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notification Settings
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure how employees are notified when visitors arrive
            </p>
          </div>

          <div className="space-y-6">
            {/* Enable/Disable Notifications */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  {...register('enabled')}
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable notifications
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                When disabled, no notifications will be sent to employees
              </p>
            </div>

            {/* Notification Method */}
            {watchEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Notification Method
                </label>
                <div className="space-y-3">
                  {(['email', 'slack', 'teams'] as const).map((method) => (
                    <label key={method} className="flex items-start space-x-3">
                      <input
                        {...register('method')}
                        type="radio"
                        value={method}
                        className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {getMethodIcon(method)}
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {method}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {getMethodDescription(method)}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.method && (
                  <p className="mt-1 text-sm text-red-600">{errors.method.message}</p>
                )}
              </div>
            )}

            {/* Custom Message */}
            {watchEnabled && (
              <div>
                <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Notification Message
                </label>
                <textarea
                  {...register('customMessage')}
                  id="customMessage"
                  rows={3}
                  className="input-field w-full resize-none"
                  placeholder="Enter a custom message to include in notifications..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be included in all notification {watchMethod}s
                </p>
                {errors.customMessage && (
                  <p className="mt-1 text-sm text-red-600">{errors.customMessage.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
            <p className="text-sm text-gray-600 mt-1">
              Current system status and configuration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Kiosk Status</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online and accessible</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total Employees</h3>
              <p className="text-sm text-gray-600">
                {state.employees.filter(emp => emp.isActive).length} active employees
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Application Version</h3>
              <p className="text-sm text-gray-600">v1.0.0</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Last Updated</h3>
              <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
