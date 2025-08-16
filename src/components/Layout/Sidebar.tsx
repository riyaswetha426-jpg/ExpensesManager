import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  PieChart, 
  Target, 
  Download, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowUpDown },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'Budgets', path: '/budgets', icon: Target },
    { name: 'Export', path: '/export', icon: Download },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={clsx(
          'fixed left-0 top-0 z-50 h-full w-72 bg-white dark:bg-gray-800 shadow-xl',
          'lg:translate-x-0 lg:static lg:z-auto',
          'flex flex-col'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">ET</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900 dark:text-white">ExpenseTracker</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your finances</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={clsx('w-5 h-5', isActive && 'drop-shadow-sm')} />
                    <span className="font-medium">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;