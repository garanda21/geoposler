import React from 'react';
import { Settings, Send, FileText, Users } from 'lucide-react';

interface Props {
  activeTab: string;
  onTabChange: (tab: 'templates' | 'contacts' | 'campaigns' | 'settings') => void;
}

export const Navigation: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-8 mb-8">
      <button
        onClick={() => onTabChange('templates')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
          activeTab === 'templates'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:text-indigo-600'
        }`}
      >
        <FileText className="h-5 w-5" />
        <span>Templates</span>
      </button>
      <button
        onClick={() => onTabChange('contacts')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
          activeTab === 'contacts'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:text-indigo-600'
        }`}
      >
        <Users className="h-5 w-5" />
        <span>Contacts</span>
      </button>
      <button
        onClick={() => onTabChange('campaigns')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
          activeTab === 'campaigns'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:text-indigo-600'
        }`}
      >
        <Send className="h-5 w-5" />
        <span>Campaigns</span>
      </button>
      <button
        onClick={() => onTabChange('settings')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
          activeTab === 'settings'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:text-indigo-600'
        }`}
      >
        <Settings className="h-5 w-5" />
        <span>Settings</span>
      </button>
    </div>
  );
};