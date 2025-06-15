import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import BDHomepageAntd from './BDHomepageAntd';
import About from './About';
import Login from './Login';
import AdminControlPanel from './AdminControlPanel';

const App = () => {
  const [currentPage, setCurrentPage] = useState('bdteque');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setIsAuthenticated(true);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
    };

    checkAuthStatus();
  }, []);

  // Handle login success
  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    setIsAuthenticated(true);
    setCurrentUser(user);
    setCurrentPage('bdteque');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage('bdteque');
  };

  // Handle navigation
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'bdteque':
        return <BDHomepageAntd />;
      case 'sur-nous':
        return <About onNavigate={handleNavigate} />;
      case 'login':
        return (
          <Login 
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'admin':
        // Only show admin control panel if authenticated
        if (isAuthenticated && currentUser?.is_admin) {
          return (
            <AdminControlPanel 
              currentUser={currentUser}
            />
          );
        } else {
          // Redirect to login if not authenticated
          setCurrentPage('login');
          return (
            <Login 
              onNavigate={handleNavigate}
              onLoginSuccess={handleLoginSuccess}
            />
          );
        }
      default:
        return <BDHomepageAntd />;
    }
  };

  return (
    <div>
      {/* Show navigation on all pages */}
      <Navigation
        key={`nav-${isAuthenticated}-${currentUser?.id || 'guest'}`}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      {/* Page Content */}
      {renderPage()}
    </div>
  );
};

export default App;
