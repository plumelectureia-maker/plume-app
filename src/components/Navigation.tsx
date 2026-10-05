import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PenTool, User, LogOut, Moon, Sun, Bell } from 'lucide-react';
import { useAuthStore, useUIStore, useNotificationStore } from '../store';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();

  React.useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
      const interval = setInterval(() => fetchNotifications(user.id), 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  const tabs = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/discover', icon: Search, label: 'Découvrir' },
    { path: '/write', icon: PenTool, label: 'Écrire' },
    { path: `/profile/${user?.username}`, icon: User, label: 'Profil' },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <PenTool size={24} className="text-blue-600" />
            <span className="hidden sm:inline">Plume</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <Link
              to="/notifications"
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Math.min(unreadCount, 9)}
                </span>
              )}
            </Link>

            <button
              onClick={() => signOut()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-red-600"
              title="Déconnexion"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom navigation tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto flex justify-around">
          {tabs.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition ${
                isActive(path)
                  ? 'text-blue-600 border-t-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title={label}
            >
              <Icon size={24} />
              <span className="text-xs mt-1 text-center">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Safe area for bottom nav */}
      <style>{`
        main, .main-content {
          padding-bottom: 70px;
        }
        @media (min-width: 640px) {
          main, .main-content {
            padding-bottom: 0;
          }
        }
      `}</style>
    </>
  );
};

export default Navigation;
