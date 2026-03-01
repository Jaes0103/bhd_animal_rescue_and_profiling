import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaExclamationTriangle, FaCheckCircle, FaBan, FaVirus } from 'react-icons/fa';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons based on priority and status
const createCustomIcon = (priority, status) => {
  const colors = {
    pending: {
      low: '#4CAF50',
      normal: '#2196F3',
      high: '#FF9800',
      urgent: '#F44336'
    },
    rescued: '#27AE60',
    cancelled: '#95A5A6'
  };

  const color = status === 'rescued' ? colors.rescued :
                status === 'cancelled' ? colors.cancelled :
                colors.pending[priority] || colors.pending.normal;

  const svg = `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C8.373 0 3 5.373 3 12c0 9 12 28 12 28s12-19 12-28c0-6.627-5.373-12-12-12z"
            fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="15" cy="12" r="5" fill="#fff"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-marker-icon',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  });
};

// Component to handle map clicks for adding new markers
const MapClickHandler = ({ onMapClick, isAddingMode, isAddingDiseaseZone }) => {
  useMapEvents({
    click: (e) => {
      if (isAddingMode || isAddingDiseaseZone) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const RescueMap = ({
  markers = [],
  diseaseZones = [],
  onMarkerClick,
  onDiseaseZoneClick,
  onMapClick,
  isAddingMode = false,
  isAddingDiseaseZone = false,
  showDiseaseZones = true,
  previewCircleRadius = null,
  previewCoordinates = null,
  center = [7.0731, 125.6128], // Davao City coordinates
  zoom = 12
}) => {
  const mapRef = useRef();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'rescued':
        return <FaCheckCircle color="#27AE60" />;
      case 'cancelled':
        return <FaBan color="#95A5A6" />;
      default:
        return <FaExclamationTriangle color="#F39C12" />;
    }
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'Low Priority',
      normal: 'Normal',
      high: 'High Priority',
      urgent: 'URGENT'
    };
    return labels[priority] || priority;
  };

  const getDiseaseZoneColor = (diseaseType) => {
    const colors = {
      rabies: '#E74C3C',
      distemper: '#FF9800',
      parvo: '#FFC107',
      other: '#9C27B0'
    };
    return colors[diseaseType] || colors.other;
  };

  const getDiseaseZoneOpacity = (severity) => {
    const opacities = {
      low: 0.2,
      medium: 0.3,
      high: 0.4,
      critical: 0.5
    };
    return opacities[severity] || 0.3;
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Active Outbreak',
      monitoring: 'Under Monitoring',
      contained: 'Contained',
      cleared: 'Cleared'
    };
    return labels[status] || status;
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={onMapClick} isAddingMode={isAddingMode} isAddingDiseaseZone={isAddingDiseaseZone} />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[parseFloat(marker.latitude), parseFloat(marker.longitude)]}
            icon={createCustomIcon(marker.priority, marker.status)}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(marker)
            }}
          >
            <Popup>
              <div className="rescue-marker-popup">
                <div className="popup-header">
                  <h4>{marker.animal_type || 'Unknown Animal'}</h4>
                  <span className={`status-badge status-${marker.status}`}>
                    {getStatusIcon(marker.status)} {marker.status}
                  </span>
                </div>

                <div className="popup-body">
                  <p className={`priority priority-${marker.priority}`}>
                    {getPriorityLabel(marker.priority)}
                  </p>

                  {marker.description && (
                    <p className="description">{marker.description}</p>
                  )}

                  {marker.photo_url && (
                    <img
                      src={marker.photo_url}
                      alt="Animal"
                      style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px', marginTop: '8px' }}
                    />
                  )}

                  <div className="marker-info">
                    <p><strong>Marked by:</strong> {marker.marked_by_name || 'Unknown'}</p>
                    <p><strong>Date:</strong> {new Date(marker.created_at).toLocaleDateString()}</p>

                    {marker.status === 'rescued' && marker.rescued_by_name && (
                      <>
                        <p><strong>Rescued by:</strong> {marker.rescued_by_name}</p>
                        {marker.rescue_date && (
                          <p><strong>Rescue Date:</strong> {new Date(marker.rescue_date).toLocaleDateString()}</p>
                        )}
                      </>
                    )}

                    {marker.notes && (
                      <p className="notes"><strong>Notes:</strong> {marker.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Disease Zone Circles */}
        {showDiseaseZones && diseaseZones.map((zone) => (
          <Circle
            key={`zone-${zone.id}`}
            center={[parseFloat(zone.latitude), parseFloat(zone.longitude)]}
            radius={parseFloat(zone.radius_km) * 1000} // Convert km to meters
            pathOptions={{
              color: getDiseaseZoneColor(zone.disease_type),
              fillColor: getDiseaseZoneColor(zone.disease_type),
              fillOpacity: getDiseaseZoneOpacity(zone.severity),
              weight: 2,
              opacity: zone.status === 'cleared' ? 0.3 : 0.7
            }}
            eventHandlers={{
              click: () => onDiseaseZoneClick && onDiseaseZoneClick(zone)
            }}
          >
            <Popup>
              <div className="disease-zone-popup">
                <div className="popup-header">
                  <h4>
                    <FaVirus style={{ color: getDiseaseZoneColor(zone.disease_type), marginRight: '8px' }} />
                    {zone.disease_type.charAt(0).toUpperCase() + zone.disease_type.slice(1)}
                  </h4>
                  <span className={`status-badge status-${zone.status}`}>
                    {getStatusLabel(zone.status)}
                  </span>
                </div>

                <div className="popup-body">
                  {zone.area_name && (
                    <p><strong>Area:</strong> {zone.area_name}</p>
                  )}
                  <p><strong>Radius:</strong> {zone.radius_km} km</p>
                  <p><strong>Severity:</strong> <span className={`severity-${zone.severity}`}>{zone.severity.toUpperCase()}</span></p>
                  <p><strong>Confirmed Cases:</strong> {zone.confirmed_cases}</p>

                  {zone.description && (
                    <p className="description">{zone.description}</p>
                  )}

                  <div className="zone-info">
                    <p><strong>First Case:</strong> {new Date(zone.first_case_date).toLocaleDateString()}</p>
                    {zone.last_case_date && (
                      <p><strong>Last Case:</strong> {new Date(zone.last_case_date).toLocaleDateString()}</p>
                    )}
                    <p><strong>Marked by:</strong> {zone.marked_by_name || 'Unknown'}</p>
                    <p><strong>Date:</strong> {new Date(zone.created_at).toLocaleDateString()}</p>

                    {zone.notes && (
                      <p className="notes"><strong>Notes:</strong> {zone.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Preview Circle when adding disease zone */}
        {previewCoordinates && previewCircleRadius && (
          <Circle
            center={[previewCoordinates.lat, previewCoordinates.lng]}
            radius={previewCircleRadius * 1000} // Convert km to meters
            pathOptions={{
              color: '#E74C3C',
              fillColor: '#E74C3C',
              fillOpacity: 0.2,
              weight: 2,
              dashArray: '10, 10'
            }}
          />
        )}
      </MapContainer>

      {isAddingMode && (
        <div className="map-overlay">
          <div className="adding-mode-notice">
            <FaMapMarkerAlt /> Click on the map to mark a location
          </div>
        </div>
      )}

      {isAddingDiseaseZone && (
        <div className="map-overlay">
          <div className="adding-mode-notice disease-zone-notice">
            <FaVirus /> Click on the map to mark disease outbreak center
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueMap;
