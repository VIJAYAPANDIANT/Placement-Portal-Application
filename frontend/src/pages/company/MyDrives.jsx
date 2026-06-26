import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const MyDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanyDrives();
  }, []);

  const fetchCompanyDrives = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/company/drives');
      setDrives(res.data);
    } catch (err) {
      console.error('Error fetching company drives:', err);
      setError(err.response?.data?.error || 'Failed to retrieve your placement drives.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning text-dark text-capitalize px-3 py-2">Pending Admin Approval</span>;
      case 'approved':
        return <span className="badge bg-success text-capitalize px-3 py-2">Approved</span>;
      case 'rejected':
        return <span className="badge bg-danger text-capitalize px-3 py-2">Rejected</span>;
      case 'closed':
        return <span className="badge bg-secondary text-capitalize px-3 py-2">Closed</span>;
      default:
        return <span className="badge bg-light text-dark text-capitalize px-3 py-2 border">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Retrieving your drives...</p>
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
        <h2 className="fw-bold">My Placement Drives</h2>
        <button 
          className="btn btn-dark fw-bold px-4 shadow-sm"
          onClick={() => navigate('/company/drives/create')}
        >
          ➕ Create New Drive
        </button>
      </div>

      {drives.length === 0 ? (
        <div className="card shadow-sm border-0 mt-3">
          <div className="card-body p-5 text-center">
            <h4 className="text-muted mb-2">No drives created yet</h4>
            <p className="text-muted mb-4">You haven't submitted any placement drives yet.</p>
            <button 
              className="btn btn-success fw-bold px-4"
              onClick={() => navigate('/company/drives/create')}
            >
              Launch Your First Drive
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {drives.map(drive => (
            <div key={drive.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0 h-100 d-flex flex-column justify-content-between">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title fw-bold text-dark mb-0">{drive.job_title}</h5>
                  </div>
                  
                  <div className="mb-3">
                    {getStatusBadge(drive.status)}
                  </div>

                  <div className="mb-3 text-muted">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Package:</span>
                      <span className="fw-semibold text-dark">{drive.package_lpa} LPA</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Min CGPA:</span>
                      <span className="fw-semibold text-dark">&ge; {drive.eligibility_cgpa}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Deadline:</span>
                      <span className="fw-semibold text-dark">{drive.application_deadline || 'N/A'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Branches:</span>
                      <span className="fw-semibold text-dark text-end" style={{ maxWidth: '65%' }}>
                        {drive.eligible_branches?.join(', ') || 'All'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-light border-0 p-3 d-flex justify-content-between align-items-center">
                  <span className="text-muted">
                    👥 Applicants: <strong className="text-primary">{drive.applicant_count || 0}</strong>
                  </span>
                  <button
                    className="btn btn-outline-primary btn-sm fw-bold px-3"
                    onClick={() => navigate(`/company/drives/${drive.id}/applicants`)}
                  >
                    View Applicants
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDrives;
