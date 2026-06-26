import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import RegisterCompany from './pages/RegisterCompany';

// Import Admin Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingCompanies from './pages/admin/PendingCompanies';
import PendingDrives from './pages/admin/PendingDrives';
import StudentList from './pages/admin/StudentList';

// Import Company Dashboard Pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import CreateDrive from './pages/company/CreateDrive';
import MyDrives from './pages/company/MyDrives';
import DriveApplicants from './pages/company/DriveApplicants';

// Import Student Dashboard Pages
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseDrives from './pages/student/BrowseDrives';
import MyApplications from './pages/student/MyApplications';
import MyInterviews from './pages/student/MyInterviews';

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
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/companies/pending" 
              element={
                <ProtectedRoute role="admin">
                  <PendingCompanies />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/drives/pending" 
              element={
                <ProtectedRoute role="admin">
                  <PendingDrives />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/students" 
              element={
                <ProtectedRoute role="admin">
                  <StudentList />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Company Routes */}
            <Route 
              path="/company" 
              element={
                <ProtectedRoute role="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/company/drives/create" 
              element={
                <ProtectedRoute role="company">
                  <CreateDrive />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/company/drives" 
              element={
                <ProtectedRoute role="company">
                  <MyDrives />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/company/drives/:id/applicants" 
              element={
                <ProtectedRoute role="company">
                  <DriveApplicants />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Student Routes */}
            <Route 
              path="/student" 
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/drives" 
              element={
                <ProtectedRoute role="student">
                  <BrowseDrives />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/applications" 
              element={
                <ProtectedRoute role="student">
                  <MyApplications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/interviews" 
              element={
                <ProtectedRoute role="student">
                  <MyInterviews />
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
