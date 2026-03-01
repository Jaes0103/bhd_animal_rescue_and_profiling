import React, { useState } from 'react';
import { rescueMarkersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import '../../pages/RescueMarkersPage.css';

const AddMarkerForm = ({ coordinates, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    latitude: coordinates?.lat || '',
    longitude: coordinates?.lng || '',
    animal_type: '',
    description: '',
    photo_url: '',
    priority: 'normal',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      toast.error('Please select a location on the map');
      return;
    }

    try {
      setLoading(true);
      await rescueMarkersAPI.create(formData);
      toast.success('Rescue marker added successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding marker:', error);
      toast.error(error.response?.data?.error || 'Failed to add marker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaMapMarkerAlt /> Mark Stray Animal Location</h2>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Location</label>
            <div className="coordinate-inputs">
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Latitude"
                required
                readOnly
              />
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Longitude"
                required
                readOnly
              />
            </div>
            <small className="text-muted">Click on the map to select a location</small>
          </div>

          <div className="form-group">
            <label>Animal Type</label>
            <input
              type="text"
              name="animal_type"
              value={formData.animal_type}
              onChange={handleChange}
              placeholder="e.g., Dog, Cat, Puppy"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the animal's appearance, condition, behavior..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Photo URL (optional)</label>
            <input
              type="url"
              name="photo_url"
              value={formData.photo_url}
              onChange={handleChange}
              placeholder="https://..."
            />
            <small className="text-muted">Paste a URL to a photo of the animal</small>
          </div>

          <div className="form-group">
            <label>Priority Level</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low - Can wait</option>
              <option value="normal">Normal - Regular rescue</option>
              <option value="high">High - Needs attention soon</option>
              <option value="urgent">Urgent - Immediate rescue needed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information that might help with the rescue..."
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Marker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMarkerForm;
