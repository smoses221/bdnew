import React, { useState, useEffect } from 'react';
import BDHomepageAntd from './BDHomepageAntd';
import About from './About';
import Login from './Login';
import AdminControlPanel from './AdminControlPanel';
import UserProvider from '../context/UserContext';

const App = () => {
  const [currentPage, setCurrentPage] = useState('bdteque');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // not used atm
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

  const renderPage = () => {
    switch (currentPage) {
      case 'bdteque':
        console.log("in switch Current user:", currentUser);
        return (
          <BDHomepageAntd 
            onNavigate={setCurrentPage} 
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        );
      case 'sur-nous':
        return <About onNavigate={setCurrentPage} />;
      case 'login':
        return (
          <Login 
            onNavigate={setCurrentPage}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'admin':
        // Only show admin control panel if authenticated
        if (isAuthenticated && currentUser?.is_admin) {
          return (
            <AdminControlPanel 
              onNavigate={setCurrentPage}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          );
        } else {
          // Redirect to login if not authenticated
          setCurrentPage('login');
          return (
            <Login 
              onNavigate={setCurrentPage}
              onLoginSuccess={handleLoginSuccess}
            />
          );
        }
      default:
        return (
          <BDHomepageAntd 
            onNavigate={setCurrentPage}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <UserProvider>
      {renderPage()}
    </UserProvider>
  );
};

export default App;
