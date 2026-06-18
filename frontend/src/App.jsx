import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import RegisterCompany from './pages/RegisterCompany';

// Placeholder Dashboards for Milestone 2
const AdminDashboard = () => (
  <div className="container mt-5">
    <div className="card shadow-sm border-0">
      <div className="card-body p-5 text-center">
        <h1 className="fw-bold mb-3 text-primary">Admin Dashboard</h1>
        <p className="lead text-muted">Manage companies, student profiles, and placement drives.</p>
        <span className="badge bg-warning text-dark py-2 px-3 fs-6">
          ⚙️ Dashboard Content Coming Soon (Milestone 2)
        </span>
      </div>
    </div>
  </div>
);

const CompanyDashboard = () => (
  <div className="container mt-5">
    <div className="card shadow-sm border-0">
      <div className="card-body p-5 text-center">
        <h1 className="fw-bold mb-3 text-success">Company Dashboard</h1>
        <p className="lead text-muted">Create placement drives, shortlist candidates, and schedule interviews.</p>
        <span className="badge bg-warning text-dark py-2 px-3 fs-6">
          🏢 Dashboard Content Coming Soon (Milestone 2)
        </span>
      </div>
    </div>
  </div>
);

const StudentDashboard = () => (
  <div className="container mt-5">
    <div className="card shadow-sm border-0">
      <div className="card-body p-5 text-center">
        <h1 className="fw-bold mb-3 text-info text-dark">Student Dashboard</h1>
        <p className="lead text-muted">Apply for placement drives, track interview status, and view offers.</p>
        <span className="badge bg-warning text-dark py-2 px-3 fs-6">
          🎓 Dashboard Content Coming Soon (Milestone 2)
        </span>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100 bg-light">
        {/* Navbar is always visible at the top */}
        <Navbar />
        
        {/* Main Content Area */}
        <div className="flex-grow-1 py-4">
          <Routes>
            {/* Root Redirect to Login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Authentication & Registration */}
            <Route path="/login" element={<Login />} />
            <Route path="/register/student" element={<RegisterStudent />} />
            <Route path="/register/company" element={<RegisterCompany />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/company/*" 
              element={
                <ProtectedRoute role="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/*" 
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback Catch-All Route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
