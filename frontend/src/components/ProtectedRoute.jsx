import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and a specific role.
 * 
 * VIVA TALKING POINT:
 * 1. Checks `isAuthenticated` from `AuthContext`. If false, uses React Router's `<Navigate>` to redirect to `/login`.
 * 2. Compares the user's role from the JWT token with the required `role` prop.
 * 3. If the role doesn't match, it displays a clean Bootstrap 5 access-denied alert instead of redirecting
 *    blindly, which avoids infinite redirection loops and provides clear feedback to the user.
 */
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-danger shadow-sm">
              <div className="card-header bg-danger text-white">
                <h5 className="card-title mb-0">Unauthorized Access</h5>
              </div>
              <div className="card-body text-center py-4">
                <p className="card-text fs-5">
                  You do not have permission to view the <strong>{role}</strong> dashboard.
                </p>
                <p className="text-muted mb-4">
                  Your current account role is <span className="badge bg-secondary">{userRole}</span>.
                </p>
                <a href="/login" className="btn btn-outline-danger">Go to Login</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
