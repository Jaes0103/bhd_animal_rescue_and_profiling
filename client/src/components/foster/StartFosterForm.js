import React, { useState, useEffect } from 'react';
import { fosterAPI, animalsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './StartFosterForm.css';

const StartFosterForm = ({ animal, animals, onClose, onSuccess }) => {
  const [availableAnimals, setAvailableAnimals] = useState(animals || []);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('parent');

  const [formData, setFormData] = useState({
    animal_id: animal?.id || '',
    foster_parent_name: '',
    foster_parent_email: '',
    foster_parent_phone: '',
    foster_parent_address: '',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',

    // Baseline assessment
    baseline_weight: '',
    baseline_body_condition: 5,
    baseline_coat_condition: 'fair',
    baseline_health_notes: '',
    baseline_socialization: 'neutral',
    baseline_behavior_notes: '',
    baseline_with_people: 'calm',
    baseline_with_animals: '',
    baseline_food_aggression: false,
    baseline_medical_status: {
      vaccinated: false,
      dewormed: false,
      spayed_neutered: false
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMedicalStatusChange = (field) => {
    setFormData(prev => ({
      ...prev,
      baseline_medical_status: {
        ...prev.baseline_medical_status,
        [field]: !prev.baseline_medical_status[field]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.animal_id) {
      toast.error('Please select an animal');
      return;
    }

    if (!formData.foster_parent_name || !formData.foster_parent_phone) {
      toast.error('Foster parent name and phone are required');
      return;
    }

    setLoading(true);
    try {
      // Get selected animal info
      const selectedAnimal = availableAnimals.find(a => a.id === parseInt(formData.animal_id));

      // Create foster record
      await fosterAPI.create(formData);

      // Update animal status to fostered
      await animalsAPI.updateStatus(formData.animal_id, {
        status: 'fostered',
        area: selectedAnimal?.area || 'quarantine',
        notes: `Started foster care with ${formData.foster_parent_name}`
      });

      toast.success(`${selectedAnimal?.name || 'Animal'} assigned to foster parent successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error starting foster:', error);
      toast.error(error.response?.data?.error || 'Error starting foster care');
    } finally {
      setLoading(false);
    }
  };

  const selectedAnimal = availableAnimals.find(a => a.id === parseInt(formData.animal_id));

  return (
    <div className="modal-overlay">
      <div className="modal start-foster-modal">
        <div className="modal-header">
          <h2>Start Foster Care{selectedAnimal ? ` - ${selectedAnimal.name}` : ''}</h2>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'parent' ? 'active' : ''}`}
            onClick={() => setActiveTab('parent')}
          >
            Foster Parent
          </button>
          <button
            className={`tab-btn ${activeTab === 'baseline' ? 'active' : ''}`}
            onClick={() => setActiveTab('baseline')}
          >
            Baseline Assessment
          </button>
        </div>

        <form onSubmit={handleSubmit} className="start-foster-form">
          {activeTab === 'parent' && (
            <div className="tab-content">
              <h3>Foster Parent Information</h3>

              <div className="form-group">
                <label>Select Animal *</label>
                <select
                  name="animal_id"
                  value={formData.animal_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select an animal --</option>
                  {availableAnimals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.species} - {a.breed || 'Mixed'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Foster Parent Name *</label>
                <input
                  type="text"
                  name="foster_parent_name"
                  value={formData.foster_parent_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="foster_parent_phone"
                    value={formData.foster_parent_phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="foster_parent_email"
                    value={formData.foster_parent_email}
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
                />
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any special instructions or notes..."
                />
              </div>
            </div>
          )}

          {activeTab === 'baseline' && (
            <div className="tab-content">
              <h3>Baseline Assessment (Before Foster)</h3>
              <p className="tab-description">Document the animal's condition at the start of foster care</p>

              <div className="assessment-section">
                <h4>Physical Condition</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="baseline_weight"
                      value={formData.baseline_weight}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Body Condition Score (1-9)</label>
                    <select
                      name="baseline_body_condition"
                      value={formData.baseline_body_condition}
                      onChange={handleChange}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(score => (
                        <option key={score} value={score}>
                          {score} {score <= 3 ? '(Thin)' : score <= 5 ? '(Ideal)' : score <= 7 ? '(Overweight)' : '(Obese)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Coat Condition</label>
                    <select
                      name="baseline_coat_condition"
                      value={formData.baseline_coat_condition}
                      onChange={handleChange}
                    >
                      <option value="poor">Poor</option>
                      <option value="fair">Fair</option>
                      <option value="good">Good</option>
                      <option value="excellent">Excellent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Health Notes</label>
                  <textarea
                    name="baseline_health_notes"
                    value={formData.baseline_health_notes}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Visible injuries, health concerns, etc."
                  />
                </div>
              </div>

              <div className="assessment-section">
                <h4>Behavioral Assessment</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label>Socialization Level</label>
                    <select
                      name="baseline_socialization"
                      value={formData.baseline_socialization}
                      onChange={handleChange}
                    >
                      <option value="fearful">Fearful</option>
                      <option value="shy">Shy</option>
                      <option value="neutral">Neutral</option>
                      <option value="friendly">Friendly</option>
                      <option value="very_friendly">Very Friendly</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Reaction to People</label>
                    <select
                      name="baseline_with_people"
                      value={formData.baseline_with_people}
                      onChange={handleChange}
                    >
                      <option value="fearful">Fearful</option>
                      <option value="anxious">Anxious</option>
                      <option value="calm">Calm</option>
                      <option value="excited">Excited</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Reaction to Other Animals</label>
                  <input
                    type="text"
                    name="baseline_with_animals"
                    value={formData.baseline_with_animals}
                    onChange={handleChange}
                    placeholder="e.g., Friendly with dogs, fearful of cats"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="baseline_food_aggression"
                      checked={formData.baseline_food_aggression}
                      onChange={handleChange}
                    />
                    Food Aggression
                  </label>
                </div>

                <div className="form-group">
                  <label>Behavioral Notes</label>
                  <textarea
                    name="baseline_behavior_notes"
                    value={formData.baseline_behavior_notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Known behavioral issues, triggers, special needs..."
                  />
                </div>
              </div>

              <div className="assessment-section">
                <h4>Medical Status</h4>

                <div className="checkbox-group-horizontal">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.baseline_medical_status.vaccinated}
                      onChange={() => handleMedicalStatusChange('vaccinated')}
                    />
                    Vaccinated
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.baseline_medical_status.dewormed}
                      onChange={() => handleMedicalStatusChange('dewormed')}
                    />
                    Dewormed
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.baseline_medical_status.spayed_neutered}
                      onChange={() => handleMedicalStatusChange('spayed_neutered')}
                    />
                    Spayed/Neutered
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Starting Foster...' : 'Start Foster Care'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartFosterForm;
