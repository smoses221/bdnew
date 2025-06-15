import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider value={{ currentUser, isAuthenticated, handleLoginSuccess, handleLogout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
