import React, { useState } from 'react';
import { animalsAPI, fosterAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './UpdateStatusForm.css';

const UpdateStatusForm = ({ animal, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    status: animal.status,
    area: animal.area || 'free_roaming',
    notes: '',
    adoption_fee: animal.adoption_fee || '',
    // Foster fields
    foster_parent_name: '',
    foster_parent_phone: '',
    foster_parent_email: '',
    foster_parent_address: '',
    start_date: new Date().toISOString().split('T')[0],
    weight_before: animal.weight || '',
    condition_before: ''
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

    if (!formData.status || !formData.area) {
      toast.error('Please select both status and area');
      return;
    }

    // Validate foster fields if status is fostered
    if (formData.status === 'fostered') {
      if (!formData.foster_parent_name || !formData.foster_parent_phone) {
        toast.error('Foster parent name and phone are required');
        return;
      }
    }

    setLoading(true);
    try {
      // Update status and area
      await animalsAPI.updateStatus(animal.id, {
        status: formData.status,
        area: formData.area,
        notes: formData.notes
      });

      // If setting adoption fee and status is available_for_adoption, update the animal
      if (formData.adoption_fee && formData.status === 'available_for_adoption') {
        await animalsAPI.update(animal.id, {
          adoption_fee: parseFloat(formData.adoption_fee)
        });
      }

      // If status is fostered, create foster record
      if (formData.status === 'fostered') {
        await fosterAPI.create({
          animal_id: animal.id,
          foster_parent_name: formData.foster_parent_name,
          foster_parent_phone: formData.foster_parent_phone,
          foster_parent_email: formData.foster_parent_email,
          foster_parent_address: formData.foster_parent_address,
          start_date: formData.start_date,
          weight_before: formData.weight_before ? parseFloat(formData.weight_before) : null,
          condition_before: formData.condition_before,
          notes: formData.notes,
          status: 'active'
        });
      }

      toast.success('Status updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.error || 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const statusChanged = formData.status !== animal.status || formData.area !== animal.area;
  const showAdoptionFee = formData.status === 'available_for_adoption';
  const showFosterFields = formData.status === 'fostered';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content status-update-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update Status - {animal.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="status-update-form">
          <div className="current-status-info">
            <p><strong>Current Status:</strong> <span className="badge">{animal.status?.replace(/_/g, ' ')}</span></p>
            <p><strong>Current Area:</strong> <span className="badge">{animal.area?.replace(/_/g, ' ')}</span></p>
          </div>

          <div className="form-group">
            <label>Area <span className="required">*</span></label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
            >
              <option value="quarantine">Quarantine</option>
              <option value="under_observation">Under Observation</option>
              <option value="in_treatment">In Treatment</option>
              <option value="medical_hold">Medical Hold</option>
              <option value="free_roaming">Free Roaming</option>
              <option value="caged">Caged</option>
            </select>
            <small className="form-hint">Physical location/housing area of the animal</small>
          </div>

          <div className="form-group">
            <label>Status <span className="required">*</span></label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="healthy">Healthy</option>
              <option value="stable">Stable</option>
              <option value="treatment">Treatment</option>
              <option value="on_clinic">On Clinic (Boarded at clinic)</option>
              <option value="fostered">Fostered</option>
              <option value="available_for_adoption">Available for Adoption</option>
              <option value="dead">Dead</option>
            </select>
            <small className="form-hint">Current health/adoption status</small>
          </div>

          {statusChanged && (
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Explain the reason for status change..."
              />
              <small className="form-hint">
                This will be recorded as an observation for tracking purposes.
              </small>
            </div>
          )}

          {showAdoptionFee && (
            <div className="form-group adoption-fee-group">
              <label>Adoption Fee (₱)</label>
              <input
                type="number"
                step="0.01"
                name="adoption_fee"
                value={formData.adoption_fee}
                onChange={handleChange}
                placeholder="Set adoption fee amount"
              />
              <small className="form-hint">
                💡 This animal is now available for adoption. Set the adoption fee.
              </small>
            </div>
          )}

          {showFosterFields && (
            <div className="foster-fields-section">
              <h4 style={{ marginTop: '1rem', marginBottom: '1rem', color: '#333' }}>Foster Parent Information</h4>

              <div className="form-grid">
                <div className="form-group">
                  <label>Foster Parent Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="foster_parent_name"
                    value={formData.foster_parent_name}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="foster_parent_phone"
                    value={formData.foster_parent_phone}
                    onChange={handleChange}
                    required
                    placeholder="Contact number"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="foster_parent_email"
                    value={formData.foster_parent_email}
                    onChange={handleChange}
                    placeholder="Email address"
                  />
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="foster_parent_address"
                  value={formData.foster_parent_address}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Full address"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Weight Before Foster (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="weight_before"
                    value={formData.weight_before}
                    onChange={handleChange}
                    placeholder="Current weight"
                  />
                </div>

                <div className="form-group">
                  <label>Condition Before Foster</label>
                  <textarea
                    name="condition_before"
                    value={formData.condition_before}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Describe animal's current condition..."
                  />
                </div>
              </div>
            </div>
          )}

          {formData.status === 'available_for_adoption' && !animal.vaccinated && (
            <div className="form-warning">
              <strong>⚠️ Warning:</strong> This animal is not marked as vaccinated. Please ensure all vaccinations are up to date before making available for adoption.
            </div>
          )}

          {formData.status === 'available_for_adoption' && !animal.spayed_neutered && (
            <div className="form-warning">
              <strong>⚠️ Warning:</strong> This animal is not marked as spayed/neutered. Consider this before making available for adoption.
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusForm;
