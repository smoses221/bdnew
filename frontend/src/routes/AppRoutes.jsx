import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import LoginPage from '../pages/LoginPage';
import AdminPage from '../pages/AdminPage';
import NosActisPage from '../pages/NosActisPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Navigate to="/bdteque" replace />} />
        <Route path="bdteque" element={<HomePage />} />
        <Route path="nos-actis" element={<NosActisPage />} />
        <Route path="sur-nous" element={<AboutPage />} />
        <Route path="login" element={<LoginPage />} />
        
        {/* Protected admin route */}
        <Route 
          path="admin" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/bdteque" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
