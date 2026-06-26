import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [branchRate, setBranchRate] = useState([]);
  const [driveTrend, setDriveTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data concurrently
        const [statsRes, branchRes, trendRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/dashboard/branch-placement-rate'),
          api.get('/admin/dashboard/drive-trend')
        ]);

        setStats(statsRes.data);
        setBranchRate(branchRes.data);
        setDriveTrend(trendRes.data);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading dashboard statistics and analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading Dashboard</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-outline-danger btn-sm" onClick={() => window.location.reload()}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data for Branch-wise Placement Rate (Bar Chart)
  const barChartData = {
    labels: branchRate.map(item => item.branch),
    datasets: [
      {
        label: 'Placement Rate (%)',
        data: branchRate.map(item => item.placement_rate),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Branch-wise Placement Rate (%)',
        font: { size: 16 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  // Prepare chart data for Monthly Application Trend (Line Chart)
  const lineChartData = {
    labels: driveTrend.map(item => item.month),
    datasets: [
      {
        label: 'Applications Count',
        data: driveTrend.map(item => item.count),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.3,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Application Trend (Current Year)',
        font: { size: 16 }
      },
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
      <h2 className="mb-4 fw-bold">Admin Dashboard</h2>
      
      {/* 4 Summary Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card text-white bg-primary h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column justify-content-between p-4">
              <div>
                <h6 className="text-uppercase text-white-50">Total Students</h6>
                <h2 className="display-5 fw-bold">{stats?.total_students || 0}</h2>
              </div>
              <div className="mt-3">
                <span className="fs-6">👤 Registered Students</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column justify-content-between p-4">
              <div>
                <h6 className="text-uppercase text-white-50">Total Companies</h6>
                <h2 className="display-5 fw-bold">{stats?.total_companies || 0}</h2>
              </div>
              <div className="mt-3">
                <span className="fs-6">🏢 Approved & Active</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning text-dark h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column justify-content-between p-4">
              <div>
                <h6 className="text-uppercase text-dark-50">Total Drives</h6>
                <h2 className="display-5 fw-bold">{stats?.total_drives || 0}</h2>
              </div>
              <div className="mt-3">
                <span className="fs-6">📢 Approved Placement Drives</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-danger h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column justify-content-between p-4">
              <div>
                <h6 className="text-uppercase text-white-50">Total Selections</h6>
                <h2 className="display-5 fw-bold">{stats?.total_selections || 0}</h2>
              </div>
              <div className="mt-3">
                <span className="fs-6">🎉 Placed Students</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Charts Side by Side */}
      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-4">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-4">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
