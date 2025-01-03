import React from 'react';
import { Mail } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-indigo-600" />
              <div className="flex flex-col ml-2 items-start">
              <h1 className="text-2xl font-bold text-gray-900">Geoposler</h1>
              <p className="text-sm text-gray-500">Email Campaign Manager</p>
              </div>
            </div>
        </div>
      </div>
    </nav>
  );
};