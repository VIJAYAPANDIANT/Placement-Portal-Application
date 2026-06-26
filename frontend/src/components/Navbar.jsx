import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          🎓 Placement Portal
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {/* Authenticated Links */}
            {isAuthenticated ? (
              <>
                {role === 'admin' && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/admin" end>Dashboard</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/admin/companies/pending">Pending Companies</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/admin/drives/pending">Pending Drives</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/admin/students">Students</NavLink>
                    </li>
                  </>
                )}
                {role === 'company' && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/company" end>Dashboard</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/company/drives/create">Create Drive</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/company/drives" end>My Drives</NavLink>
                    </li>
                  </>
                )}
                {role === 'student' && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/student" end>Dashboard</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/student/drives">Browse Drives</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/student/applications">My Applications</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/student/interviews">My Interviews</NavLink>
                    </li>
                  </>
                )}
                <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                  <span className="badge bg-primary text-capitalize me-3 py-2 px-3">
                    {role}
                  </span>
                </li>
                <li className="nav-item mt-2 mt-lg-0">
                  <button
                    className="btn btn-outline-light btn-sm px-3"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              // Unauthenticated Links
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register/student">
                    Register as Student
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register/company">
                    Register as Company
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
