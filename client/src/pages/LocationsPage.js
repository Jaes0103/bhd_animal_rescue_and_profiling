import React, { useState, useEffect } from 'react';
import { locationsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaPaw, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa';
import AddLocationForm from '../components/locations/AddLocationForm';
import EditLocationForm from '../components/locations/EditLocationForm';
import './LocationsPage.css';

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    fetchLocations();
  }, [filterType, filterActive]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      if (filterActive !== 'all') params.is_active = filterActive;

      const response = await locationsAPI.getAll(params);
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      await locationsAPI.delete(id);
      toast.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error(error.response?.data?.error || 'Failed to delete location');
    }
  };

  const getLocationTypeColor = (type) => {
    const colors = {
      shelter: '#27AE60',      // Green for shelters
      clinic: '#E74C3C',       // Red for clinics (brand color)
      foster_home: '#5B7DAD',  // Blue for foster homes (brand color)
      other: '#6C757D'         // Gray for other
    };
    return colors[type] || colors.other;
  };

  const getLocationTypeName = (type) => {
    const names = {
      shelter: 'Shelter',
      clinic: 'Clinic',
      foster_home: 'Foster Home',
      other: 'Other'
    };
    return names[type] || type;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading locations...</p>
      </div>
    );
  }

  return (
    <div className="locations-page">
      <div className="page-header">
        <div>
          <h1>Locations & Facilities</h1>
          <p>Manage shelters, clinics, and foster homes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <FaPlus /> Add Location
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="shelter">Shelters</option>
            <option value="clinic">Clinics</option>
            <option value="foster_home">Foster Homes</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
            <option value="all">All</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>

        <div className="filter-stats">
          <span className="stat-item">
            <strong>{locations.length}</strong> location{locations.length !== 1 ? 's' : ''}
          </span>
          <span className="stat-item">
            <strong>{locations.reduce((sum, loc) => sum + (loc.current_count || 0), 0)}</strong> animals
          </span>
        </div>
      </div>

      {/* Locations Grid */}
      {locations.length === 0 ? (
        <div className="empty-state">
          <FaMapMarkerAlt size={64} color="#ccc" />
          <h3>No locations found</h3>
          <p>Add a location to get started</p>
        </div>
      ) : (
        <div className="locations-grid">
          {locations.map((location) => (
            <div key={location.id} className="location-card">
              <div className="location-header">
                <div className="location-title">
                  <h3>{location.name}</h3>
                  <span
                    className="location-type-badge"
                    style={{ backgroundColor: getLocationTypeColor(location.type) }}
                  >
                    {getLocationTypeName(location.type)}
                  </span>
                </div>
                <div className="location-actions">
                  <button
                    className="btn-icon"
                    onClick={() => setEditingLocation(location)}
                    title="Edit location"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDelete(location.id)}
                    title="Delete location"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="location-body">
                {location.address && (
                  <div className="location-info">
                    <FaMapMarkerAlt className="icon" />
                    <div>
                      <div>{location.address}</div>
                      {location.city && <div className="text-muted">{location.city}</div>}
                    </div>
                  </div>
                )}

                {location.contact_person && (
                  <div className="location-info">
                    <FaUser className="icon" />
                    <div>{location.contact_person}</div>
                  </div>
                )}

                {location.contact_phone && (
                  <div className="location-info">
                    <FaPhone className="icon" />
                    <div>{location.contact_phone}</div>
                  </div>
                )}

                {location.contact_email && (
                  <div className="location-info">
                    <FaEnvelope className="icon" />
                    <div>{location.contact_email}</div>
                  </div>
                )}

                {location.notes && (
                  <div className="location-notes">
                    <p>{location.notes}</p>
                  </div>
                )}
              </div>

              <div className="location-footer">
                <div className="capacity-info">
                  <FaPaw className="icon" />
                  <span>
                    {location.current_count || 0}
                    {location.capacity && ` / ${location.capacity}`} animals
                  </span>
                </div>
                {location.capacity && (
                  <div className="capacity-bar">
                    <div
                      className="capacity-fill"
                      style={{
                        width: `${Math.min((location.current_count || 0) / location.capacity * 100, 100)}%`,
                        backgroundColor: (location.current_count || 0) / location.capacity > 0.9 ? '#f44336' : '#4caf50'
                      }}
                    />
                  </div>
                )}
                {!location.is_active && (
                  <div className="inactive-badge">Inactive</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Location Modal */}
      {showAddForm && (
        <AddLocationForm
          onClose={() => setShowAddForm(false)}
          onSuccess={fetchLocations}
        />
      )}

      {/* Edit Location Modal */}
      {editingLocation && (
        <EditLocationForm
          location={editingLocation}
          onClose={() => setEditingLocation(null)}
          onSuccess={fetchLocations}
        />
      )}
    </div>
  );
};

export default LocationsPage;
