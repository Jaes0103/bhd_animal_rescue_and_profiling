import React, { useState } from 'react';
import { diseaseZonesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes, FaVirus, FaCircle } from 'react-icons/fa';
import '../../pages/RescueMarkersPage.css';

const AddDiseaseZoneForm = ({ coordinates, onClose, onSuccess, onRadiusChange }) => {
  const [formData, setFormData] = useState({
    latitude: coordinates?.lat || '',
    longitude: coordinates?.lng || '',
    disease_type: 'rabies',
    radius_km: 1.0,
    area_name: '',
    confirmed_cases: 1,
    description: '',
    severity: 'medium',
    first_case_date: new Date().toISOString().split('T')[0],
    last_case_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Update preview circle radius
    if (name === 'radius_km' && onRadiusChange) {
      onRadiusChange(parseFloat(value) || 1.0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      toast.error('Please select a location on the map');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        radius_km: parseFloat(formData.radius_km),
        confirmed_cases: parseInt(formData.confirmed_cases) || 1
      };

      await diseaseZonesAPI.create(submitData);
      toast.success('Disease zone marked successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding disease zone:', error);
      toast.error(error.response?.data?.error || 'Failed to add disease zone');
    } finally {
      setLoading(false);
    }
  };

  const getDiseaseColor = (type) => {
    const colors = {
      rabies: '#E74C3C',
      distemper: '#FF9800',
      parvo: '#FFC107',
      other: '#9C27B0'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content disease-zone-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: getDiseaseColor(formData.disease_type) }}>
          <h2><FaVirus /> Mark Disease Outbreak Zone</h2>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Disease Type *</label>
            <select
              name="disease_type"
              value={formData.disease_type}
              onChange={handleChange}
              required
            >
              <option value="rabies">🦠 Rabies</option>
              <option value="distemper">🤒 Distemper</option>
              <option value="parvo">💉 Parvovirus</option>
              <option value="other">⚕️ Other Disease</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location (Center Point)</label>
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
            <small className="text-muted">Click on the map to select the center of the outbreak area</small>
          </div>

          <div className="form-group">
            <label>
              Affected Area Radius: {formData.radius_km} km
              <FaCircle style={{ marginLeft: '8px', color: getDiseaseColor(formData.disease_type), fontSize: '12px' }} />
            </label>
            <input
              type="range"
              name="radius_km"
              min="0.1"
              max="10"
              step="0.1"
              value={formData.radius_km}
              onChange={handleChange}
              className="radius-slider"
            />
            <div className="radius-labels">
              <span>0.1 km</span>
              <span>5 km</span>
              <span>10 km</span>
            </div>
            <small className="text-muted">Estimated radius of the affected area (visible as circle on map)</small>
          </div>

          <div className="form-group">
            <label>Area Name</label>
            <input
              type="text"
              name="area_name"
              value={formData.area_name}
              onChange={handleChange}
              placeholder="e.g., Brgy. Matina, Poblacion District"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Confirmed Cases *</label>
              <input
                type="number"
                name="confirmed_cases"
                value={formData.confirmed_cases}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Severity Level *</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Case Date *</label>
              <input
                type="date"
                name="first_case_date"
                value={formData.first_case_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Case Date</label>
              <input
                type="date"
                name="last_case_date"
                value={formData.last_case_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the outbreak situation, symptoms observed, affected animals..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Preventive measures taken, vaccination status, containment efforts..."
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
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Mark Disease Zone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiseaseZoneForm;
