import logo from '../icon.png';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
import { getAvailableLanguages } from '../utils/languageUtils';

export const Navbar: React.FC = () => {
  const { i18n } = useTranslation();
  const languages = getAvailableLanguages();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value);
  };

  return (
    <nav className="bg-[#16161E] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <img src={logo} alt="Geoposler Logo" className="h-8 w-10" />
            <div className="flex flex-col ml-2 items-start">
              <h1 className="text-2xl font-bold text-white">Geoposler</h1>
              <p className="text-sm text-gray-300">Email Campaign Manager</p>
            </div>
          </div>
          
          {/* Language Switcher */}
          <div className="flex items-center">
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
              className="bg-[#1E1E2A] text-white px-3 py-1 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};