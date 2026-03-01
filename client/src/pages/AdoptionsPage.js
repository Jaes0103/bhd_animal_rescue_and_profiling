import React, { useState, useEffect } from 'react';
import { adoptionsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './AdoptionsPage.css';

const AdoptionsPage = () => {
  const [applications, setApplications] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'applications') {
        const response = await adoptionsAPI.getApplications();
        setApplications(response.data);
      } else {
        const response = await adoptionsAPI.getAdoptions();
        setAdoptions(response.data);
      }
    } catch (error) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (id, status) => {
    try {
      await adoptionsAPI.reviewApplication(id, { application_status: status });
      toast.success(`Application ${status}`);
      loadData();
    } catch (error) {
      toast.error('Error reviewing application');
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      withdrawn: 'badge-info'
    };
    return `badge ${classes[status] || 'badge-info'}`;
  };

  return (
    <div className="adoptions-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Adoptions Management</h1>
            <p>Review applications and track adoptions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button
            className={`tab ${activeTab === 'adoptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('adoptions')}
          >
            Completed Adoptions
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : activeTab === 'applications' ? (
          <div className="applications-list">
            {applications.length === 0 ? (
              <div className="card empty-state">
                <p>No applications found</p>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="card application-card">
                  <div className="application-header">
                    <div>
                      <h3>{app.applicant_name}</h3>
                      <p className="application-animal">
                        Applying for: <strong>{app.animal_name}</strong>
                      </p>
                    </div>
                    <span className={getStatusBadgeClass(app.application_status)}>
                      {app.application_status}
                    </span>
                  </div>

                  <div className="application-details">
                    <div className="detail-item">
                      <strong>Email:</strong> {app.email}
                    </div>
                    <div className="detail-item">
                      <strong>Phone:</strong> {app.phone}
                    </div>
                    <div className="detail-item">
                      <strong>Housing:</strong> {app.housing_type} ({app.housing_owned ? 'Owned' : 'Rented'})
                    </div>
                    <div className="detail-item">
                      <strong>Has Pets:</strong> {app.has_pets ? 'Yes' : 'No'}
                    </div>
                    <div className="detail-item">
                      <strong>Has Children:</strong> {app.has_children ? 'Yes' : 'No'}
                    </div>
                    <div className="detail-item">
                      <strong>Applied:</strong> {new Date(app.applied_at).toLocaleDateString()}
                    </div>
                  </div>

                  {app.reason_for_adoption && (
                    <div className="application-reason">
                      <strong>Reason for Adoption:</strong>
                      <p>{app.reason_for_adoption}</p>
                    </div>
                  )}

                  {app.application_status === 'pending' && (
                    <div className="application-actions">
                      <button
                        onClick={() => handleReviewApplication(app.id, 'approved')}
                        className="btn btn-secondary"
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        onClick={() => handleReviewApplication(app.id, 'rejected')}
                        className="btn btn-danger"
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="adoptions-list">
            {adoptions.length === 0 ? (
              <div className="card empty-state">
                <p>No completed adoptions found</p>
              </div>
            ) : (
              <div className="adoptions-grid">
                {adoptions.map((adoption) => (
                  <div key={adoption.id} className="card adoption-card">
                    <h3>{adoption.animal_name}</h3>
                    <p className="adoption-species">{adoption.species}</p>
                    <div className="adoption-info">
                      <p><strong>Adopter:</strong> {adoption.adopter_name}</p>
                      <p><strong>Date:</strong> {new Date(adoption.adoption_date).toLocaleDateString()}</p>
                      <p><strong>Fee:</strong> ₱{parseFloat(adoption.adoption_fee || 0).toLocaleString()}</p>
                      <p>
                        <strong>Contract:</strong>{' '}
                        <span className={adoption.contract_signed ? 'text-success' : 'text-warning'}>
                          {adoption.contract_signed ? 'Signed' : 'Pending'}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdoptionsPage;
