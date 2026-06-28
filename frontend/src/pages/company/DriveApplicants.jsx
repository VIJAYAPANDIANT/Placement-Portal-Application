import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const DriveApplicants = () => {
  const { id: driveId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [alert, setAlert] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [interviewData, setInterviewData] = useState({
    interview_date: '',
    interview_mode: 'online',
    location_or_link: '',
    notes: ''
  });

  useEffect(() => {
    fetchApplicants();
  }, [driveId]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/company/drives/${driveId}/applicants`);
      setApplicants(res.data);
    } catch (err) {
      console.error('Error fetching drive applicants:', err);
      setError(err.response?.data?.error || 'Failed to fetch applicants.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      setAlert(null);
      await api.put(`/company/applications/${appId}/status`, { status });
      setAlert({
        type: 'success',
        message: `Applicant status updated to ${status} successfully.`
      });
      fetchApplicants();
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setAlert({
        type: 'danger',
        message: err.response?.data?.error || 'Failed to update candidate status.'
      });
    }
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setInterviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    setAlert(null);
    try {
      setModalLoading(true);
      const res = await api.post(`/company/drives/${driveId}/interview`, interviewData);
      setAlert({
        type: 'success',
        message: res.data.message || 'Interview scheduled successfully.'
      });
      setShowModal(false);
      setInterviewData({
        interview_date: '',
        interview_mode: 'online',
        location_or_link: '',
        notes: ''
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error('Error scheduling interview:', err);
      setAlert({
        type: 'danger',
        message: err.response?.data?.error || 'Failed to schedule interview (it might be already scheduled).'
      });
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return <span className="status-pill pill-info">● Applied</span>;
      case 'shortlisted':
        return <span className="status-pill pill-purple">● Shortlisted</span>;
      case 'selected':
        return <span className="status-pill pill-success">● Selected</span>;
      case 'rejected':
        return <span className="status-pill pill-danger">● Rejected</span>;
      default:
        return <span className="status-pill pill-warning">● {status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Retrieving applicant directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-card p-4 text-center border-danger">
        <p className="text-danger mb-3">{error}</p>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/company/drives')}>
          Back to My Drives
        </button>
      </div>
    );
  }

  const capacityProgress = Math.min(Math.round((applicants.length / 50) * 100), 100);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <button className="btn btn-sm btn-outline-secondary mb-2" style={{ borderRadius: '6px' }} onClick={() => navigate('/company/drives')}>
            &larr; Back to My Drives
          </button>
          <h4 className="fw-bold mb-0">Drive Candidates & Applications</h4>
        </div>
        <button
          className="btn btn-primary fw-bold btn-sm px-3 py-2"
          style={{ borderRadius: '8px' }}
          onClick={() => setShowModal(true)}
        >
          📅 Schedule Drive Interview
        </button>
      </div>

      {/* Progress Bar for Application Volume */}
      <div className="panel-card p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '12px' }}>
          <span className="fw-bold text-muted">APPLICATION CAPACITY VOLUME</span>
          <span className="fw-bold text-primary">{applicants.length} / 50 Applications</span>
        </div>
        <div className="progress" style={{ height: '8px', borderRadius: '4px', background: 'var(--table-hover)' }}>
          <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${capacityProgress}%` }}></div>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show mb-4`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)} aria-label="Close"></button>
        </div>
      )}

      <div className="panel-card">
        <div className="panel-header">
          <h5 className="panel-title">Registered Student Candidates</h5>
          <span className="status-pill pill-info">👥 {applicants.length} Total Applicants</span>
        </div>

        {applicants.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '2.5rem' }}>📋</div>
            <p className="mt-3 fw-semibold mb-1">No applications received yet</p>
            <small className="text-muted">Eligible students will appear here once they apply to this drive.</small>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="enhanced-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((app, idx) => (
                  <tr key={app.application_id}>
                    <td className="text-muted fw-bold" style={{ fontSize: '11px' }}>{idx + 1}</td>
                    <td className="fw-bold">{app.student_name}</td>
                    <td>{app.roll_number}</td>
                    <td><span className="status-pill pill-purple">{app.branch}</span></td>
                    <td className="fw-bold">{app.cgpa}</td>
                    <td>{getStatusBadge(app.application_status)}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-1 px-2 py-1"
                        style={{ borderRadius: '6px', fontSize: '11px' }}
                        onClick={() => handleUpdateStatus(app.application_id, 'shortlisted')}
                        disabled={app.application_status === 'shortlisted'}
                      >
                        Shortlist
                      </button>
                      <button
                        className="btn btn-sm btn-outline-success me-1 px-2 py-1"
                        style={{ borderRadius: '6px', fontSize: '11px' }}
                        onClick={() => handleUpdateStatus(app.application_id, 'selected')}
                        disabled={app.application_status === 'selected'}
                      >
                        Select
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger px-2 py-1"
                        style={{ borderRadius: '6px', fontSize: '11px' }}
                        onClick={() => handleUpdateStatus(app.application_id, 'rejected')}
                        disabled={app.application_status === 'rejected'}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content panel-card border-0 shadow-lg">
                <div className="modal-header panel-header">
                  <h5 className="modal-title fw-bold">🗓️ Schedule Drive Interview</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                </div>
                <form onSubmit={handleScheduleInterview}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label htmlFor="interview_date" className="form-label fw-bold" style={{ fontSize: '12px' }}>INTERVIEW DATE *</label>
                      <input
                        type="date"
                        className="form-control"
                        id="interview_date"
                        name="interview_date"
                        value={interviewData.interview_date}
                        onChange={handleModalChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="interview_mode" className="form-label fw-bold" style={{ fontSize: '12px' }}>INTERVIEW MODE *</label>
                      <select
                        className="form-select"
                        id="interview_mode"
                        name="interview_mode"
                        value={interviewData.interview_mode}
                        onChange={handleModalChange}
                        required
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="location_or_link" className="form-label fw-bold" style={{ fontSize: '12px' }}>
                        {interviewData.interview_mode === 'online' ? 'MEETING LINK' : 'CAMPUS VENUE / LOCATION'}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="location_or_link"
                        name="location_or_link"
                        value={interviewData.location_or_link}
                        onChange={handleModalChange}
                        placeholder={interviewData.interview_mode === 'online' ? 'e.g. Google Meet or Zoom URL' : 'e.g. Placement Cell Hall A'}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="notes" className="form-label fw-bold" style={{ fontSize: '12px' }}>INSTRUCTIONS & NOTES</label>
                      <textarea
                        className="form-control"
                        id="notes"
                        name="notes"
                        rows="3"
                        value={interviewData.notes}
                        onChange={handleModalChange}
                        placeholder="Topics to prepare, documentation required..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer p-3 border-top" style={{ borderColor: 'var(--card-border)' }}>
                    <button type="button" className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '6px' }} onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-sm btn-primary px-4 fw-bold" style={{ borderRadius: '6px' }} disabled={modalLoading}>
                      {modalLoading ? 'Scheduling...' : 'Confirm & Schedule'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DriveApplicants;
