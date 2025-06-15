import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, currentUser } = useContext(UserContext);
  const location = useLocation();

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin access required but user is not admin, redirect to home
  if (requireAdmin && !currentUser?.is_admin) {
    return <Navigate to="/bdteque" replace />;
  }

  return children;
};

export default ProtectedRoute;
