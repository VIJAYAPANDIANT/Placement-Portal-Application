import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const PendingCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null); // { type: 'success'|'danger', message: '' }

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const fetchPendingCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/companies/pending');
      setCompanies(res.data);
    } catch (err) {
      console.error('Error fetching pending companies:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending companies.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (id, action) => {
    try {
      setAlert(null);
      const response = await api.put(`/admin/companies/${id}/approve`, { action });
      
      // Update state: remove company from local list immediately
      setCompanies(prev => prev.filter(company => company.id !== id));
      
      setAlert({
        type: 'success',
        message: response.data.message || `Company successfully ${action === 'approve' ? 'approved' : 'rejected'}.`
      });
      
      // Clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error(`Error updating company ${id} status:`, err);
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || `Failed to ${action} company.`
      });
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Fetching pending company requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Pending Companies Approval</h2>
        <span className="badge bg-secondary p-2 fs-6">
          Pending count: {companies.length}
        </span>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)} aria-label="Close"></button>
        </div>
      )}

      {companies.length === 0 ? (
        <div className="card shadow-sm border-0 mt-3">
          <div className="card-body p-5 text-center">
            <h4 className="text-muted">🎉 No pending companies to approve!</h4>
            <p className="text-muted mb-0">All registered companies have been processed.</p>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="ps-4">Company Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Industry</th>
                  <th scope="col">HR Contact</th>
                  <th scope="col" className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr key={company.id}>
                    <td className="fw-semibold ps-4">{company.name}</td>
                    <td>{company.email}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {company.industry || 'N/A'}
                      </span>
                    </td>
                    <td>{company.hr_contact || 'N/A'}</td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-success btn-sm me-2 fw-semibold px-3"
                        onClick={() => handleApproveReject(company.id, 'approve')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm fw-semibold px-3"
                        onClick={() => handleApproveReject(company.id, 'reject')}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingCompanies;
