import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const RegisterCompany = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    hr_contact: '',
    website: '',
    industry: '',
    description: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Perform form validation
  const validateForm = () => {
    const { name, email, password, hr_contact, website, industry } = formData;

    if (!name || !email || !password || !hr_contact || !website || !industry) {
      setError('All basic fields are required.');
      return false;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Send register request to company endpoint
      const response = await api.post('/auth/register/company', formData);

      // Backend returns 201 Created with confirmation message
      setSuccess('Registration submitted successfully! Awaiting Admin approval before you can log in.');
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        hr_contact: '',
        website: '',
        industry: '',
        description: '',
      });

      // Redirect after 3 seconds so the user can read the approval warning message
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error(err);
      const serverMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <h2 className="text-center mb-4 fw-bold">Company Registration</h2>

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  {/* Left Column */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Corporate Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="hr_contact" className="form-label">HR Contact Name / Number</label>
                      <input
                        type="text"
                        className="form-control"
                        id="hr_contact"
                        name="hr_contact"
                        value={formData.hr_contact}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="website" className="form-label">Company Website URL</label>
                      <input
                        type="url"
                        className="form-control"
                        id="website"
                        name="website"
                        placeholder="https://example.com"
                        value={formData.website}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="industry" className="form-label">Industry Sector</label>
                      <input
                        type="text"
                        className="form-control"
                        id="industry"
                        name="industry"
                        placeholder="e.g. Technology, Finance"
                        value={formData.industry}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Company Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows="3"
                        placeholder="Brief overview of company operations..."
                        value={formData.description}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : 'Submit Registration'}
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              <div className="text-center small text-muted">
                Already have an account? <Link to="/login" className="text-decoration-none fw-semibold">Sign In</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompany;
