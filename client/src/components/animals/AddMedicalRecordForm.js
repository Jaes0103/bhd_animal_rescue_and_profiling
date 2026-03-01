import React, { useState } from 'react';
import { medicalAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './AddMedicalRecordForm.css';

const AddMedicalRecordForm = ({ animalId, animalName, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    record_type: 'checkup',
    date: new Date().toISOString().split('T')[0],
    veterinarian: '',
    clinic: '',
    diagnosis: '',
    treatment: '',
    medication: '',
    notes: '',
    cost: '',
    next_appointment: ''
  });
  const [medicines, setMedicines] = useState([{ name: '', instructions: '' }]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', instructions: '' }]);
  };

  const removeMedicine = (index) => {
    if (medicines.length > 1) {
      const updatedMedicines = medicines.filter((_, i) => i !== index);
      setMedicines(updatedMedicines);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Convert medicines array to JSON string if there are any non-empty medicines
      const validMedicines = medicines.filter(m => m.name.trim() || m.instructions.trim());
      const medicationData = validMedicines.length > 0
        ? JSON.stringify(validMedicines)
        : '';

      const dataToSubmit = {
        animal_id: animalId,
        ...formData,
        medication: medicationData,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        next_appointment: formData.next_appointment || null
      };

      await medicalAPI.create(dataToSubmit);
      toast.success('Medical record added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding medical record:', error);
      toast.error(error.response?.data?.error || 'Error adding medical record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content medical-record-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Medical Record - {animalName}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="medical-record-form">
          <div className="form-section">
            <h3>Record Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Record Type <span className="required">*</span></label>
                <select
                  name="record_type"
                  value={formData.record_type}
                  onChange={handleChange}
                  required
                >
                  <option value="checkup">Check-up</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="surgery">Surgery</option>
                  <option value="treatment">Treatment</option>
                  <option value="medication">Medication</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Veterinarian</label>
                <input
                  type="text"
                  name="veterinarian"
                  value={formData.veterinarian}
                  onChange={handleChange}
                  placeholder="Dr. Maria Santos"
                />
              </div>

              <div className="form-group">
                <label>Clinic</label>
                <input
                  type="text"
                  name="clinic"
                  value={formData.clinic}
                  onChange={handleChange}
                  placeholder="Davao Animal Clinic"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Medical Details</h3>
            <div className="form-group">
              <label>Diagnosis</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                rows="2"
                placeholder="Medical diagnosis or assessment..."
              />
            </div>

            <div className="form-group">
              <label>Treatment</label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                rows="2"
                placeholder="Treatment provided..."
              />
            </div>

            <div className="form-group">
              <label>Medications</label>
              {medicines.map((medicine, index) => (
                <div key={index} className="medicine-entry">
                  <div className="medicine-fields">
                    <input
                      type="text"
                      placeholder="Medicine name (e.g., Amoxicillin 500mg)"
                      value={medicine.name}
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                      className="medicine-name-input"
                    />
                    <input
                      type="text"
                      placeholder="Instructions (e.g., 1 tablet twice daily for 7 days)"
                      value={medicine.instructions}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                      className="medicine-instructions-input"
                    />
                  </div>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="remove-medicine-btn"
                      title="Remove medicine"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMedicine}
                className="add-medicine-btn"
              >
                + Add Medicine
              </button>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional notes or observations..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Cost (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Next Appointment</label>
                <input
                  type="date"
                  name="next_appointment"
                  value={formData.next_appointment}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Medical Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicalRecordForm;
