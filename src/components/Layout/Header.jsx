import React, { useState } from 'react';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center">
        <button
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 lg:hidden"
          onClick={toggleSidebar}
        >
          <FiMenu size={24} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 ml-2 lg:ml-0">
          Admin Dashboard
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700">
          <FiBell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <FiUser className="text-primary-600" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500">{user?.mobile || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;