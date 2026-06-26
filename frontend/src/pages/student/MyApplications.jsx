import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/student/applications');
      setApplications(res.data);
    } catch (err) {
      console.error('Error fetching student applications:', err);
      setError(err.response?.data?.error || 'Failed to retrieve applications.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return <span className="badge bg-primary text-capitalize px-3 py-2">Applied</span>;
      case 'shortlisted':
        return <span className="badge bg-warning text-dark text-capitalize px-3 py-2">Shortlisted</span>;
      case 'selected':
        return <span className="badge bg-success text-capitalize px-3 py-2">Selected</span>;
      case 'rejected':
        return <span className="badge bg-danger text-capitalize px-3 py-2">Rejected</span>;
      default:
        return <span className="badge bg-secondary text-capitalize px-3 py-2">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Retrieving your application history...</p>
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
      <h2 className="mb-4 fw-bold">My Applications</h2>

      {applications.length === 0 ? (
        <div className="card shadow-sm border-0 mt-3">
          <div className="card-body p-5 text-center">
            <h4 className="text-muted mb-2">No applications submitted yet</h4>
            <p className="text-muted mb-4">You haven't applied to any drives yet.</p>
            <a href="/student/drives" className="btn btn-primary fw-bold px-4">
              Explore Active Drives
            </a>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="ps-4">Company Name</th>
                  <th scope="col">Job Title</th>
                  <th scope="col">Package</th>
                  <th scope="col">Applied On</th>
                  <th scope="col" className="pe-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td className="fw-semibold ps-4 text-primary">{app.company_name}</td>
                    <td className="fw-medium">{app.job_title}</td>
                    <td>
                      <span className="fw-bold">{app.package_lpa} LPA</span>
                    </td>
                    <td>{app.applied_on || 'N/A'}</td>
                    <td className="pe-4">{getStatusBadge(app.status)}</td>
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

export default MyApplications;
