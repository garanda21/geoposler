import React from 'react';
import logo from '../icon.png';

export const Navbar: React.FC = () => {
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
        </div>
      </div>
    </nav>
  );
};