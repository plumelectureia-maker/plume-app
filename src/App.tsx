import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from './store';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Write from './pages/Write';
import Profile from './pages/Profile';
import StoryDetail from './pages/StoryDetail';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';

function App() {
  const { user, fetchUser } = useAuthStore();
  const { isDarkMode } = useUIStore();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  if (user === undefined) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <Router>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          {!user ? (
            <>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/write" element={<Write />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/story/:slug" element={<StoryDetail />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </>
          )}
        </Routes>
        {user && <Navigation />}
      </div>
    </Router>
  );
}

export default App;
