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
                <li className="nav-item">
                  {role === 'admin' && (
                    <NavLink className="nav-link" to="/admin">
                      Admin Dashboard
                    </NavLink>
                  )}
                  {role === 'company' && (
                    <NavLink className="nav-link" to="/company">
                      Company Dashboard
                    </NavLink>
                  )}
                  {role === 'student' && (
                    <NavLink className="nav-link" to="/student">
                      Student Dashboard
                    </NavLink>
                  )}
                </li>
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
                    Register Student
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register/company">
                    Register Company
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
