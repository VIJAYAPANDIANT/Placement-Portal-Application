import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the AuthContext
const AuthContext = createContext(null);

/**
 * Manual JWT Decode Helper
 * A JWT consists of three base64url-encoded parts: Header, Payload, and Signature, separated by dots (.).
 * This helper splits the token, extracts the payload (second part), decodes it from base64,
 * and parses it as a JSON object to read claims like the user's role.
 * 
 * VIVA TALKING POINT:
 * This avoids installing external libraries (like jwt-decode) and does not require a separate 
 * backend API call to fetch the logged-in user's profile/role, reducing API latency and overhead.
 */
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Invalid token format', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on initial page load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const payload = decodeToken(storedToken);
      if (payload && payload.role) {
        setToken(storedToken);
        setRole(payload.role);
        setIsAuthenticated(true);
      } else {
        // Clear corrupt or expired token
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Save token, decode role, and set state
  const login = (jwtToken) => {
    localStorage.setItem('token', jwtToken);
    const payload = decodeToken(jwtToken);
    if (payload && payload.role) {
      setToken(jwtToken);
      setRole(payload.role);
      setIsAuthenticated(true);
      return payload.role;
    }
    return null;
  };

  // Clear state and localStorage
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, role, isAuthenticated, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom Hook to consume AuthContext easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
