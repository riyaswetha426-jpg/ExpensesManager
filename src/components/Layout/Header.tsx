import React from 'react';
import { Menu, Bell, Search, Sun, Moon, Download } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import ExportModal from '../Export/ExportModal';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showExportModal, setShowExportModal] = React.useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Export Data"
            >
              <Download className="w-6 h-6" />
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>
            
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </>
  );
};

export default Header;