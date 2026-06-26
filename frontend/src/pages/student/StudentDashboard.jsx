import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

// Register Chart.js elements
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const StudentDashboard = () => {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatusBreakdown();
  }, []);

  const fetchStatusBreakdown = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/student/dashboard/status-breakdown');
      setBreakdown(res.data);
    } catch (err) {
      console.error('Error fetching student breakdown:', err);
      setError(err.response?.data?.error || 'Failed to fetch application breakdown stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Retrieving placement status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Dashboard Error</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-outline-danger btn-sm" onClick={fetchStatusBreakdown}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if all counts are 0
  const totalApplications = 
    (breakdown?.applied || 0) + 
    (breakdown?.shortlisted || 0) + 
    (breakdown?.selected || 0) + 
    (breakdown?.rejected || 0);

  // Pie Chart Data
  const chartData = {
    labels: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
    datasets: [
      {
        data: [
          breakdown?.applied || 0,
          breakdown?.shortlisted || 0,
          breakdown?.selected || 0,
          breakdown?.rejected || 0
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',   // Blue for Applied
          'rgba(255, 206, 86, 0.7)',   // Yellow for Shortlisted
          'rgba(75, 192, 192, 0.7)',   // Green for Selected
          'rgba(255, 99, 132, 0.7)'    // Red for Rejected
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: { size: 13 }
        }
      },
      title: {
        display: true,
        text: 'My Application Status Distribution',
        font: { size: 16 }
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Student Dashboard</h2>

      {totalApplications === 0 ? (
        <div className="card shadow-sm border-0 py-5">
          <div className="card-body text-center">
            <span className="fs-1">🎓</span>
            <h4 className="text-muted mt-3 fw-bold">No applications yet</h4>
            <p className="text-muted mb-4">You haven't applied to any placement drives yet.</p>
            <a href="/student/drives" className="btn btn-primary fw-bold px-4">
              Browse & Apply for Drives
            </a>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Chart Card */}
          <div className="col-lg-5 col-md-6 mx-auto">
            <div className="card shadow-sm border-0 p-4 text-center">
              <div style={{ maxWidth: '380px', margin: '0 auto' }}>
                <Pie data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Stats summary cards */}
          <div className="col-12 mt-5">
            <div className="row g-4">
              {/* Applied */}
              <div className="col-md-3 col-6">
                <div className="card bg-primary text-white shadow-sm border-0 h-100">
                  <div className="card-body p-4 text-center">
                    <h6 className="text-uppercase text-white-50 small mb-2">Applied</h6>
                    <h2 className="display-6 fw-bold mb-0">{breakdown?.applied || 0}</h2>
                  </div>
                </div>
              </div>

              {/* Shortlisted */}
              <div className="col-md-3 col-6">
                <div className="card bg-warning text-dark shadow-sm border-0 h-100">
                  <div className="card-body p-4 text-center">
                    <h6 className="text-uppercase text-dark-50 small mb-2">Shortlisted</h6>
                    <h2 className="display-6 fw-bold mb-0">{breakdown?.shortlisted || 0}</h2>
                  </div>
                </div>
              </div>

              {/* Selected */}
              <div className="col-md-3 col-6">
                <div className="card bg-success text-white shadow-sm border-0 h-100">
                  <div className="card-body p-4 text-center">
                    <h6 className="text-uppercase text-white-50 small mb-2">Selected</h6>
                    <h2 className="display-6 fw-bold mb-0">{breakdown?.selected || 0}</h2>
                  </div>
                </div>
              </div>

              {/* Rejected */}
              <div className="col-md-3 col-6">
                <div className="card bg-danger text-white shadow-sm border-0 h-100">
                  <div className="card-body p-4 text-center">
                    <h6 className="text-uppercase text-white-50 small mb-2">Rejected</h6>
                    <h2 className="display-6 fw-bold mb-0">{breakdown?.rejected || 0}</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
