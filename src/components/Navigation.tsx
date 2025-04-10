import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Settings, Send, FileText, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation();

  return (
    <div className="flex space-x-8 mb-8">
      <NavLink
        to="/templates"
        className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
          currentPath === '/templates'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:text-indigo-600'
        }`}
      >
        <FileText className="h-5 w-5" />
        <span>{t('templates.title')}</span>
      </NavLink>
      <NavLink
        to="/contacts"
        className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
          currentPath === '/contacts'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:text-indigo-600'
        }`}
      >
        <Users className="h-5 w-5" />
        <span>{t('contacts.title')}</span>
      </NavLink>
      <NavLink
        to="/campaigns"
        className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
          currentPath === '/campaigns'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:text-indigo-600'
        }`}
      >
        <Send className="h-5 w-5" />
        <span>{t('campaigns.title')}</span>
      </NavLink>
      <NavLink
        to="/settings"
        className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
          currentPath === '/settings'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:text-indigo-600'
        }`}
      >
        <Settings className="h-5 w-5" />
        <span>{t('settings.title')}</span>
      </NavLink>
    </div>
  );
};