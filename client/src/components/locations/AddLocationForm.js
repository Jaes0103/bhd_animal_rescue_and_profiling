import React, { useState } from 'react';
import { locationsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './LocationForm.css';

const AddLocationForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'shelter',
    address: '',
    city: 'Davao City',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    capacity: '',
    notes: ''
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

    if (!formData.name || !formData.type) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      await locationsAPI.create(dataToSubmit);
      toast.success('Location added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error(error.response?.data?.error || 'Error adding location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content location-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Location</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="location-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Malagamot Shelter"
                />
              </div>

              <div className="form-group">
                <label>Type <span className="required">*</span></label>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="shelter">Shelter</option>
                  <option value="clinic">Clinic</option>
                  <option value="foster_home">Foster Home</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  placeholder="Max animals"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="Person in charge"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="Contact number"
                />
              </div>

              <div className="form-group full-width">
                <label>Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="Email address"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Details</h3>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Additional information about this location..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLocationForm;
