import React, { useState, useEffect } from 'react';
import { locationsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes, FaExchangeAlt } from 'react-icons/fa';
import './TransferAnimalForm.css';

const TransferAnimalForm = ({ animal, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    animal_id: animal.id,
    to_location_id: '',
    reason: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.getAll({ is_active: true });
      setLocations(response.data.filter(loc => loc.id !== animal.location_id));
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.to_location_id) {
      toast.error('Please select a destination location');
      return;
    }

    setLoading(true);
    try {
      await locationsAPI.transfer(formData);
      toast.success(`${animal.name} transferred successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error transferring animal:', error);
      toast.error(error.response?.data?.error || 'Error transferring animal');
    } finally {
      setLoading(false);
    }
  };

  const currentLocation = locations.find(loc => loc.id === animal.location_id) ||
    { id: animal.location_id, name: animal.location || 'Unknown' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content transfer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Transfer Animal</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transfer-form">
          <div className="transfer-info">
            <div className="animal-info">
              <h3>{animal.name}</h3>
              <p className="text-muted">
                {animal.species} • {animal.breed || 'Unknown breed'}
              </p>
            </div>

            <div className="transfer-direction">
              <div className="location-box current">
                <label>Current Location</label>
                <div className="location-name">{currentLocation.name}</div>
              </div>

              <div className="transfer-arrow">
                <FaExchangeAlt size={24} />
              </div>

              <div className="location-box destination">
                <label>New Location <span className="required">*</span></label>
                <select
                  name="to_location_id"
                  value={formData.to_location_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select destination</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.type})
                      {loc.capacity && ` - ${loc.current_count || 0}/${loc.capacity}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>Reason for Transfer</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g., Medical treatment, Adoption, Better facility"
              />
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional information about this transfer..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Transferring...' : 'Transfer Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferAnimalForm;
