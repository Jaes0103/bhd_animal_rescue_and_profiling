import React, { useState, useEffect } from 'react';
import { donationsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaDollarSign, FaGift } from 'react-icons/fa';
import './DonationsPage.css';

const DonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const [donationsRes, statsRes] = await Promise.all([
        donationsAPI.getAll({ donation_type: filter }),
        donationsAPI.getStats()
      ]);
      setDonations(donationsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Error loading donations');
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadgeClass = (type) => {
    const classes = {
      cash: 'badge-success',
      supplies: 'badge-info',
      services: 'badge-purple',
      other: 'badge-warning'
    };
    return `badge ${classes[type] || 'badge-info'}`;
  };

  return (
    <div className="donations-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Donations</h1>
            <p>Track and manage donations received</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="donations-stats">
            <div className="stat-card stat-card-success">
              <div className="stat-icon">
                <FaDollarSign />
              </div>
              <div className="stat-content">
                <h3>₱{parseFloat(stats.total_cash || 0).toLocaleString()}</h3>
                <p>Total Cash Donations</p>
              </div>
            </div>

            <div className="stat-card stat-card-info">
              <div className="stat-icon">
                <FaGift />
              </div>
              <div className="stat-content">
                <h3>{donations.length}</h3>
                <p>Total Donations Recorded</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="card filters-card">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Donations</option>
            <option value="cash">Cash</option>
            <option value="supplies">Supplies</option>
            <option value="services">Services</option>
            <option value="other">Other</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : donations.length === 0 ? (
          <div className="card empty-state">
            <p>No donations found</p>
          </div>
        ) : (
          <div className="donations-list">
            {donations.map((donation) => (
              <div key={donation.id} className="card donation-card">
                <div className="donation-header">
                  <div>
                    <h3>{donation.donor_name}</h3>
                    <p className="donation-date">
                      {new Date(donation.donation_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={getTypeBadgeClass(donation.donation_type)}>
                    {donation.donation_type}
                  </span>
                </div>

                <div className="donation-details">
                  {donation.amount && (
                    <div className="donation-amount">
                      <FaDollarSign />
                      <span>₱{parseFloat(donation.amount).toLocaleString()}</span>
                    </div>
                  )}

                  {donation.items_description && (
                    <div className="donation-items">
                      <strong>Items:</strong> {donation.items_description}
                    </div>
                  )}

                  {donation.payment_method && (
                    <p className="donation-info">
                      <strong>Payment Method:</strong> {donation.payment_method}
                    </p>
                  )}

                  {donation.donor_email && (
                    <p className="donation-info">
                      <strong>Email:</strong> {donation.donor_email}
                    </p>
                  )}

                  {donation.donor_phone && (
                    <p className="donation-info">
                      <strong>Phone:</strong> {donation.donor_phone}
                    </p>
                  )}

                  {donation.notes && (
                    <div className="donation-notes">
                      <strong>Notes:</strong>
                      <p>{donation.notes}</p>
                    </div>
                  )}

                  <div className="donation-footer">
                    <span className={`badge ${donation.receipt_issued ? 'badge-success' : 'badge-warning'}`}>
                      {donation.receipt_issued ? 'Receipt Issued' : 'Receipt Pending'}
                    </span>
                    {donation.recorded_by_name && (
                      <span className="recorded-by">
                        Recorded by: {donation.recorded_by_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationsPage;
