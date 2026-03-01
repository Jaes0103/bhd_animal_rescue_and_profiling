import React, { useState, useEffect } from 'react';
import { rescueMarkersAPI, diseaseZonesAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaPlus, FaFilter, FaCheckCircle, FaBan, FaExclamationCircle, FaVirus, FaEye, FaEyeSlash } from 'react-icons/fa';
import RescueMap from '../components/rescue/RescueMap';
import AddMarkerForm from '../components/rescue/AddMarkerForm';
import AddDiseaseZoneForm from '../components/rescue/AddDiseaseZoneForm';
import './RescueMarkersPage.css';

const RescueMarkersPage = () => {
  const [markers, setMarkers] = useState([]);
  const [diseaseZones, setDiseaseZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddDiseaseZoneForm, setShowAddDiseaseZoneForm] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [previewCoordinates, setPreviewCoordinates] = useState(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [isAddingDiseaseZone, setIsAddingDiseaseZone] = useState(false);
  const [showDiseaseZones, setShowDiseaseZones] = useState(true);
  const [previewCircleRadius, setPreviewCircleRadius] = useState(1.0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDiseaseType, setFilterDiseaseType] = useState('all');
  const [filterDiseaseStatus, setFilterDiseaseStatus] = useState('all');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedDiseaseZone, setSelectedDiseaseZone] = useState(null);

  useEffect(() => {
    fetchMarkers();
    fetchDiseaseZones();
  }, [filterStatus, filterPriority, filterDiseaseType, filterDiseaseStatus]);

  const fetchMarkers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPriority !== 'all') params.priority = filterPriority;

      const response = await rescueMarkersAPI.getAll(params);
      setMarkers(response.data);
    } catch (error) {
      console.error('Error fetching markers:', error);
      toast.error('Failed to fetch rescue markers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiseaseZones = async () => {
    try {
      const params = {};
      if (filterDiseaseType !== 'all') params.disease_type = filterDiseaseType;
      if (filterDiseaseStatus !== 'all') params.status = filterDiseaseStatus;

      const response = await diseaseZonesAPI.getAll(params);
      setDiseaseZones(response.data);
    } catch (error) {
      console.error('Error fetching disease zones:', error);
      toast.error('Failed to fetch disease zones');
    }
  };

  const handleMapClick = (latlng) => {
    if (isAddingMode) {
      setSelectedCoordinates(latlng);
      setShowAddForm(true);
      setIsAddingMode(false);
    } else if (isAddingDiseaseZone) {
      setSelectedCoordinates(latlng);
      setPreviewCoordinates(latlng);
      setShowAddDiseaseZoneForm(true);
      // Don't turn off isAddingDiseaseZone yet so preview circle stays visible
    }
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    setSelectedDiseaseZone(null);
  };

  const handleDiseaseZoneClick = (zone) => {
    setSelectedDiseaseZone(zone);
    setSelectedMarker(null);
  };

  const handleUpdateStatus = async (markerId, status) => {
    try {
      await rescueMarkersAPI.update(markerId, { status });
      toast.success(`Marker marked as ${status}`);
      fetchMarkers();
      setSelectedMarker(null);
    } catch (error) {
      console.error('Error updating marker:', error);
      toast.error(error.response?.data?.error || 'Failed to update marker');
    }
  };

  const handleDeleteMarker = async (markerId) => {
    if (!window.confirm('Are you sure you want to delete this marker?')) {
      return;
    }

    try {
      await rescueMarkersAPI.delete(markerId);
      toast.success('Marker deleted successfully');
      fetchMarkers();
      setSelectedMarker(null);
    } catch (error) {
      console.error('Error deleting marker:', error);
      toast.error(error.response?.data?.error || 'Failed to delete marker');
    }
  };

  const startAddingMode = () => {
    setIsAddingMode(true);
    setIsAddingDiseaseZone(false);
    toast.info('Click on the map to mark a location');
  };

  const cancelAddingMode = () => {
    setIsAddingMode(false);
    setIsAddingDiseaseZone(false);
    setSelectedCoordinates(null);
    setPreviewCoordinates(null);
  };

  const startAddingDiseaseZone = () => {
    setIsAddingDiseaseZone(true);
    setIsAddingMode(false);
    toast.info('Click on the map to mark disease outbreak center');
  };

  const handleUpdateDiseaseZone = async (zoneId, data) => {
    try {
      await diseaseZonesAPI.update(zoneId, data);
      toast.success('Disease zone updated successfully');
      fetchDiseaseZones();
      setSelectedDiseaseZone(null);
    } catch (error) {
      console.error('Error updating disease zone:', error);
      toast.error(error.response?.data?.error || 'Failed to update disease zone');
    }
  };

  const handleDeleteDiseaseZone = async (zoneId) => {
    if (!window.confirm('Are you sure you want to delete this disease zone?')) {
      return;
    }

    try {
      await diseaseZonesAPI.delete(zoneId);
      toast.success('Disease zone deleted successfully');
      fetchDiseaseZones();
      setSelectedDiseaseZone(null);
    } catch (error) {
      console.error('Error deleting disease zone:', error);
      toast.error(error.response?.data?.error || 'Failed to delete disease zone');
    }
  };

  const getStatusCounts = () => {
    return {
      pending: markers.filter(m => m.status === 'pending').length,
      rescued: markers.filter(m => m.status === 'rescued').length,
      cancelled: markers.filter(m => m.status === 'cancelled').length,
      total: markers.length
    };
  };

  const getPriorityCounts = () => {
    return {
      urgent: markers.filter(m => m.priority === 'urgent' && m.status === 'pending').length,
      high: markers.filter(m => m.priority === 'high' && m.status === 'pending').length,
      normal: markers.filter(m => m.priority === 'normal' && m.status === 'pending').length,
      low: markers.filter(m => m.priority === 'low' && m.status === 'pending').length
    };
  };

  const getDiseaseZoneCounts = () => {
    return {
      active: diseaseZones.filter(z => z.status === 'active').length,
      monitoring: diseaseZones.filter(z => z.status === 'monitoring').length,
      contained: diseaseZones.filter(z => z.status === 'contained').length,
      cleared: diseaseZones.filter(z => z.status === 'cleared').length,
      total: diseaseZones.length,
      totalCases: diseaseZones.reduce((sum, z) => sum + (z.confirmed_cases || 0), 0)
    };
  };

  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();
  const diseaseZoneCounts = getDiseaseZoneCounts();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading rescue markers...</p>
      </div>
    );
  }

  return (
    <div className="rescue-markers-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1><FaMapMarkerAlt /> Rescue Map</h1>
          <p>Mark and track stray animal locations for rescue</p>
        </div>
        <div className="header-actions">
          <button
            className={`btn ${showDiseaseZones ? 'btn-success' : 'btn-secondary'}`}
            onClick={() => setShowDiseaseZones(!showDiseaseZones)}
            title={showDiseaseZones ? 'Hide disease zones' : 'Show disease zones'}
          >
            {showDiseaseZones ? <FaEye /> : <FaEyeSlash />} Disease Zones
          </button>
          {isAddingMode || isAddingDiseaseZone ? (
            <button className="btn btn-secondary" onClick={cancelAddingMode}>
              Cancel
            </button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={startAddingMode}>
                <FaPlus /> Mark Animal
              </button>
              <button className="btn btn-danger" onClick={startAddingDiseaseZone}>
                <FaVirus /> Mark Disease Zone
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon pending">
            <FaExclamationCircle />
          </div>
          <div className="stat-info">
            <h3>{statusCounts.pending}</h3>
            <p>Pending Rescues</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rescued">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <h3>{statusCounts.rescued}</h3>
            <p>Rescued</p>
          </div>
        </div>

        <div className="stat-card urgent">
          <div className="stat-icon">
            <FaMapMarkerAlt />
          </div>
          <div className="stat-info">
            <h3>{priorityCounts.urgent}</h3>
            <p>Urgent Priority</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaMapMarkerAlt />
          </div>
          <div className="stat-info">
            <h3>{statusCounts.total}</h3>
            <p>Total Markers</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label><FaFilter /> Rescue Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending ({statusCounts.pending})</option>
            <option value="rescued">Rescued ({statusCounts.rescued})</option>
            <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Priority:</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent ({priorityCounts.urgent})</option>
            <option value="high">High ({priorityCounts.high})</option>
            <option value="normal">Normal ({priorityCounts.normal})</option>
            <option value="low">Low ({priorityCounts.low})</option>
          </select>
        </div>

        <div className="filter-group">
          <label><FaVirus /> Disease Type:</label>
          <select value={filterDiseaseType} onChange={(e) => setFilterDiseaseType(e.target.value)}>
            <option value="all">All Diseases</option>
            <option value="rabies">Rabies</option>
            <option value="distemper">Distemper</option>
            <option value="parvo">Parvovirus</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Zone Status:</label>
          <select value={filterDiseaseStatus} onChange={(e) => setFilterDiseaseStatus(e.target.value)}>
            <option value="all">All Zones</option>
            <option value="active">Active ({diseaseZoneCounts.active})</option>
            <option value="monitoring">Monitoring ({diseaseZoneCounts.monitoring})</option>
            <option value="contained">Contained ({diseaseZoneCounts.contained})</option>
            <option value="cleared">Cleared ({diseaseZoneCounts.cleared})</option>
          </select>
        </div>
      </div>

      {/* Map */}
      <div className="map-container">
        <RescueMap
          markers={markers}
          diseaseZones={diseaseZones}
          showDiseaseZones={showDiseaseZones}
          onMarkerClick={handleMarkerClick}
          onDiseaseZoneClick={handleDiseaseZoneClick}
          onMapClick={handleMapClick}
          isAddingMode={isAddingMode}
          isAddingDiseaseZone={isAddingDiseaseZone}
          previewCircleRadius={previewCircleRadius}
          previewCoordinates={previewCoordinates}
        />
      </div>

      {/* Marker Details Sidebar */}
      {selectedMarker && (
        <div className="marker-details-sidebar">
          <div className="sidebar-header">
            <h3>Marker Details</h3>
            <button className="btn-close" onClick={() => setSelectedMarker(null)}>×</button>
          </div>

          <div className="sidebar-content">
            <div className="detail-group">
              <label>Animal Type:</label>
              <p>{selectedMarker.animal_type || 'Unknown'}</p>
            </div>

            <div className="detail-group">
              <label>Status:</label>
              <span className={`status-badge status-${selectedMarker.status}`}>
                {selectedMarker.status}
              </span>
            </div>

            <div className="detail-group">
              <label>Priority:</label>
              <span className={`priority-badge priority-${selectedMarker.priority}`}>
                {selectedMarker.priority}
              </span>
            </div>

            <div className="detail-group">
              <label>Description:</label>
              <p>{selectedMarker.description || 'No description'}</p>
            </div>

            {selectedMarker.photo_url && (
              <div className="detail-group">
                <label>Photo:</label>
                <img src={selectedMarker.photo_url} alt="Animal" className="marker-photo" />
              </div>
            )}

            <div className="detail-group">
              <label>Location:</label>
              <p>{selectedMarker.latitude}, {selectedMarker.longitude}</p>
            </div>

            <div className="detail-group">
              <label>Marked by:</label>
              <p>{selectedMarker.marked_by_name || 'Unknown'}</p>
            </div>

            <div className="detail-group">
              <label>Date:</label>
              <p>{new Date(selectedMarker.created_at).toLocaleString()}</p>
            </div>

            {selectedMarker.notes && (
              <div className="detail-group">
                <label>Notes:</label>
                <p>{selectedMarker.notes}</p>
              </div>
            )}

            {selectedMarker.status === 'rescued' && (
              <>
                <div className="detail-group">
                  <label>Rescued by:</label>
                  <p>{selectedMarker.rescued_by_name || 'Unknown'}</p>
                </div>
                {selectedMarker.rescue_date && (
                  <div className="detail-group">
                    <label>Rescue Date:</label>
                    <p>{new Date(selectedMarker.rescue_date).toLocaleString()}</p>
                  </div>
                )}
              </>
            )}

            <div className="sidebar-actions">
              {selectedMarker.status === 'pending' && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={() => handleUpdateStatus(selectedMarker.id, 'rescued')}
                  >
                    <FaCheckCircle /> Mark as Rescued
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleUpdateStatus(selectedMarker.id, 'cancelled')}
                  >
                    <FaBan /> Cancel
                  </button>
                </>
              )}
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteMarker(selectedMarker.id)}
              >
                Delete Marker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disease Zone Details Sidebar */}
      {selectedDiseaseZone && (
        <div className="marker-details-sidebar disease-zone-sidebar">
          <div className="sidebar-header" style={{ background: '#E74C3C' }}>
            <h3><FaVirus /> Disease Zone Details</h3>
            <button className="btn-close" onClick={() => setSelectedDiseaseZone(null)}>×</button>
          </div>

          <div className="sidebar-content">
            <div className="detail-group">
              <label>Disease Type:</label>
              <p className="disease-type">{selectedDiseaseZone.disease_type.toUpperCase()}</p>
            </div>

            {selectedDiseaseZone.area_name && (
              <div className="detail-group">
                <label>Area:</label>
                <p>{selectedDiseaseZone.area_name}</p>
              </div>
            )}

            <div className="detail-group">
              <label>Status:</label>
              <span className={`status-badge status-${selectedDiseaseZone.status}`}>
                {selectedDiseaseZone.status}
              </span>
            </div>

            <div className="detail-group">
              <label>Severity:</label>
              <span className={`severity-badge severity-${selectedDiseaseZone.severity}`}>
                {selectedDiseaseZone.severity.toUpperCase()}
              </span>
            </div>

            <div className="detail-group">
              <label>Radius:</label>
              <p>{selectedDiseaseZone.radius_km} km</p>
            </div>

            <div className="detail-group">
              <label>Confirmed Cases:</label>
              <p>{selectedDiseaseZone.confirmed_cases}</p>
            </div>

            {selectedDiseaseZone.description && (
              <div className="detail-group">
                <label>Description:</label>
                <p>{selectedDiseaseZone.description}</p>
              </div>
            )}

            <div className="detail-group">
              <label>First Case Date:</label>
              <p>{new Date(selectedDiseaseZone.first_case_date).toLocaleDateString()}</p>
            </div>

            {selectedDiseaseZone.last_case_date && (
              <div className="detail-group">
                <label>Last Case Date:</label>
                <p>{new Date(selectedDiseaseZone.last_case_date).toLocaleDateString()}</p>
              </div>
            )}

            <div className="detail-group">
              <label>Location:</label>
              <p>{selectedDiseaseZone.latitude}, {selectedDiseaseZone.longitude}</p>
            </div>

            <div className="detail-group">
              <label>Marked by:</label>
              <p>{selectedDiseaseZone.marked_by_name || 'Unknown'}</p>
            </div>

            <div className="detail-group">
              <label>Date:</label>
              <p>{new Date(selectedDiseaseZone.created_at).toLocaleString()}</p>
            </div>

            {selectedDiseaseZone.notes && (
              <div className="detail-group">
                <label>Notes:</label>
                <p>{selectedDiseaseZone.notes}</p>
              </div>
            )}

            <div className="sidebar-actions">
              {selectedDiseaseZone.status !== 'cleared' && (
                <button
                  className="btn btn-success"
                  onClick={() => handleUpdateDiseaseZone(selectedDiseaseZone.id, { status: 'cleared' })}
                >
                  <FaCheckCircle /> Mark as Cleared
                </button>
              )}
              {selectedDiseaseZone.status === 'active' && (
                <button
                  className="btn btn-secondary"
                  onClick={() => handleUpdateDiseaseZone(selectedDiseaseZone.id, { status: 'contained' })}
                >
                  Mark as Contained
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteDiseaseZone(selectedDiseaseZone.id)}
              >
                Delete Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Marker Form Modal */}
      {showAddForm && (
        <AddMarkerForm
          coordinates={selectedCoordinates}
          onClose={() => {
            setShowAddForm(false);
            setSelectedCoordinates(null);
          }}
          onSuccess={fetchMarkers}
        />
      )}

      {/* Add Disease Zone Form Modal */}
      {showAddDiseaseZoneForm && (
        <AddDiseaseZoneForm
          coordinates={selectedCoordinates}
          onClose={() => {
            setShowAddDiseaseZoneForm(false);
            setSelectedCoordinates(null);
            setPreviewCoordinates(null);
            setPreviewCircleRadius(1.0);
            setIsAddingDiseaseZone(false);
          }}
          onSuccess={() => {
            fetchDiseaseZones();
            setPreviewCoordinates(null);
            setIsAddingDiseaseZone(false);
          }}
          onRadiusChange={setPreviewCircleRadius}
        />
      )}
    </div>
  );
};

export default RescueMarkersPage;
