import React, { useState, useEffect } from 'react';
import { animalsAPI, locationsAPI, fosterAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './AddAnimalForm.css';

const EditAnimalForm = ({ animal, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: animal.name || '',
    species: animal.species || 'dog',
    breed: animal.breed || '',
    age_years: animal.age_years || 0,
    age_months: animal.age_months || 0,
    gender: animal.gender || 'unknown',
    color: animal.color || '',
    weight: animal.weight || '',
    size: animal.size || 'medium',
    description: animal.description || '',
    intake_date: animal.intake_date ? animal.intake_date.split('T')[0] : new Date().toISOString().split('T')[0],
    intake_type: animal.intake_type || 'rescue',
    status: animal.status || 'healthy',
    area: animal.area || 'quarantine',
    adoption_fee: animal.adoption_fee || '',
    spayed_neutered: animal.spayed_neutered || false,
    vaccinated: animal.vaccinated || false,
    microchipped: animal.microchipped || false,
    special_needs: animal.special_needs || '',
    behavior_notes: animal.behavior_notes || '',
    location_id: animal.location_id || ''
  });

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [fosterInfo, setFosterInfo] = useState(null);
  const [loadingFoster, setLoadingFoster] = useState(false);

  useEffect(() => {
    fetchLocations();
    if (formData.status === 'fostered') {
      fetchFosterInfo();
    }
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.getAll({ is_active: true });
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    }
  };

  const fetchFosterInfo = async () => {
    setLoadingFoster(true);
    try {
      const response = await fosterAPI.getByAnimalId(animal.id);
      setFosterInfo(response.data);
    } catch (error) {
      // No active foster record found is expected - not an error
      if (error.response?.status !== 404) {
        console.error('Error fetching foster info:', error);
      }
      setFosterInfo(null);
    } finally {
      setLoadingFoster(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Fetch foster info if status changes to 'fostered'
    if (name === 'status' && value === 'fostered') {
      fetchFosterInfo();
    } else if (name === 'status' && value !== 'fostered') {
      setFosterInfo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.species) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      // Convert numeric fields
      const dataToSubmit = {
        ...formData,
        age_years: parseInt(formData.age_years) || 0,
        age_months: parseInt(formData.age_months) || 0,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        adoption_fee: formData.adoption_fee ? parseFloat(formData.adoption_fee) : null
      };

      await animalsAPI.update(animal.id, dataToSubmit);
      toast.success('Animal updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating animal:', error);
      toast.error(error.response?.data?.error || 'Error updating animal');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'intake', label: 'Intake Information' },
    { id: 'health', label: 'Health Information' },
    { id: 'additional', label: 'Additional Details' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-animal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Animal - {animal.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="add-animal-form">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Animal's name"
                  />
                </div>

                <div className="form-group">
                  <label>Species <span className="required">*</span></label>
                  <select name="species" value={formData.species} onChange={handleChange} required>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Breed</label>
                  <input
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    placeholder="e.g., Aspin, Puspin"
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Age (Years)</label>
                  <input
                    type="number"
                    name="age_years"
                    value={formData.age_years}
                    onChange={handleChange}
                    min="0"
                    max="30"
                  />
                </div>

                <div className="form-group">
                  <label>Age (Months)</label>
                  <input
                    type="number"
                    name="age_months"
                    value={formData.age_months}
                    onChange={handleChange}
                    min="0"
                    max="11"
                  />
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="e.g., Brown, Black"
                  />
                </div>

                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Weight in kg"
                  />
                </div>

                <div className="form-group">
                  <label>Size</label>
                  <select name="size" value={formData.size} onChange={handleChange}>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra_large">Extra Large</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Intake Information Tab */}
          {activeTab === 'intake' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group">
                  <label>Intake Date</label>
                  <input
                    type="date"
                    name="intake_date"
                    value={formData.intake_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Intake Type</label>
                  <select name="intake_type" value={formData.intake_type} onChange={handleChange}>
                    <option value="rescue">Rescue</option>
                    <option value="surrender">Surrender</option>
                    <option value="stray">Stray</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Area</label>
                  <select name="area" value={formData.area} onChange={handleChange}>
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
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="healthy">Healthy</option>
                    <option value="stable">Stable</option>
                    <option value="treatment">Treatment</option>
                    <option value="on_clinic">On Clinic (Boarded)</option>
                    <option value="fostered">Fostered</option>
                    <option value="available_for_adoption">Available for Adoption</option>
                    <option value="adopted">Adopted</option>
                    <option value="deceased">Deceased</option>
                  </select>
                  <small className="form-hint">Current health/adoption status</small>

                  {formData.status === 'fostered' && (
                    <div>
                      {loadingFoster ? (
                        <div className="foster-notice">Loading foster information...</div>
                      ) : fosterInfo ? (
                        <div className="foster-info-box">
                          <h4>🏠 Current Foster Parent</h4>
                          <div className="foster-detail">
                            <strong>Name:</strong> <span>{fosterInfo.foster_parent_name}</span>
                          </div>
                          {fosterInfo.foster_parent_phone && (
                            <div className="foster-detail">
                              <strong>Phone:</strong> <span>{fosterInfo.foster_parent_phone}</span>
                            </div>
                          )}
                          {fosterInfo.foster_parent_email && (
                            <div className="foster-detail">
                              <strong>Email:</strong> <span>{fosterInfo.foster_parent_email}</span>
                            </div>
                          )}
                          {fosterInfo.start_date && (
                            <div className="foster-detail">
                              <strong>Since:</strong> <span>{new Date(fosterInfo.start_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {fosterInfo.notes && (
                            <div className="foster-detail">
                              <strong>Notes:</strong> <span>{fosterInfo.notes}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="foster-notice">
                          ⚠️ No active foster record found. Create a foster record to assign a foster parent.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <select
                    name="location_id"
                    value={formData.location_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.type})
                      </option>
                    ))}
                  </select>
                  <small className="form-hint">Select the facility where the animal is housed</small>
                </div>
              </div>
            </div>
          )}

          {/* Health Information Tab */}
          {activeTab === 'health' && (
            <div className="form-section">
              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="spayed_neutered"
                    checked={formData.spayed_neutered}
                    onChange={handleChange}
                  />
                  <span>Spayed/Neutered</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="vaccinated"
                    checked={formData.vaccinated}
                    onChange={handleChange}
                  />
                  <span>Vaccinated</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="microchipped"
                    checked={formData.microchipped}
                    onChange={handleChange}
                  />
                  <span>Microchipped</span>
                </label>
              </div>
            </div>
          )}

          {/* Additional Details Tab */}
          {activeTab === 'additional' && (
            <div className="form-section">
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Brief description of the animal..."
                />
              </div>

              <div className="form-group">
                <label>Special Needs</label>
                <textarea
                  name="special_needs"
                  value={formData.special_needs}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Any special needs or medical conditions..."
                />
              </div>

              <div className="form-group">
                <label>Behavior Notes</label>
                <textarea
                  name="behavior_notes"
                  value={formData.behavior_notes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Behavior observations..."
                />
              </div>

              {formData.status === 'available_for_adoption' && (
                <div className="form-group">
                  <label>Adoption Fee (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="adoption_fee"
                    value={formData.adoption_fee}
                    onChange={handleChange}
                    placeholder="Adoption fee amount"
                  />
                  <small className="form-hint">
                    Set adoption fee for this animal
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAnimalForm;
