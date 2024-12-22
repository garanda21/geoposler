import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';
import { SmtpConfig } from '../../types';
import { Loader2 } from 'lucide-react'; // Import from lucide-react for the spinner


export const SettingsTab: React.FC = () => {
  const { smtpConfig, updateSmtpConfig, saveSettings,  isLoading, error } = useStore();
  const [formData, setFormData] = useState<SmtpConfig>(smtpConfig);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateSmtpConfig(formData);
      await saveSettings();
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">SMTP Settings</h2>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SMTP Host
            </label>
            <input
              type="text"
              name="host"
              value={formData.host}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SMTP Port
            </label>
            <input
              type="number"
              name="port"
              value={formData.port}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Email
            </label>
            <input
              type="email"
              name="fromEmail"
              value={formData.fromEmail}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Name
            </label>
            <input
              type="text"
              name="fromName"
              value={formData.fromName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}
              inline-flex items-center`}
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};