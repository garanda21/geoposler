import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Navigation } from './components/Navigation';
import { TemplatesTab } from './components/tabs/TemplatesTab';
import { ContactsTab } from './components/tabs/ContactsTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { CampaignTab } from './components/tabs/CampaignTab';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { Github } from 'lucide-react';

function App() {
 
  const fetchSettings = useStore(state => state.fetchSettings);

  // Fetch settings when the app initializes
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);


  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Navigation />
          <Routes>
            <Route path="/templates" element={<TemplatesTab />} />
            <Route path="/contacts" element={<ContactsTab />} />
            <Route path="/campaigns" element={<CampaignTab />} />
            <Route path="/settings" element={<SettingsTab />} />
            <Route path="/" element={<Navigate to="/templates" replace />} />
          </Routes>
        </div>
        <footer className="mt-auto border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Version {import.meta.env.PACKAGE_VERSION || '1.0.1'}</span>
              <a 
                href="https://github.com/garanda21/Geoposler"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-gray-700"
              >
                <Github className="w-4 h-4 mr-1" />
                View on GitHub
              </a>
            </div>
          </div>
        </footer>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;