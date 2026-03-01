import React, { useState } from 'react';
import { usersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './EditUserRoleForm.css';

const EditUserRoleForm = ({ user, onClose, onSuccess }) => {
  const [newRole, setNewRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newRole === user.role) {
      toast.info('Role unchanged');
      onClose();
      return;
    }

    setLoading(true);
    try {
      await usersAPI.updateRole(user.id, newRole);
      toast.success(`Role updated to ${newRole} successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.error || 'Error updating role');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      admin: 'badge-danger',
      staff: 'badge-info',
      driver: 'badge-warning',
      volunteer: 'badge-purple'
    };
    return `badge ${classes[role] || 'badge-info'}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-role-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit User Role</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-role-form">
          <div className="user-info">
            <div className="info-row">
              <strong>Username:</strong> {user.username}
            </div>
            <div className="info-row">
              <strong>Full Name:</strong> {user.full_name}
            </div>
            <div className="info-row">
              <strong>Current Role:</strong>
              <span className={getRoleBadgeClass(user.role)}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>New Role <span className="required">*</span></label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              required
            >
              <option value="volunteer">Volunteer</option>
              <option value="staff">Staff</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {newRole !== user.role && (
            <div className="confirmation-message">
              <p>
                ⚠️ Are you sure you want to change <strong>{user.username}</strong>'s role from{' '}
                <strong>{user.role}</strong> to <strong>{newRole}</strong>?
              </p>
            </div>
          )}

          {newRole === 'admin' && user.role !== 'admin' && (
            <div className="form-warning">
              <strong>⚠️ Warning:</strong> Granting admin role gives full system access including user management.
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserRoleForm;
