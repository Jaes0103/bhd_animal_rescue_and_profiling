import React, { useState } from 'react';
import { usersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './AddUserForm.css';

const AddUserForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    role: 'volunteer'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSubmit } = formData;
      await usersAPI.create(dataToSubmit);
      toast.success('User created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.error || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New User</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="form-section">
            <h3>Account Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Username <span className="required">*</span></label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength="3"
                  maxLength="50"
                  placeholder="john_doe"
                />
                <small className="form-hint">3-50 characters, alphanumeric and underscore only</small>
              </div>

              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-group">
                <label>Password <span className="required">*</span></label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="Min 6 characters"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password <span className="required">*</span></label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="09171234567"
                />
              </div>

              <div className="form-group full-width">
                <label>Role <span className="required">*</span></label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="staff">Staff</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                </select>
                <small className="form-hint">
                  <strong>Admin:</strong> Full system access •
                  <strong> Staff:</strong> Health management •
                  <strong> Driver:</strong> Transport •
                  <strong> Volunteer:</strong> Basic access
                </small>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;
