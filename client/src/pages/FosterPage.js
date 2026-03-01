import React, { useState, useEffect } from 'react';
import { fosterAPI, animalsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import StartFosterForm from '../components/foster/StartFosterForm';
import FosterUpdateForm from '../components/foster/FosterUpdateForm';
import EndFosterForm from '../components/foster/EndFosterForm';
import './FosterPage.css';

const FosterPage = () => {
  const [fosters, setFosters] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [updates, setUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  // Modal states
  const [showStartForm, setShowStartForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showEndForm, setShowEndForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedFoster, setSelectedFoster] = useState(null);
  const [expandedFoster, setExpandedFoster] = useState(null);

  useEffect(() => {
    loadFosters();
    loadAvailableAnimals();
  }, [filter]);

  const loadFosters = async () => {
    try {
      const response = await fosterAPI.getRecords({ status: filter === 'all' ? '' : filter });
      setFosters(response.data);

      // Load updates for each foster (only if table exists)
      response.data.forEach(async (foster) => {
        try {
          const updatesResponse = await fosterAPI.getUpdates(foster.id);
          setUpdates(prev => ({
            ...prev,
            [foster.id]: updatesResponse.data
          }));
        } catch (error) {
          // Silently handle error - table might not exist yet (migration not run)
          // Set empty array so UI doesn't break
          setUpdates(prev => ({
            ...prev,
            [foster.id]: []
          }));
        }
      });
    } catch (error) {
      toast.error('Error loading foster records');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableAnimals = async () => {
    try {
      const response = await animalsAPI.getAll();
      // Filter to only show animals that are NOT already fostered or adopted
      const available = response.data.filter(a =>
        a.status !== 'fostered' &&
        a.status !== 'adopted' &&
        a.status !== 'deceased'
      );
      setAnimals(available);
    } catch (error) {
      console.error('Error loading animals:', error);
    }
  };

  const handleStartFoster = (animal) => {
    setSelectedAnimal(animal);
    setShowStartForm(true);
  };

  const handleAddUpdate = (foster) => {
    setSelectedFoster(foster);
    setShowUpdateForm(true);
  };

  const handleEndFoster = (foster) => {
    setSelectedFoster(foster);
    setShowEndForm(true);
  };

  const handleSuccess = () => {
    loadFosters();
    loadAvailableAnimals();
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'badge-success',
      completed: 'badge-info',
      returned: 'badge-warning'
    };
    return `badge ${classes[status] || 'badge-info'}`;
  };

  const getOutcomeBadge = (outcome) => {
    const badges = {
      returned: { label: 'Returned to Shelter', class: 'outcome-returned' },
      adopted_by_foster: { label: 'Foster Failure (Adopted!)', class: 'outcome-adopted' },
      early_return: { label: 'Early Return', class: 'outcome-early' },
      pending: { label: 'In Progress', class: 'outcome-pending' }
    };
    return badges[outcome] || badges.pending;
  };

  const getDaysInFoster = (startDate, endDate) => {
    const end = endDate ? new Date(endDate) : new Date();
    return Math.floor((end - new Date(startDate)) / (1000 * 60 * 60 * 24));
  };

  const toggleFosterDetails = (fosterId) => {
    setExpandedFoster(expandedFoster === fosterId ? null : fosterId);
  };

  const renderBaselineComparison = (foster) => {
    if (!foster.baseline_weight && !foster.exit_weight) return null;

    return (
      <div className="comparison-section">
        <h4>📊 Before & After Comparison</h4>

        <div className="comparison-grid">
          {foster.baseline_weight && foster.exit_weight && (
            <div className="comparison-item">
              <span className="comparison-label">Weight</span>
              <div className="comparison-values">
                <span className="before-value">{foster.baseline_weight} kg</span>
                <span className="arrow">→</span>
                <span className="after-value">{foster.exit_weight} kg</span>
                <span className={`change-badge ${foster.exit_weight >= foster.baseline_weight ? 'positive' : 'negative'}`}>
                  {foster.exit_weight >= foster.baseline_weight ? '+' : ''}
                  {(foster.exit_weight - foster.baseline_weight).toFixed(1)} kg
                </span>
              </div>
            </div>
          )}

          {foster.baseline_body_condition && foster.exit_body_condition && (
            <div className="comparison-item">
              <span className="comparison-label">Body Condition</span>
              <div className="comparison-values">
                <span className="before-value">{foster.baseline_body_condition}/9</span>
                <span className="arrow">→</span>
                <span className="after-value">{foster.exit_body_condition}/9</span>
                {foster.exit_body_condition > foster.baseline_body_condition && (
                  <span className="change-badge positive">Improved</span>
                )}
              </div>
            </div>
          )}

          {foster.baseline_socialization && foster.exit_socialization && (
            <div className="comparison-item">
              <span className="comparison-label">Socialization</span>
              <div className="comparison-values">
                <span className="before-value">{foster.baseline_socialization}</span>
                <span className="arrow">→</span>
                <span className="after-value">{foster.exit_socialization}</span>
              </div>
            </div>
          )}
        </div>

        {foster.exit_adoption_ready !== null && (
          <div className="adoption-readiness">
            {foster.exit_adoption_ready ? (
              <span className="ready">✅ Ready for Adoption</span>
            ) : (
              <span className="not-ready">⏳ Needs More Time</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderProgressTimeline = (foster) => {
    const fosterUpdates = updates[foster.id] || [];
    if (fosterUpdates.length === 0 && foster.status === 'active') {
      return (
        <div className="timeline-empty">
          <p>No progress updates yet. Add the first update to track development!</p>
        </div>
      );
    }

    return (
      <div className="progress-timeline">
        <h4>📈 Progress Timeline</h4>
        <div className="timeline">
          {/* Baseline marker */}
          <div className="timeline-item baseline">
            <div className="timeline-marker">🏁</div>
            <div className="timeline-content">
              <strong>Foster Started</strong>
              <p>{new Date(foster.start_date).toLocaleDateString()}</p>
              {foster.baseline_weight && <small>Weight: {foster.baseline_weight} kg</small>}
            </div>
          </div>

          {/* Progress updates */}
          {fosterUpdates.map((update, index) => (
            <div key={update.id} className="timeline-item update">
              <div className="timeline-marker">{update.week_number}</div>
              <div className="timeline-content">
                <strong>Week {update.week_number} Update</strong>
                <p>{new Date(update.update_date).toLocaleDateString()}</p>
                {update.current_weight && <small>Weight: {update.current_weight} kg</small>}
                {update.positive_observations && (
                  <p className="update-note">{update.positive_observations.substring(0, 100)}...</p>
                )}
              </div>
            </div>
          ))}

          {/* Exit marker (if completed) */}
          {foster.end_date && (
            <div className="timeline-item exit">
              <div className="timeline-marker">🏁</div>
              <div className="timeline-content">
                <strong>Foster Ended</strong>
                <p>{new Date(foster.end_date).toLocaleDateString()}</p>
                {foster.exit_weight && <small>Final Weight: {foster.exit_weight} kg</small>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="foster-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Foster Care - 3-Phase Tracking</h1>
            <p>Track animals through BEFORE → DURING → AFTER foster care</p>
          </div>
          <button
            onClick={() => setShowStartForm(true)}
            className="btn btn-primary"
          >
            <FaPlus /> Start New Foster
          </button>
        </div>

        {/* Filter */}
        <div className="card filters-card">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="active">Active Fosters ({fosters.filter(f => f.status === 'active').length})</option>
            <option value="completed">Completed ({fosters.filter(f => f.status === 'completed').length})</option>
            <option value="all">All Foster Records</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : fosters.length === 0 ? (
          <div className="card empty-state">
            <p>No foster records found</p>
            {filter === 'active' && (
              <button onClick={() => setShowStartForm(true)} className="btn btn-primary">
                Start Your First Foster
              </button>
            )}
          </div>
        ) : (
          <div className="fosters-grid">
            {fosters.map((foster) => {
              const daysInFoster = getDaysInFoster(foster.start_date, foster.end_date);
              const outcome = getOutcomeBadge(foster.outcome);
              const isExpanded = expandedFoster === foster.id;

              return (
                <div key={foster.id} className={`card foster-card ${isExpanded ? 'expanded' : ''}`}>
                  <div className="foster-header">
                    <div>
                      <h3>{foster.animal_name}</h3>
                      <p className="foster-species">{foster.species}</p>
                    </div>
                    <div className="header-badges">
                      <span className={getStatusBadgeClass(foster.status)}>
                        {foster.status}
                      </span>
                      {foster.outcome && foster.outcome !== 'pending' && (
                        <span className={`outcome-badge ${outcome.class}`}>
                          {outcome.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="foster-summary">
                    <div className="summary-item">
                      <strong>Foster Parent:</strong> {foster.foster_parent_name}
                    </div>
                    <div className="summary-item">
                      <strong>Duration:</strong> {daysInFoster} days
                    </div>
                    {foster.status === 'active' && (
                      <div className="summary-item">
                        <strong>Updates:</strong> {(updates[foster.id] || []).length} recorded
                      </div>
                    )}
                  </div>

                  {/* Action buttons for active fosters */}
                  {foster.status === 'active' && (
                    <div className="foster-actions">
                      <button
                        onClick={() => handleAddUpdate(foster)}
                        className="btn btn-sm btn-primary"
                      >
                        <FaChartLine /> Add Update
                      </button>
                      <button
                        onClick={() => handleEndFoster(foster)}
                        className="btn btn-sm btn-success"
                      >
                        <FaCheckCircle /> End Foster
                      </button>
                      <button
                        onClick={() => toggleFosterDetails(foster.id)}
                        className="btn btn-sm btn-outline"
                      >
                        <FaEdit /> {isExpanded ? 'Hide' : 'Show'} Details
                      </button>
                    </div>
                  )}

                  {/* View details button for completed fosters */}
                  {foster.status !== 'active' && (
                    <button
                      onClick={() => toggleFosterDetails(foster.id)}
                      className="btn btn-sm btn-outline foster-view-details"
                    >
                      {isExpanded ? 'Hide' : 'View'} Full Details
                    </button>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="foster-expanded-details">
                      {/* Contact info */}
                      <div className="foster-section">
                        <h4>Foster Parent Contact</h4>
                        {foster.foster_parent_phone && <p>📱 {foster.foster_parent_phone}</p>}
                        {foster.foster_parent_email && <p>📧 {foster.foster_parent_email}</p>}
                        {foster.foster_parent_address && <p>📍 {foster.foster_parent_address}</p>}
                      </div>

                      {/* Progress timeline */}
                      {renderProgressTimeline(foster)}

                      {/* Baseline vs Exit comparison */}
                      {foster.end_date && renderBaselineComparison(foster)}

                      {/* Exit feedback */}
                      {foster.exit_foster_parent_feedback && (
                        <div className="foster-section">
                          <h4>Foster Parent Feedback</h4>
                          {foster.exit_foster_parent_rating && (
                            <p className="rating">{'⭐'.repeat(foster.exit_foster_parent_rating)}</p>
                          )}
                          <p>{foster.exit_foster_parent_feedback}</p>
                        </div>
                      )}

                      {/* Notes */}
                      {foster.notes && (
                        <div className="foster-section">
                          <h4>Notes</h4>
                          <p>{foster.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showStartForm && (
        <StartFosterForm
          animal={selectedAnimal || { id: null }}
          animals={animals}
          onClose={() => {
            setShowStartForm(false);
            setSelectedAnimal(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {showUpdateForm && selectedFoster && (
        <FosterUpdateForm
          foster={selectedFoster}
          onClose={() => {
            setShowUpdateForm(false);
            setSelectedFoster(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {showEndForm && selectedFoster && (
        <EndFosterForm
          foster={selectedFoster}
          onClose={() => {
            setShowEndForm(false);
            setSelectedFoster(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default FosterPage;
