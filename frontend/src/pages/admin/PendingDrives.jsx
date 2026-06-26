import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const PendingDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null); // { type: 'success'|'danger', message: '' }

  useEffect(() => {
    fetchPendingDrives();
  }, []);

  const fetchPendingDrives = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/drives/pending');
      setDrives(res.data);
    } catch (err) {
      console.error('Error fetching pending drives:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending drives.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (id, action) => {
    try {
      setAlert(null);
      const response = await api.put(`/admin/drives/${id}/approve`, { action });
      
      // Update state: remove drive from list immediately
      setDrives(prev => prev.filter(drive => drive.id !== id));
      
      setAlert({
        type: 'success',
        message: response.data.message || `Drive successfully ${action === 'approve' ? 'approved' : 'rejected'}.`
      });
      
      // Clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error(`Error updating drive ${id} status:`, err);
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || `Failed to ${action} drive.`
      });
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Fetching pending placement drives...</p>
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
        <h2 className="fw-bold">Pending Placement Drives</h2>
        <span className="badge bg-secondary p-2 fs-6">
          Pending count: {drives.length}
        </span>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)} aria-label="Close"></button>
        </div>
      )}

      {drives.length === 0 ? (
        <div className="card shadow-sm border-0 mt-3">
          <div className="card-body p-5 text-center">
            <h4 className="text-muted">🎉 No pending drives to approve!</h4>
            <p className="text-muted mb-0">All placement drives have been processed.</p>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="ps-4">Job Title</th>
                  <th scope="col">Company Name</th>
                  <th scope="col">Package (LPA)</th>
                  <th scope="col">Eligibility CGPA</th>
                  <th scope="col">Deadline</th>
                  <th scope="col" className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drives.map(drive => (
                  <tr key={drive.id}>
                    <td className="fw-semibold ps-4">{drive.job_title}</td>
                    <td>{drive.company_name}</td>
                    <td>
                      <span className="fw-bold text-success">{drive.package_lpa} LPA</span>
                    </td>
                    <td>
                      <span className="badge bg-info text-dark">
                        &ge; {drive.eligibility_cgpa}
                      </span>
                    </td>
                    <td>{drive.application_deadline || 'N/A'}</td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-success btn-sm me-2 fw-semibold px-3"
                        onClick={() => handleApproveReject(drive.id, 'approve')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm fw-semibold px-3"
                        onClick={() => handleApproveReject(drive.id, 'reject')}
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

export default PendingDrives;
