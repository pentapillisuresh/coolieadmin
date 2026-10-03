import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiDollarSign,
  FiStar,
  FiHelpCircle,
  FiGift,
  FiBookOpen,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiX,
  FiLayers,
  FiBriefcase,
  FiBell,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();

  const menuItems = [
    {
      path: '/dashboard',
      icon: FiGrid,
      label: 'Dashboard',
    },
    {
      path: '/users',
      icon: FiUsers,
      label: 'Users',
    },
    {
      path: '/workers',
      icon: FiUserCheck,
      label: 'Workers',
    },
    {
      path: '/bookings',
      icon: FiCalendar,
      label: 'Bookings',
    },
    {
      path: '/jobs',
      icon: FiBriefcase,
      label: 'Jobs & Assignments',
    },
    {
      path: '/payments',
      icon: FiDollarSign,
      label: 'Payments',
    },
    {
      path: '/reviews',
      icon: FiStar,
      label: 'Reviews',
    },
    {
      path: '/notifications',
      icon: FiBell,
      label: 'Notifications',
    },
    {
      path: '/categories',
      icon: FiLayers,
      label: 'Categories',
    },
    {
      path: '/services',
      icon: FiFileText,
      label: 'Services',
    },
    {
      path: '/tickets',
      icon: FiHelpCircle,
      label: 'Support Tickets',
    },
    {
      path: '/promotions',
      icon: FiGift,
      label: 'Promotions',
    },
    {
      path: '/training',
      icon: FiBookOpen,
      label: 'Training',
    },
    {
      path: '/faq',
      icon: FiHelpCircle,
      label: 'FAQs',
    },
    {
      path: '/settings',
      icon: FiSettings,
      label: 'Settings',
    },
  ];

  const handleNavigation = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 ${
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                C
              </span>
            </div>

            <span className="text-xl font-bold text-gray-800">
              Admin
            </span>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />

                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          {/* Logout */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={logout}
              className="flex items-center w-full px-3 py-2.5 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <FiLogOut className="w-5 h-5 mr-3 flex-shrink-0" />

              <span className="text-sm font-medium">
                Logout
              </span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;