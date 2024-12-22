import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Navigation } from './components/Navigation';
import { TemplatesTab } from './components/tabs/TemplatesTab';
import { ContactsTab } from './components/tabs/ContactsTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { CampaignTab } from './components/tabs/CampaignTab';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';

function App() {
  const [activeTab, setActiveTab] = useState<'templates' | 'contacts' | 'campaigns' | 'settings'>('templates');

  const fetchSettings = useStore(state => state.fetchSettings);

  const renderContent = () => {
    switch (activeTab) {
      case 'templates':
        return <TemplatesTab />;
      case 'contacts':
        return <ContactsTab />;
      case 'campaigns':
        return <CampaignTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  // Fetch settings when the app initializes
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        {renderContent()}
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;