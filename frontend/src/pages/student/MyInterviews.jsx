import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const MyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/student/interviews');
      setInterviews(res.data);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError(err.response?.data?.error || 'Failed to retrieve scheduled interviews.');
    } finally {
      setLoading(false);
    }
  };

  const getModeBadge = (mode) => {
    if (mode === 'online') {
      return <span className="badge bg-primary text-uppercase px-2.5 py-1.5">Online</span>;
    }
    return <span className="badge bg-secondary text-uppercase px-2.5 py-1.5">Offline</span>;
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your interview schedule...</p>
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
      <h2 className="mb-4 fw-bold">Interview Schedules</h2>

      {interviews.length === 0 ? (
        <div className="card shadow-sm border-0 mt-3">
          <div className="card-body p-5 text-center">
            <span className="fs-1">🗓️</span>
            <h4 className="text-muted mt-3 mb-2">No interviews scheduled yet</h4>
            <p className="text-muted mb-0">Your application might still be under review. Check back later.</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {interviews.map((iv, idx) => (
            <div key={idx} className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold fs-6 text-truncate" style={{ maxWidth: '70%' }}>
                    {iv.job_title}
                  </h5>
                  {getModeBadge(iv.interview_mode)}
                </div>
                <div className="card-body p-4">
                  <h6 className="text-primary fw-bold mb-3">{iv.company_name}</h6>
                  
                  <div className="mb-3 text-muted small">
                    <div className="mb-2">
                      <span className="d-block text-uppercase text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                        Date & Time
                      </span>
                      <strong className="text-dark fs-6">{iv.interview_date || 'N/A'}</strong>
                    </div>

                    <div className="mb-2">
                      <span className="d-block text-uppercase text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                        {iv.interview_mode === 'online' ? 'Link / Platform' : 'Venue / Location'}
                      </span>
                      {iv.location_or_link ? (
                        iv.interview_mode === 'online' ? (
                          <a 
                            href={iv.location_or_link.startsWith('http') ? iv.location_or_link : `https://${iv.location_or_link}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-decoration-none fw-bold"
                          >
                            🔗 Join Online Meeting
                          </a>
                        ) : (
                          <strong className="text-dark">{iv.location_or_link}</strong>
                        )
                      ) : (
                        <span className="text-muted">Will be shared soon</span>
                      )}
                    </div>
                  </div>

                  {iv.notes && (
                    <div className="mt-3 bg-light p-3 rounded">
                      <span className="d-block text-uppercase text-muted fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>
                        Candidate Instructions
                      </span>
                      <p className="card-text text-dark small mb-0 style-preserve-newlines">
                        {iv.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyInterviews;
