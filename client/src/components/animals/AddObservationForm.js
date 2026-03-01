import React, { useState } from 'react';
import { observationsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './AddObservationForm.css';

const AddObservationForm = ({ animalId, animalName, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    observation_date: new Date().toISOString().split('T')[0],
    observation_type: 'health',
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

    if (!formData.notes.trim()) {
      toast.error('Please enter observation notes');
      return;
    }

    setLoading(true);
    try {
      await observationsAPI.create({
        animal_id: animalId,
        ...formData
      });
      toast.success('Observation recorded successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding observation:', error);
      toast.error(error.response?.data?.error || 'Error recording observation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content observation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Observation - {animalName}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="observation-form">
          <div className="form-group">
            <label>Observation Date <span className="required">*</span></label>
            <input
              type="date"
              name="observation_date"
              value={formData.observation_date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Observation Type <span className="required">*</span></label>
            <select
              name="observation_type"
              value={formData.observation_type}
              onChange={handleChange}
              required
            >
              <option value="health">Health</option>
              <option value="behavior">Behavior</option>
              <option value="feeding">Feeding</option>
              <option value="exercise">Exercise</option>
              <option value="socialization">Socialization</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Observation Notes <span className="required">*</span></label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="6"
              placeholder="Describe your observations in detail..."
              required
            />
            <small className="form-hint">
              Include specific details about the animal's condition, behavior, or any changes noticed.
            </small>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Recording...' : 'Record Observation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddObservationForm;
