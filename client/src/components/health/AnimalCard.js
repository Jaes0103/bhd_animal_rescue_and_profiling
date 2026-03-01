import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import './AnimalCard.css';

const AnimalCard = ({ animal, isDragging }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    // Don't navigate if clicking on the card during drag
    if (!isDragging) {
      navigate(`/animals/${animal.id}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      healthy: { label: 'Healthy', color: '#27AE60' },
      stable: { label: 'Stable', color: '#5DADE2' },
      treatment: { label: 'Treatment', color: '#E67E22' },
      on_clinic: { label: 'On Clinic', color: '#9B59B6' },
      fostered: { label: 'Fostered', color: '#3498DB' },
      available_for_adoption: { label: 'Available', color: '#1ABC9C' },
      adopted: { label: 'Adopted', color: '#16A085' },
      deceased: { label: 'Deceased', color: '#7F8C8D' }
    };
    return statusMap[status] || { label: status, color: '#95A5A6' };
  };

  const statusInfo = getStatusBadge(animal.status);

  return (
    <div
      className={`kanban-animal-card ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
    >
      <div className="card-image">
        {animal.photos && animal.photos[0]?.photo_url ? (
          <img src={animal.photos[0].photo_url} alt={animal.name} />
        ) : (
          <div className="card-placeholder">
            {animal.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="card-content">
        <h4 className="card-title">{animal.name}</h4>
        <p className="card-subtitle">
          {animal.breed && animal.species
            ? `${animal.breed} • ${animal.species.charAt(0).toUpperCase() + animal.species.slice(1)}`
            : animal.breed || animal.species}
        </p>

        {animal.location && (
          <div className="card-location">
            <FaMapMarkerAlt className="location-icon" />
            <span className="location-name">{animal.location}</span>
          </div>
        )}

        <div className="card-status">
          <span
            className="status-badge"
            style={{ backgroundColor: statusInfo.color }}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;
