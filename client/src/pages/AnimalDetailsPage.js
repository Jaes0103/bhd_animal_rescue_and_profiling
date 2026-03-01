import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { animalsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaEdit, FaPlus, FaNotesMedical, FaExchangeAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AddObservationForm from '../components/animals/AddObservationForm';
import AddMedicalRecordForm from '../components/animals/AddMedicalRecordForm';
import UpdateStatusForm from '../components/animals/UpdateStatusForm';
import TransferAnimalForm from '../components/animals/TransferAnimalForm';
import EditAnimalForm from '../components/animals/EditAnimalForm';
import './AnimalDetailsPage.css';

const AnimalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    loadAnimal();
  }, [id]);

  const loadAnimal = async () => {
    try {
      const response = await animalsAPI.getById(id);
      setAnimal(response.data);
    } catch (error) {
      toast.error('Error loading animal details');
      navigate('/animals');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!animal) return null;

  const getStatusBadgeClass = (status) => {
    const classes = {
      quarantine: 'badge-warning',
      under_observation: 'badge-info',
      in_treatment: 'badge-danger',
      available: 'badge-success',
      pending_adoption: 'badge-purple',
      adopted: 'badge-success',
      fostered: 'badge-info',
      medical_hold: 'badge-danger',
      deceased: 'badge-dark'
    };
    return `badge ${classes[status] || 'badge-info'}`;
  };

  return (
    <div className="animal-details-page">
      <div className="container">
        <button onClick={() => navigate('/animals')} className="btn btn-outline back-button">
          <FaArrowLeft /> Back to Animals
        </button>

        <div className="details-grid">
          {/* Photos Section */}
          <div className="details-photos">
            {animal.photos && animal.photos.length > 0 ? (
              <div className="main-photo">
                <img src={animal.photos[0].photo_url} alt={animal.name} />
              </div>
            ) : (
              <div className="placeholder-photo">No Photo Available</div>
            )}
            {animal.photos && animal.photos.length > 1 && (
              <div className="photo-gallery">
                {animal.photos.slice(1).map((photo) => (
                  <img key={photo.id} src={photo.photo_url} alt={animal.name} />
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="details-info">
            <div className="card">
              <div className="details-header">
                <div>
                  <h1>{animal.name}</h1>
                  <span className={getStatusBadgeClass(animal.status)}>
                    {animal.status.replace('_', ' ')}
                  </span>
                </div>
                {hasRole('admin', 'volunteer', 'staff') && (
                  <div className="details-actions">
                    {hasRole('admin', 'staff') && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => setShowStatusForm(true)}
                        >
                          <FaExchangeAlt /> Update Status
                        </button>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => setShowTransferForm(true)}
                        >
                          <FaMapMarkerAlt /> Transfer
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowEditForm(true)}
                    >
                      <FaEdit /> Edit
                    </button>
                  </div>
                )}
              </div>

              <div className="details-section">
                <h3>Basic Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Species</span>
                    <span className="info-value">{animal.species}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Breed</span>
                    <span className="info-value">{animal.breed || 'Mixed'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">
                      {animal.age_years > 0 && `${animal.age_years} years `}
                      {animal.age_months > 0 && `${animal.age_months} months`}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{animal.gender}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Color</span>
                    <span className="info-value">{animal.color || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Size</span>
                    <span className="info-value">{animal.size || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Weight</span>
                    <span className="info-value">{animal.weight ? `${animal.weight} kg` : 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Intake Date</span>
                    <span className="info-value">
                      {new Date(animal.intake_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {animal.description && (
                <div className="details-section">
                  <h3>Description</h3>
                  <p>{animal.description}</p>
                </div>
              )}

              <div className="details-section">
                <h3>Health & Care</h3>
                <div className="health-badges">
                  <span className={`badge ${animal.spayed_neutered ? 'badge-success' : 'badge-danger'}`}>
                    {animal.spayed_neutered ? 'Spayed/Neutered' : 'Not Spayed/Neutered'}
                  </span>
                  <span className={`badge ${animal.vaccinated ? 'badge-success' : 'badge-warning'}`}>
                    {animal.vaccinated ? 'Vaccinated' : 'Needs Vaccination'}
                  </span>
                  <span className={`badge ${animal.microchipped ? 'badge-success' : 'badge-warning'}`}>
                    {animal.microchipped ? 'Microchipped' : 'Not Microchipped'}
                  </span>
                </div>
              </div>

              {animal.special_needs && (
                <div className="details-section">
                  <h3>Special Needs</h3>
                  <p>{animal.special_needs}</p>
                </div>
              )}

              {animal.behavior_notes && (
                <div className="details-section">
                  <h3>Behavior Notes</h3>
                  <p>{animal.behavior_notes}</p>
                </div>
              )}

              {animal.adoption_fee && ['available', 'pending_adoption', 'adopted'].includes(animal.status) && (
                <div className="details-section">
                  <h3>Adoption Fee</h3>
                  <p className="adoption-fee">₱{parseFloat(animal.adoption_fee).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Observations Section */}
            {hasRole('admin', 'staff', 'volunteer') && (
              <div className="card">
                <div className="section-header">
                  <h3>Observations</h3>
                  {hasRole('admin', 'staff') && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowObservationForm(true)}
                    >
                      <FaPlus /> Add Observation
                    </button>
                  )}
                </div>
                {animal.observations && animal.observations.length > 0 ? (
                  <div className="observations-list">
                    {animal.observations.map((obs) => (
                      <div key={obs.id} className="observation-item">
                        <div className="observation-header">
                          <span className={`badge badge-${obs.observation_type}`}>
                            {obs.observation_type}
                          </span>
                          <span className="observation-date">
                            {new Date(obs.observation_date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="observation-notes">{obs.notes}</p>
                        <div className="observation-footer">
                          <small>
                            By {obs.observer_name} ({obs.observer_role})
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-message">No observations recorded yet.</p>
                )}
              </div>
            )}

            {/* Medical Records */}
            <div className="card">
              <div className="section-header">
                <h3>Medical Records</h3>
                {hasRole('admin', 'staff') && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowMedicalForm(true)}
                  >
                    <FaNotesMedical /> Add Medical Record
                  </button>
                )}
              </div>
              {animal.medical_records && animal.medical_records.length > 0 ? (
                <div className="medical-records">
                  {animal.medical_records.map((record) => (
                    <div key={record.id} className="medical-record">
                      <div className="record-header">
                        <span className="record-type badge badge-info">
                          {record.record_type.replace('_', ' ')}
                        </span>
                        <span className="record-date">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                      {record.diagnosis && <p><strong>Diagnosis:</strong> {record.diagnosis}</p>}
                      {record.treatment && <p><strong>Treatment:</strong> {record.treatment}</p>}
                      {record.veterinarian && <p><strong>Vet:</strong> {record.veterinarian}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No medical records yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showObservationForm && (
        <AddObservationForm
          animalId={animal.id}
          animalName={animal.name}
          onClose={() => setShowObservationForm(false)}
          onSuccess={() => loadAnimal()}
        />
      )}

      {showMedicalForm && (
        <AddMedicalRecordForm
          animalId={animal.id}
          animalName={animal.name}
          onClose={() => setShowMedicalForm(false)}
          onSuccess={() => loadAnimal()}
        />
      )}

      {showStatusForm && (
        <UpdateStatusForm
          animal={animal}
          onClose={() => setShowStatusForm(false)}
          onSuccess={() => loadAnimal()}
        />
      )}

      {showTransferForm && (
        <TransferAnimalForm
          animal={animal}
          onClose={() => setShowTransferForm(false)}
          onSuccess={() => loadAnimal()}
        />
      )}

      {showEditForm && (
        <EditAnimalForm
          animal={animal}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => loadAnimal()}
        />
      )}
    </div>
  );
};

export default AnimalDetailsPage;
