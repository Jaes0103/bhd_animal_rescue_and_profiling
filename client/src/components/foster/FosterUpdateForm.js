import React, { useState } from 'react';
import { fosterAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './FosterUpdateForm.css';

const FosterUpdateForm = ({ foster, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('physical');

  const [formData, setFormData] = useState({
    update_date: new Date().toISOString().split('T')[0],

    // Physical
    current_weight: '',
    body_condition_notes: '',
    health_observations: '',
    vet_visits: '',

    // Behavioral
    socialization_progress: '',
    behaviors_learned: '',
    problem_behaviors: '',
    interaction_with_family: '',
    interaction_with_pets: '',
    training_progress: '',

    // Daily living
    eating_habits: '',
    house_training_status: 'in_progress',
    sleep_patterns: '',
    energy_level: 'moderate',
    play_preferences: '',

    // Foster parent input
    concerns: '',
    positive_observations: '',
    support_needed: '',
    photos: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await fosterAPI.addUpdate(foster.id, formData);
      toast.success('Foster update recorded successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding foster update:', error);
      toast.error(error.response?.data?.error || 'Error recording foster update');
    } finally {
      setLoading(false);
    }
  };

  // Calculate days in foster
  const daysInFoster = Math.floor(
    (new Date() - new Date(foster.start_date)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="modal-overlay">
      <div className="modal foster-update-modal">
        <div className="modal-header">
          <div>
            <h2>Foster Progress Update - {foster.animal_name}</h2>
            <p className="foster-duration">Day {daysInFoster} with {foster.foster_parent_name}</p>
          </div>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'physical' ? 'active' : ''}`}
            onClick={() => setActiveTab('physical')}
          >
            Physical
          </button>
          <button
            className={`tab-btn ${activeTab === 'behavioral' ? 'active' : ''}`}
            onClick={() => setActiveTab('behavioral')}
          >
            Behavioral
          </button>
          <button
            className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Living
          </button>
          <button
            className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </button>
        </div>

        <form onSubmit={handleSubmit} className="foster-update-form">
          <div className="form-group">
            <label>Update Date</label>
            <input
              type="date"
              name="update_date"
              value={formData.update_date}
              onChange={handleChange}
              required
            />
          </div>

          {activeTab === 'physical' && (
            <div className="tab-content">
              <h3>Physical Updates</h3>

              <div className="form-group">
                <label>Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="current_weight"
                  value={formData.current_weight}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <div className="form-group">
                <label>Body Condition Notes</label>
                <textarea
                  name="body_condition_notes"
                  value={formData.body_condition_notes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Weight gain/loss, muscle tone, overall appearance..."
                />
              </div>

              <div className="form-group">
                <label>Health Observations</label>
                <textarea
                  name="health_observations"
                  value={formData.health_observations}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Energy levels, appetite, any symptoms or concerns..."
                />
              </div>

              <div className="form-group">
                <label>Vet Visits / Medical Updates</label>
                <textarea
                  name="vet_visits"
                  value={formData.vet_visits}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Any vet visits, medications, treatments..."
                />
              </div>
            </div>
          )}

          {activeTab === 'behavioral' && (
            <div className="tab-content">
              <h3>Behavioral Progress</h3>

              <div className="form-group">
                <label>Socialization Progress</label>
                <textarea
                  name="socialization_progress"
                  value={formData.socialization_progress}
                  onChange={handleChange}
                  rows="2"
                  placeholder="How is the animal adjusting? More confident? Less fearful?"
                />
              </div>

              <div className="form-group">
                <label>New Behaviors Learned</label>
                <textarea
                  name="behaviors_learned"
                  value={formData.behaviors_learned}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Commands, tricks, good habits..."
                />
              </div>

              <div className="form-group">
                <label>Problem Behaviors</label>
                <textarea
                  name="problem_behaviors"
                  value={formData.problem_behaviors}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Any challenging behaviors that need work..."
                />
              </div>

              <div className="form-group">
                <label>Interaction with Family</label>
                <textarea
                  name="interaction_with_family"
                  value={formData.interaction_with_family}
                  onChange={handleChange}
                  rows="2"
                  placeholder="How does the animal interact with household members?"
                />
              </div>

              <div className="form-group">
                <label>Interaction with Other Pets</label>
                <textarea
                  name="interaction_with_pets"
                  value={formData.interaction_with_pets}
                  onChange={handleChange}
                  rows="2"
                  placeholder="If applicable, interactions with other household pets..."
                />
              </div>

              <div className="form-group">
                <label>Training Progress</label>
                <textarea
                  name="training_progress"
                  value={formData.training_progress}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Leash training, obedience, crate training, etc..."
                />
              </div>
            </div>
          )}

          {activeTab === 'daily' && (
            <div className="tab-content">
              <h3>Daily Living</h3>

              <div className="form-group">
                <label>Eating Habits</label>
                <textarea
                  name="eating_habits"
                  value={formData.eating_habits}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Appetite, food preferences, eating schedule..."
                />
              </div>

              <div className="form-group">
                <label>House Training Status</label>
                <select
                  name="house_training_status"
                  value={formData.house_training_status}
                  onChange={handleChange}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="mostly_trained">Mostly Trained</option>
                  <option value="fully_trained">Fully Trained</option>
                </select>
              </div>

              <div className="form-group">
                <label>Sleep Patterns</label>
                <textarea
                  name="sleep_patterns"
                  value={formData.sleep_patterns}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Where they sleep, sleeping through the night, etc..."
                />
              </div>

              <div className="form-group">
                <label>Energy Level</label>
                <select
                  name="energy_level"
                  value={formData.energy_level}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="very_high">Very High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Play Preferences</label>
                <textarea
                  name="play_preferences"
                  value={formData.play_preferences}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Favorite toys, games, activities..."
                />
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="tab-content">
              <h3>Foster Parent Notes</h3>

              <div className="form-group">
                <label>Concerns or Questions</label>
                <textarea
                  name="concerns"
                  value={formData.concerns}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any concerns or questions for Bantay Hayop staff..."
                />
              </div>

              <div className="form-group">
                <label>Positive Observations</label>
                <textarea
                  name="positive_observations"
                  value={formData.positive_observations}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Things that are going well, wins, happy moments..."
                />
              </div>

              <div className="form-group">
                <label>Support Needed</label>
                <textarea
                  name="support_needed"
                  value={formData.support_needed}
                  onChange={handleChange}
                  rows="2"
                  placeholder="What help do you need from Bantay Hayop?"
                />
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
              {loading ? 'Saving...' : 'Save Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FosterUpdateForm;
