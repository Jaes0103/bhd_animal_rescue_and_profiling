import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animalsAPI } from '../services/api';
import toast from '../utils/toast';
import { FaPlus, FaExchangeAlt, FaEye, FaFilter, FaTable, FaColumns } from 'react-icons/fa';
import { Button } from '../components/common';
import AddObservationForm from '../components/animals/AddObservationForm';
import UpdateStatusForm from '../components/animals/UpdateStatusForm';
import KanbanBoard from '../components/health/KanbanBoard';
import './AreaManagementPage.css';

const AreaManagementPage = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('areaViewMode') || 'table';
  });
  const [kanbanType, setKanbanType] = useState(() => {
    return localStorage.getItem('areaKanbanType') || 'area';
  });

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      const response = await animalsAPI.getNeedingAttention();
      setAnimals(response.data);
    } catch (error) {
      toast.error('Error loading animals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimals = filter
    ? animals.filter(a => a.status === filter)
    : animals;

  const stats = {
    total: animals.length,
    quarantine: animals.filter(a => a.area === 'quarantine').length,
    under_observation: animals.filter(a => a.area === 'under_observation').length,
    in_treatment: animals.filter(a => a.area === 'in_treatment').length,
    medical_hold: animals.filter(a => a.area === 'medical_hold').length,
    missing_observations: animals.filter(a => {
      const daysSinceObservation = a.last_observation_date
        ? Math.floor((new Date() - new Date(a.last_observation_date)) / (1000 * 60 * 60 * 24))
        : 999;
      return daysSinceObservation > 7;
    }).length
  };

  const getDaysSince = (date) => {
    if (!date) return 'Never';
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      quarantine: 'badge-warning',
      under_observation: 'badge-info',
      in_treatment: 'badge-danger',
      medical_hold: 'badge-danger'
    };
    return `badge ${classes[status] || 'badge-info'}`;
  };

  const handleAddObservation = (animal) => {
    setSelectedAnimal(animal);
    setShowObservationForm(true);
  };

  const handleUpdateStatus = (animal) => {
    setSelectedAnimal(animal);
    setShowStatusForm(true);
  };

  const handleSuccess = () => {
    loadAnimals();
    setSelectedAnimal(null);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('areaViewMode', mode);
  };

  const handleKanbanTypeChange = (type) => {
    setKanbanType(type);
    localStorage.setItem('areaKanbanType', type);
  };

  if (loading) {
    return (
      <div className="health-management-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="health-management-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Area Management</h1>
            <p>Manage animals across different areas within shelters and clinics</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Needing Attention</div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-value">{stats.quarantine}</div>
            <div className="stat-label">In Quarantine</div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-value">{stats.under_observation}</div>
            <div className="stat-label">Under Observation</div>
          </div>
          <div className="stat-card stat-danger">
            <div className="stat-value">{stats.in_treatment}</div>
            <div className="stat-label">In Treatment</div>
          </div>
          <div className="stat-card stat-alert">
            <div className="stat-value">{stats.missing_observations}</div>
            <div className="stat-label">Missing Observations (7+ days)</div>
          </div>
        </div>

        {/* Filter and View Toggle */}
        <div className="filter-section">
          <div className="filter-left">
            <label>
              <FaFilter /> Filter by Status:
            </label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="quarantine">Quarantine</option>
              <option value="under_observation">Under Observation</option>
              <option value="in_treatment">In Treatment</option>
              <option value="medical_hold">Medical Hold</option>
            </select>
          </div>

          <div className="view-toggle">
            <Button
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('table')}
              title="Table View"
            >
              <FaTable /> Table
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('kanban')}
              title="Kanban Board"
            >
              <FaColumns /> Kanban
            </Button>
          </div>
        </div>

        {/* Kanban Type Toggle - Only show when in kanban mode */}
        {viewMode === 'kanban' && (
          <div className="filter-section">
            <div className="view-toggle" style={{ margin: '0 auto' }}>
              <Button
                variant={kanbanType === 'area' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleKanbanTypeChange('area')}
                title="Area Board"
              >
                Area Board
              </Button>
              <Button
                variant={kanbanType === 'status' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleKanbanTypeChange('status')}
                title="Status Board"
              >
                Status Board
              </Button>
            </div>
          </div>
        )}

        {/* Animals List/Board */}
        {filteredAnimals.length === 0 ? (
          <div className="empty-state card">
            <p>✅ No animals currently need health attention!</p>
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard animals={filteredAnimals} onUpdate={loadAnimals} type={kanbanType} />
        ) : (
          <div className="animals-table">
            <table>
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Status</th>
                  <th>Days Since Intake</th>
                  <th>Last Observation</th>
                  <th>Recent Obs.</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnimals.map((animal) => {
                  const daysSinceIntake = Math.floor(
                    (new Date() - new Date(animal.intake_date)) / (1000 * 60 * 60 * 24)
                  );
                  const needsObservation = !animal.last_observation_date ||
                    Math.floor((new Date() - new Date(animal.last_observation_date)) / (1000 * 60 * 60 * 24)) > 7;

                  return (
                    <tr key={animal.id} className={needsObservation ? 'needs-attention' : ''}>
                      <td>
                        <div className="animal-cell">
                          {animal.photos && animal.photos[0]?.photo_url ? (
                            <img
                              src={animal.photos[0].photo_url}
                              alt={animal.name}
                              className="animal-thumbnail"
                            />
                          ) : (
                            <div className="animal-thumbnail-placeholder">
                              {animal.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="animal-name">{animal.name}</div>
                            <div className="animal-details">
                              {animal.breed || animal.species}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(animal.status)}>
                          {animal.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{daysSinceIntake} days</td>
                      <td className={needsObservation ? 'text-warning' : ''}>
                        {getDaysSince(animal.last_observation_date)}
                        {needsObservation && ' ⚠️'}
                      </td>
                      <td>{animal.recent_observations_count || 0}</td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAddObservation(animal)}
                            title="Add Observation"
                          >
                            <FaPlus />
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleUpdateStatus(animal)}
                            title="Update Status"
                          >
                            <FaExchangeAlt />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/animals/${animal.id}`}
                            title="View Details"
                          >
                            <FaEye />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showObservationForm && selectedAnimal && (
        <AddObservationForm
          animalId={selectedAnimal.id}
          animalName={selectedAnimal.name}
          onClose={() => {
            setShowObservationForm(false);
            setSelectedAnimal(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {showStatusForm && selectedAnimal && (
        <UpdateStatusForm
          animal={selectedAnimal}
          onClose={() => {
            setShowStatusForm(false);
            setSelectedAnimal(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default AreaManagementPage;
