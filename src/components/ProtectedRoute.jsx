import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireEmployer = false, requireStudent = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Đang xác thực...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireEmployer && user.userType !== 'employer') {
    return <Navigate to="/" replace />;
  }

  if (requireStudent && user.userType !== 'student') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;