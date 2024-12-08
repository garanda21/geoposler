import React from 'react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

export const SettingsTab: React.FC = () => {
  const { smtpConfig, updateSmtpConfig } = useStore();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">SMTP Settings</h2>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SMTP Host
            </label>
            <input
              type="text"
              value={smtpConfig.host}
              onChange={(e) => updateSmtpConfig({ host: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SMTP Port
            </label>
            <input
              type="number"
              value={smtpConfig.port}
              onChange={(e) => updateSmtpConfig({ port: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={smtpConfig.username}
              onChange={(e) => updateSmtpConfig({ username: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={smtpConfig.password}
              onChange={(e) => updateSmtpConfig({ password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Email
            </label>
            <input
              type="email"
              value={smtpConfig.fromEmail}
              onChange={(e) => updateSmtpConfig({ fromEmail: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Name
            </label>
            <input
              type="text"
              value={smtpConfig.fromName}
              onChange={(e) => updateSmtpConfig({ fromName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => toast.success('Settings saved!')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};