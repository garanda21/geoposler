import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  errors: Array<{ email: string; error: string }>;
  onClose: () => void;
}

export const ErrorDetails: React.FC<Props> = ({ errors, onClose }) => {
  const { t } = useTranslation();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('campaigns.errors.title')}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            title={t('campaigns.errors.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('campaigns.errors.emailColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('campaigns.errors.errorColumn')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {errors.map((error, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {error.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-red-600 break-words">
                    {error.error}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};