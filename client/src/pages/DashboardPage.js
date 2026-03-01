import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { FaPaw, FaHeart, FaHome, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';
import './DashboardPage.css';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityPage, setActivityPage] = useState(1);
  const activitiesPerPage = 5;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Overview of Bantay Hayop Davao operations</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">
              <FaPaw />
            </div>
            <div className="stat-content">
              <h3>{stats?.animals?.total || 0}</h3>
              <p>Animals</p>
            </div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <FaHeart />
            </div>
            <div className="stat-content">
              <h3>{stats?.animals?.adopted || 0}</h3>
              <p>Adopted Animals</p>
            </div>
          </div>

          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <FaHome />
            </div>
            <div className="stat-content">
              <h3>0</h3>
              <p>Rescued Animals</p>
            </div>
          </div>

          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <h3>₱{parseFloat(stats?.donations_this_month || 0).toLocaleString()}</h3>
              <p>Donations This Month</p>
            </div>
          </div>
        </div>

        {/* Animal Status Distribution */}
        <div className="card dashboard-overview-chart">
          <h2>Animal Status Distribution</h2>

          <div className="status-distribution">
            {/* Health Status Section */}
            <div className="distribution-section">
              <h3>By Health Status</h3>
              <div className="distribution-bars">
                <div className="distribution-item">
                  <div className="distribution-header">
                    <span className="distribution-label">Healthy</span>
                    <span className="distribution-count">{stats?.animals?.healthy || 0}</span>
                  </div>
                  <div className="distribution-bar-container">
                    <div
                      className="distribution-bar bar-healthy"
                      style={{ width: `${(stats?.animals?.healthy || 0) / Math.max(stats?.animals?.total, 1) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="distribution-item">
                  <div className="distribution-header">
                    <span className="distribution-label">Stable</span>
                    <span className="distribution-count">{stats?.animals?.stable || 0}</span>
                  </div>
                  <div className="distribution-bar-container">
                    <div
                      className="distribution-bar bar-stable"
                      style={{ width: `${(stats?.animals?.stable || 0) / Math.max(stats?.animals?.total, 1) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="distribution-item">
                  <div className="distribution-header">
                    <span className="distribution-label">In Treatment</span>
                    <span className="distribution-count">{stats?.animals?.treatment || 0}</span>
                  </div>
                  <div className="distribution-bar-container">
                    <div
                      className="distribution-bar bar-treatment"
                      style={{ width: `${(stats?.animals?.treatment || 0) / Math.max(stats?.animals?.total, 1) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="distribution-item">
                  <div className="distribution-header">
                    <span className="distribution-label">On Clinic (Boarded)</span>
                    <span className="distribution-count">{stats?.animals?.on_clinic || 0}</span>
                  </div>
                  <div className="distribution-bar-container">
                    <div
                      className="distribution-bar bar-on-clinic"
                      style={{ width: `${(stats?.animals?.on_clinic || 0) / Math.max(stats?.animals?.total, 1) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Status Section */}
            <div className="distribution-section">
              <h3>By Availability</h3>
              <div className="distribution-bars">
                <div className="distribution-item">
                  <div className="distribution-header">
                    <span className="distribution-label">Available for Adoption</span>
                    <span className="distribution-count">{stats?.animals?.available_for_adoption || 0}</span>
                  </div>
                  <div className="distribution-bar-container">
                    <div
                      className="distribution-bar bar-available"
                      style={{ width: `${(stats?.animals?.available_for_adoption || 0) / Math.max(stats?.animals?.total, 1) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="distribution-item">
                  <div className="distribution-header">
                    <span className="distribution-label">Fostered</span>
                    <span className="distribution-count">{stats?.animals?.fostered || 0}</span>
                  </div>
                  <div className="distribution-bar-container">
                    <div
                      className="distribution-bar bar-fostered"
                      style={{ width: `${(stats?.animals?.fostered || 0) / Math.max(stats?.animals?.total, 1) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="distribution-item">
                  <div className="distribution-header">
                    <span className="distribution-label">Adopted</span>
                    <span className="distribution-count">{stats?.animals?.adopted || 0}</span>
                  </div>
                  <div className="distribution-bar-container">
                    <div
                      className="distribution-bar bar-adopted"
                      style={{ width: `${(stats?.animals?.adopted || 0) / Math.max(stats?.animals?.total, 1) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location/Area Section */}
            <div className="distribution-section">
              <h3>By Location</h3>
              <div className="distribution-bars">
                <div className="distribution-item">
                  <div className="distribution-header">
                    <span className="distribution-label">Quarantine</span>
                    <span className="distribution-count">{stats?.areas?.quarantine || 0}</span>
                  </div>
                  <div className="distribution-bar-container">
                    <div
                      className="distribution-bar bar-quarantine"
                      style={{ width: `${(stats?.areas?.quarantine || 0) / Math.max(stats?.animals?.total, 1) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="distribution-item">
                  <div className="distribution-header">
                    <span className="distribution-label">Under Observation</span>
                    <span className="distribution-count">{stats?.areas?.under_observation || 0}</span>
                  </div>
                  <div className="distribution-bar-container">
                    <div
                      className="distribution-bar bar-observation"
                      style={{ width: `${(stats?.areas?.under_observation || 0) / Math.max(stats?.animals?.total, 1) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="distribution-item">
                  <div className="distribution-header">
                    <span className="distribution-label">Medical Hold</span>
                    <span className="distribution-count">{stats?.areas?.medical_hold || 0}</span>
                  </div>
                  <div className="distribution-bar-container">
                    <div
                      className="distribution-bar bar-medical-hold"
                      style={{ width: `${(stats?.areas?.medical_hold || 0) / Math.max(stats?.animals?.total, 1) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Animals by Species with Chart */}
          <div className="card dashboard-card">
            <h2>Animals by Species</h2>
            <div className="species-chart">
              {stats?.species?.map((item) => {
                const total = stats.species.reduce((sum, s) => sum + parseInt(s.count), 0);
                const percentage = total > 0 ? (parseInt(item.count) / total) * 100 : 0;
                return (
                  <div key={item.species} className="species-bar-item">
                    <div className="species-bar-header">
                      <span className="species-name">{item.species}</span>
                      <span className="species-count">{item.count}</span>
                    </div>
                    <div className="species-bar-container">
                      <div
                        className="species-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card dashboard-card">
            <h2>Quick Stats</h2>
            <div className="quick-stats">
              <div className="quick-stat-item">
                <span>Recent Intakes (30 days)</span>
                <strong>{stats?.recent_intakes || 0}</strong>
              </div>
              <div className="quick-stat-item">
                <span>Pending Applications</span>
                <strong className="text-warning">{stats?.pending_applications || 0}</strong>
              </div>
              <div className="quick-stat-item">
                <span>Adoptions This Year</span>
                <strong className="text-success">{stats?.adoptions_this_year || 0}</strong>
              </div>
              <div className="quick-stat-item">
                <span>Medical Hold</span>
                <strong className="text-danger">{stats?.animals?.medical_hold || 0}</strong>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          {stats?.upcoming_appointments?.length > 0 && (
            <div className="card dashboard-card">
              <h2>
                <FaExclamationTriangle className="text-warning" /> Upcoming Medical Appointments
              </h2>
              <div className="appointments-list">
                {stats.upcoming_appointments.map((appt) => (
                  <div key={appt.id} className="appointment-item">
                    <div>
                      <strong>{appt.animal_name}</strong> ({appt.species})
                      <p className="appointment-clinic">{appt.clinic || 'Veterinary checkup'}</p>
                    </div>
                    <span className="appointment-date">
                      {new Date(appt.next_appointment).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="card dashboard-card">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {stats?.recent_activity && (() => {
                const totalActivities = stats.recent_activity.length;
                const totalPages = Math.ceil(totalActivities / activitiesPerPage);
                const startIndex = (activityPage - 1) * activitiesPerPage;
                const endIndex = startIndex + activitiesPerPage;
                const currentActivities = stats.recent_activity.slice(startIndex, endIndex);

                const timeAgo = (date) => {
                  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
                  if (seconds < 60) return 'Just now';
                  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
                  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
                  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
                  return new Date(date).toLocaleDateString();
                };

                return (
                  <>
                    {currentActivities.map((activity) => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-content">
                          <div className="activity-user">
                            <strong>{activity.full_name || activity.username}</strong>
                          </div>
                          <div className="activity-description">
                            {activity.details || activity.action.replace(/_/g, ' ')}
                          </div>
                        </div>
                        <span className="activity-time">
                          {timeAgo(activity.created_at)}
                        </span>
                      </div>
                    ))}

                    {totalPages > 1 && (
                      <div className="pagination-controls">
                        <button
                          className="pagination-btn"
                          onClick={() => setActivityPage(prev => Math.max(1, prev - 1))}
                          disabled={activityPage === 1}
                        >
                          ← Previous
                        </button>

                        <div className="pagination-pages">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              className={`pagination-page ${page === activityPage ? 'active' : ''}`}
                              onClick={() => setActivityPage(page)}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button
                          className="pagination-btn"
                          onClick={() => setActivityPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={activityPage === totalPages}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
