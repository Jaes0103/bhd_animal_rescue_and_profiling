import React, { useState } from 'react';
import { fosterAPI, animalsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './EndFosterForm.css';

const EndFosterForm = ({ foster, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('outcome');

  const [formData, setFormData] = useState({
    end_date: new Date().toISOString().split('T')[0],
    outcome: 'returned',
    status: 'completed',

    // Exit assessment - Physical
    exit_weight: '',
    exit_body_condition: 5,
    exit_coat_condition: 'good',
    exit_health_notes: '',

    // Exit assessment - Behavioral
    exit_socialization: 'friendly',
    exit_behavior_notes: '',
    exit_skills_learned: '',
    exit_remaining_issues: '',

    // Adoption readiness
    exit_adoption_ready: true,
    exit_ideal_home: '',

    // Foster parent feedback
    exit_foster_parent_rating: 5,
    exit_foster_parent_feedback: '',
    exit_recommendations: '',
    exit_would_foster_again: true,

    // Early return (if applicable)
    early_return_reason: '',
    reason_for_return: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Update foster record with exit assessment
      await fosterAPI.update(foster.id, formData);

      // Animal status is updated automatically by the backend based on outcome
      // No need to manually update here

      const outcomeMessages = {
        returned: `${foster.animal_name} returned from foster - ${formData.exit_adoption_ready ? 'Ready for adoption!' : 'Needs more time'}`,
        adopted_by_foster: `${foster.animal_name} adopted by foster parent (foster failure - success!)`,
        early_return: `${foster.animal_name} returned early from foster`
      };

      toast.success(outcomeMessages[formData.outcome] || 'Foster care ended successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error ending foster:', error);
      toast.error(error.response?.data?.error || 'Error ending foster care');
    } finally {
      setLoading(false);
    }
  };

  const daysInFoster = Math.floor(
    (new Date() - new Date(foster.start_date)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="modal-overlay">
      <div className="modal end-foster-modal">
        <div className="modal-header">
          <div>
            <h2>End Foster Care - {foster.animal_name}</h2>
            <p className="foster-duration">{daysInFoster} days with {foster.foster_parent_name}</p>
          </div>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'outcome' ? 'active' : ''}`}
            onClick={() => setActiveTab('outcome')}
          >
            Outcome
          </button>
          <button
            className={`tab-btn ${activeTab === 'exit' ? 'active' : ''}`}
            onClick={() => setActiveTab('exit')}
          >
            Exit Assessment
          </button>
          <button
            className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            Foster Feedback
          </button>
        </div>

        <form onSubmit={handleSubmit} className="end-foster-form">
          {activeTab === 'outcome' && (
            <div className="tab-content">
              <h3>Foster Outcome</h3>

              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Foster Outcome *</label>
                <div className="outcome-options">
                  <label className="outcome-option">
                    <input
                      type="radio"
                      name="outcome"
                      value="returned"
                      checked={formData.outcome === 'returned'}
                      onChange={handleChange}
                    />
                    <div className="outcome-card">
                      <strong>✅ Successful Foster - Animal Returned</strong>
                      <p>Foster completed successfully, animal returns to shelter</p>
                    </div>
                  </label>

                  <label className="outcome-option">
                    <input
                      type="radio"
                      name="outcome"
                      value="adopted_by_foster"
                      checked={formData.outcome === 'adopted_by_foster'}
                      onChange={handleChange}
                    />
                    <div className="outcome-card">
                      <strong>❤️ Foster Failure - Foster Parent Adopting</strong>
                      <p>Foster parent has decided to adopt the animal</p>
                    </div>
                  </label>

                  <label className="outcome-option">
                    <input
                      type="radio"
                      name="outcome"
                      value="early_return"
                      checked={formData.outcome === 'early_return'}
                      onChange={handleChange}
                    />
                    <div className="outcome-card">
                      <strong>⚠️ Early Return</strong>
                      <p>Foster ending early due to challenges or circumstances</p>
                    </div>
                  </label>
                </div>
              </div>

              {formData.outcome === 'early_return' && (
                <div className="form-group">
                  <label>Reason for Early Return *</label>
                  <textarea
                    name="early_return_reason"
                    value={formData.early_return_reason}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Please explain why the foster is ending early..."
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional notes about the foster placement..."
                />
              </div>
            </div>
          )}

          {activeTab === 'exit' && (
            <div className="tab-content">
              <h3>Exit Assessment</h3>
              <p className="tab-description">Compare the animal's condition now vs. when they entered foster care</p>

              <div className="assessment-section">
                <h4>Physical Condition (After Foster)</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label>Final Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="exit_weight"
                      value={formData.exit_weight}
                      onChange={handleChange}
                    />
                    {foster.baseline_weight && (
                      <small className="baseline-compare">
                        Baseline: {foster.baseline_weight} kg
                        {formData.exit_weight && ` (${formData.exit_weight >= foster.baseline_weight ? '+' : ''}${(formData.exit_weight - foster.baseline_weight).toFixed(1)} kg)`}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Body Condition Score (1-9)</label>
                    <select
                      name="exit_body_condition"
                      value={formData.exit_body_condition}
                      onChange={handleChange}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(score => (
                        <option key={score} value={score}>
                          {score} {score <= 3 ? '(Thin)' : score <= 5 ? '(Ideal)' : score <= 7 ? '(Overweight)' : '(Obese)'}
                        </option>
                      ))}
                    </select>
                    {foster.baseline_body_condition && (
                      <small className="baseline-compare">Baseline: {foster.baseline_body_condition}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Coat Condition</label>
                    <select
                      name="exit_coat_condition"
                      value={formData.exit_coat_condition}
                      onChange={handleChange}
                    >
                      <option value="poor">Poor</option>
                      <option value="fair">Fair</option>
                      <option value="good">Good</option>
                      <option value="excellent">Excellent</option>
                    </select>
                    {foster.baseline_coat_condition && (
                      <small className="baseline-compare">Baseline: {foster.baseline_coat_condition}</small>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Health Notes</label>
                  <textarea
                    name="exit_health_notes"
                    value={formData.exit_health_notes}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Overall health status, any issues resolved or remaining..."
                  />
                </div>
              </div>

              <div className="assessment-section">
                <h4>Behavioral Development</h4>

                <div className="form-group">
                  <label>Socialization Level</label>
                  <select
                    name="exit_socialization"
                    value={formData.exit_socialization}
                    onChange={handleChange}
                  >
                    <option value="fearful">Fearful</option>
                    <option value="shy">Shy</option>
                    <option value="neutral">Neutral</option>
                    <option value="friendly">Friendly</option>
                    <option value="very_friendly">Very Friendly</option>
                  </select>
                  {foster.baseline_socialization && (
                    <small className="baseline-compare">Baseline: {foster.baseline_socialization}</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Skills Learned</label>
                  <textarea
                    name="exit_skills_learned"
                    value={formData.exit_skills_learned}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Commands, behaviors, training progress..."
                  />
                </div>

                <div className="form-group">
                  <label>Remaining Behavioral Issues</label>
                  <textarea
                    name="exit_remaining_issues"
                    value={formData.exit_remaining_issues}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Any behavioral issues that still need work..."
                  />
                </div>

                <div className="form-group">
                  <label>Behavioral Notes</label>
                  <textarea
                    name="exit_behavior_notes"
                    value={formData.exit_behavior_notes}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Overall behavioral progress and observations..."
                  />
                </div>
              </div>

              <div className="assessment-section">
                <h4>Adoption Readiness</h4>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="exit_adoption_ready"
                      checked={formData.exit_adoption_ready}
                      onChange={handleChange}
                    />
                    <strong>This animal is ready for adoption</strong>
                  </label>
                </div>

                <div className="form-group">
                  <label>Ideal Home Recommendations</label>
                  <textarea
                    name="exit_ideal_home"
                    value={formData.exit_ideal_home}
                    onChange={handleChange}
                    rows="3"
                    placeholder="What kind of home would be best? (e.g., experienced owner, no small children, yard required, single pet household)"
                  />
                </div>

                <div className="form-group">
                  <label>Recommendations for Next Foster/Adopter</label>
                  <textarea
                    name="exit_recommendations"
                    value={formData.exit_recommendations}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Tips, advice, things that worked well..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="tab-content">
              <h3>Foster Parent Feedback</h3>

              <div className="form-group">
                <label>How would you rate your foster experience? (1-5)</label>
                <div className="rating-select">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <label key={rating} className="rating-option">
                      <input
                        type="radio"
                        name="exit_foster_parent_rating"
                        value={rating}
                        checked={formData.exit_foster_parent_rating === rating}
                        onChange={(e) => handleChange({ target: { name: 'exit_foster_parent_rating', value: parseInt(e.target.value) } })}
                      />
                      <span className="rating-star">{'⭐'.repeat(rating)}</span>
                      <span className="rating-label">
                        {rating === 1 && 'Poor'}
                        {rating === 2 && 'Fair'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Foster Parent Feedback</label>
                <textarea
                  name="exit_foster_parent_feedback"
                  value={formData.exit_foster_parent_feedback}
                  onChange={handleChange}
                  rows="4"
                  placeholder="What did you enjoy? What was challenging? Any suggestions?"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="exit_would_foster_again"
                    checked={formData.exit_would_foster_again}
                    onChange={handleChange}
                  />
                  <strong>I would be willing to foster again in the future</strong>
                </label>
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
              {loading ? 'Ending Foster...' : 'Complete Foster Care'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EndFosterForm;
