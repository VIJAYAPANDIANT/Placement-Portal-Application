import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CompanyDashboard = () => {
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFunnelData();
  }, []);

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/company/dashboard/funnel');
      setFunnel(res.data);
    } catch (err) {
      console.error('Error fetching funnel stats:', err);
      setError(err.response?.data?.error || 'Failed to fetch recruitment funnel stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading recruitment analytics...</p>
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
          <button className="btn btn-outline-danger btn-sm" onClick={fetchFunnelData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Chart Data preparation
  const chartData = {
    labels: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
    datasets: [
      {
        label: 'Candidates Count',
        data: [
          funnel?.applied || 0,
          funnel?.shortlisted || 0,
          funnel?.selected || 0,
          funnel?.rejected || 0
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',   // Blue for Applied
          'rgba(255, 206, 86, 0.6)',   // Yellow for Shortlisted
          'rgba(75, 192, 192, 0.6)',   // Green for Selected
          'rgba(255, 99, 132, 0.6)'    // Red for Rejected
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
        display: false // Hide legend since dataset has color-coded individual bars
      },
      title: {
        display: true,
        text: 'Recruitment Funnel Stage Overview',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Company Dashboard</h2>

      <div className="row g-4">
        {/* Left Side: Funnel Chart */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-4 h-100">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right Side: Funnel Metrics cards */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-dark text-white p-3">
              <h5 className="mb-0 fw-bold">Application Statistics</h5>
            </div>
            <div className="card-body d-flex flex-column justify-content-around p-4">
              <div className="border-start border-primary border-4 ps-3 py-1 mb-3">
                <span className="text-muted text-uppercase d-block small fw-bold">Total Applied</span>
                <span className="fs-3 fw-bold text-primary">{funnel?.applied || 0}</span>
              </div>
              
              <div className="border-start border-warning border-4 ps-3 py-1 mb-3">
                <span className="text-muted text-uppercase d-block small fw-bold">Shortlisted</span>
                <span className="fs-3 fw-bold text-warning">{funnel?.shortlisted || 0}</span>
              </div>

              <div className="border-start border-success border-4 ps-3 py-1 mb-3">
                <span className="text-muted text-uppercase d-block small fw-bold">Selected</span>
                <span className="fs-3 fw-bold text-success">{funnel?.selected || 0}</span>
              </div>

              <div className="border-start border-danger border-4 ps-3 py-1">
                <span className="text-muted text-uppercase d-block small fw-bold">Rejected</span>
                <span className="fs-3 fw-bold text-danger">{funnel?.rejected || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
