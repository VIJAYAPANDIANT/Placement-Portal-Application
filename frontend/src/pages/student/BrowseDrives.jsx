import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const BrowseDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Track IDs of drives applied during this session to update the UI button status
  const [appliedDrives, setAppliedDrives] = useState([]);
  
  // Notification states
  const [alertInfo, setAlertInfo] = useState(null); // { type: 'success'|'danger', message: '', driveId: null }

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/student/drives');
      setDrives(res.data);
    } catch (err) {
      console.error('Error fetching drives:', err);
      setError(err.response?.data?.error || 'Failed to retrieve available placement drives.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (id) => {
    setAlertInfo(null);
    try {
      const res = await api.post(`/student/drives/${id}/apply`);
      
      setAlertInfo({
        type: 'success',
        message: res.data.message || 'Application submitted successfully',
        driveId: id
      });

      // Disable button for this drive by adding it to applied state
      setAppliedDrives(prev => [...prev, id]);
    } catch (err) {
      console.error('Error applying to drive:', err);
      setAlertInfo({
        type: 'danger',
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to submit application.',
        driveId: id
      });
    }
  };

  const isDeadlinePassed = (deadlineStr) => {
    if (!deadlineStr) return false;
    const deadline = new Date(deadlineStr);
    deadline.setHours(23, 59, 59, 999); // Allow applications until the end of the deadline day
    const today = new Date();
    return deadline < today;
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Scanning active placement drives...</p>
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
      <h2 className="mb-4 fw-bold">Active Placement Drives</h2>

      {drives.length === 0 ? (
        <div className="card shadow-sm border-0 py-5">
          <div className="card-body text-center">
            <h4 className="text-muted">📢 No drives available right now</h4>
            <p className="text-muted mb-0">Check back later for new placement opportunities.</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {drives.map(drive => {
            const passed = isDeadlinePassed(drive.application_deadline);
            const isApplied = appliedDrives.includes(drive.id);
            const cardAlert = alertInfo?.driveId === drive.id ? alertInfo : null;

            return (
              <div key={drive.id} className="col-lg-6">
                <div className="card shadow-sm border-0 h-100 d-flex flex-column justify-content-between">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h4 className="fw-bold text-dark mb-1">{drive.job_title}</h4>
                        <h6 className="text-primary fw-semibold mb-0">{drive.company_name}</h6>
                      </div>
                      <span className="badge bg-success fs-6 py-2 px-3">
                        {drive.package_lpa} LPA
                      </span>
                    </div>

                    <p className="card-text text-muted text-truncate-3 mb-4">
                      {drive.job_description || 'No job description provided.'}
                    </p>

                    <div className="row g-2 mb-3 bg-light p-3 rounded">
                      <div className="col-sm-6">
                        <span className="small text-muted d-block">Minimum CGPA Required</span>
                        <strong className="text-dark">&ge; {drive.eligibility_cgpa}</strong>
                      </div>
                      <div className="col-sm-6">
                        <span className="small text-muted d-block">Eligible Branches</span>
                        <strong className="text-dark small">
                          {drive.eligible_branches?.join(', ') || 'All Branches'}
                        </strong>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center text-muted small">
                      <span>Application Deadline:</span>
                      <span className={`fw-bold ${passed ? 'text-danger' : 'text-dark'}`}>
                        {drive.application_deadline || 'N/A'}
                      </span>
                    </div>

                    {/* Inline alert display for this specific drive card */}
                    {cardAlert && (
                      <div className={`alert alert-${cardAlert.type} mt-3 mb-0 py-2 fs-6`} role="alert">
                        {cardAlert.message}
                      </div>
                    )}
                  </div>

                  <div className="card-footer bg-light border-0 p-3 text-end">
                    {passed ? (
                      <span className="badge bg-danger fs-6 py-2 px-3 w-100 d-block text-center">
                        ⏳ Deadline Passed
                      </span>
                    ) : (
                      <button
                        className={`btn w-100 fw-bold py-2 ${isApplied ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => handleApply(drive.id)}
                        disabled={isApplied}
                      >
                        {isApplied ? '✔️ Applied' : 'Apply Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrowseDrives;
