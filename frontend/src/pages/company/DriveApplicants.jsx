import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const DriveApplicants = () => {
  const { id: driveId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Alert state
  const [alert, setAlert] = useState(null); // { type: 'success'|'danger', message: '' }

  // Modal state
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
      // Refresh list
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
      // Reset form
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
        return <span className="badge bg-primary text-capitalize px-2.5 py-1.5">Applied</span>;
      case 'shortlisted':
        return <span className="badge bg-warning text-dark text-capitalize px-2.5 py-1.5">Shortlisted</span>;
      case 'selected':
        return <span className="badge bg-success text-capitalize px-2.5 py-1.5">Selected</span>;
      case 'rejected':
        return <span className="badge bg-danger text-capitalize px-2.5 py-1.5">Rejected</span>;
      default:
        return <span className="badge bg-secondary text-capitalize px-2.5 py-1.5">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Retrieving applicant directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/company/drives')}>
          Back to Drives
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <button className="btn btn-sm btn-outline-secondary mb-2" onClick={() => navigate('/company/drives')}>
            &larr; Back to My Drives
          </button>
          <h2 className="fw-bold mb-0">Drive Candidates & Applications</h2>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary fw-bold shadow-sm"
            onClick={() => setShowModal(true)}
          >
            🗓️ Schedule Interview
          </button>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)} aria-label="Close"></button>
        </div>
      )}

      {applicants.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body p-5 text-center">
            <h4 className="text-muted mb-2">No applications yet</h4>
            <p className="text-muted mb-0">Students haven't applied to this drive yet or it is not yet approved.</p>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="ps-4">Student Name</th>
                  <th scope="col">Roll Number</th>
                  <th scope="col">Branch</th>
                  <th scope="col">CGPA</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map(app => (
                  <tr key={app.application_id}>
                    <td className="fw-semibold ps-4">{app.student_name}</td>
                    <td>{app.roll_number}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {app.branch}
                      </span>
                    </td>
                    <td>{app.cgpa}</td>
                    <td>{getStatusBadge(app.application_status)}</td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-blue btn-outline-primary btn-sm me-1 fw-semibold"
                        onClick={() => handleUpdateStatus(app.application_id, 'shortlisted')}
                        disabled={app.application_status === 'shortlisted'}
                      >
                        Shortlist
                      </button>
                      <button
                        className="btn btn-outline-success btn-sm me-1 fw-semibold"
                        onClick={() => handleUpdateStatus(app.application_id, 'selected')}
                        disabled={app.application_status === 'selected'}
                      >
                        Select
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm fw-semibold"
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
        </div>
      )}

      {/* Pure React Bootstrap Modal overlay */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">🗓️ Schedule Interview</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} aria-label="Close"></button>
                </div>
                <form onSubmit={handleScheduleInterview}>
                  <div className="modal-body p-4">
                    {/* Date Picker */}
                    <div className="mb-3">
                      <label htmlFor="interview_date" className="form-label fw-semibold">Interview Date *</label>
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

                    {/* Mode Dropdown */}
                    <div className="mb-3">
                      <label htmlFor="interview_mode" className="form-label fw-semibold">Interview Mode *</label>
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

                    {/* Location or Link */}
                    <div className="mb-3">
                      <label htmlFor="location_or_link" className="form-label fw-semibold">
                        {interviewData.interview_mode === 'online' ? 'Interview Link' : 'Interview Location'}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="location_or_link"
                        name="location_or_link"
                        value={interviewData.location_or_link}
                        onChange={handleModalChange}
                        placeholder={interviewData.interview_mode === 'online' ? 'e.g. Google Meet link' : 'e.g. Seminar Hall 3'}
                      />
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      <label htmlFor="notes" className="form-label fw-semibold">Notes</label>
                      <textarea
                        className="form-control"
                        id="notes"
                        name="notes"
                        rows="3"
                        value={interviewData.notes}
                        onChange={handleModalChange}
                        placeholder="Additional guidelines, requirements, topics, etc."
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer bg-light border-0">
                    <button type="button" className="btn btn-outline-secondary fw-semibold" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary fw-bold px-4" disabled={modalLoading}>
                      {modalLoading ? 'Scheduling...' : 'Schedule'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default DriveApplicants;
