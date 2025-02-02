import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { SmtpConfig } from '../../types';
import { Loader2 } from 'lucide-react'; // Import from lucide-react for the spinner


export const SettingsTab: React.FC = () => {
  const { smtpConfig, updateSmtpConfig, saveSettings,  isLoading, error } = useStore();
  const [formData, setFormData] = useState<SmtpConfig>(smtpConfig);
  const { t } = useTranslation();

  // Constants for SMTP ports
  const SSL_PORT = 465;
  const NON_SSL_PORT = 587;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement & HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name } = target;
    
    if (target.type === 'checkbox' && name === 'useSSL') {
      const isSSL = target.checked;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked,
        port: isSSL ? SSL_PORT : NON_SSL_PORT
      }));
    }
    else if (name === 'useAuth') {
      setFormData(prev => ({
        ...prev,
        [name]: target.checked,
        ...(target.checked === false && {
          username: '',
          password: ''
        })
      }));
    }
    else {
      const value = target.type === 'number' ? parseInt(target.value) : target.value;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      await updateSmtpConfig(formData);
      await saveSettings();
      toast.success(t('settings.toast.success'));
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(t('settings.toast.error'));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t('settings.smtp.title')}</h2>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
            {t('settings.smtp.host')}
            </label>
            <input
              type="text"
              name="host"
              value={formData.host}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">              
              <div className="flex-2 ml-4">
                <label className="block text-sm font-medium text-gray-700">
                {t('settings.smtp.port')}
                </label>
                <input
                  type="number"
                  name="port"
                  value={formData.port}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <div className="mt-1 text-xs text-gray-500">
                  {formData.useSSL ? t('settings.smtp.sslPortMessage') : t('settings.smtp.tlsPortMessage')}
                </div>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="useSSL"
                  checked={formData.useSSL}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">{t('settings.smtp.useSSL')}</span>
              </label>
            </div>
          </div>          
          <div>
            <label className="block text-sm font-medium text-gray-700">
            {t('settings.smtp.fromEmail')}
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
            {t('settings.smtp.fromName')}
            </label>
            <input
              type="text"
              name="fromName"
              value={formData.fromName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="useAuth"
                  checked={formData.useAuth}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">{t('settings.smtp.smtpAuth')}</span>
              </label>
              <p className="mt-1 text-sm text-gray-500">{t('settings.smtp.smtpAuthWarning')}</p>
            </div>

            {Boolean(formData.useAuth) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                  {t('settings.smtp.username')}
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                  {t('settings.smtp.password')}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
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
            {isLoading ? t('settings.smtp.savingButton') : t('settings.smtp.saveButton') }
          </button>
        </div>
      </div>
    </div>
  );
};