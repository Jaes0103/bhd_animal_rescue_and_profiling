import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AddUserForm from '../components/users/AddUserForm';
import EditUserRoleForm from '../components/users/EditUserRoleForm';
import './UsersPage.css';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      toast.error('Error loading users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user) => {
    if (user.id === currentUser.id) {
      toast.warning('Cannot change your own role');
      return;
    }
    setSelectedUser(user);
    setShowEditForm(true);
  };

  const handleDelete = async (user) => {
    if (user.id === currentUser.id) {
      toast.warning('Cannot delete your own account');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await usersAPI.delete(user.id);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.error || 'Error deleting user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !search ||
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    drivers: users.filter(u => u.role === 'driver').length,
    volunteers: users.filter(u => u.role === 'volunteer').length
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      admin: 'badge-danger',
      staff: 'badge-info',
      driver: 'badge-warning',
      volunteer: 'badge-purple',
      public: 'badge-secondary'
    };
    return `badge ${classes[role] || 'badge-info'}`;
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>User Management</h1>
            <p>Manage system users and their roles</p>
          </div>
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
            <FaPlus /> Add User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card stat-danger">
            <div className="stat-value">{stats.admins}</div>
            <div className="stat-label">Admins</div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-value">{stats.staff}</div>
            <div className="stat-label">Staff</div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-value">{stats.drivers}</div>
            <div className="stat-label">Drivers</div>
          </div>
          <div className="stat-card stat-purple">
            <div className="stat-value">{stats.volunteers}</div>
            <div className="stat-label">Volunteers</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by username, name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="role-filter">
            <label>
              <FaFilter /> Filter by Role:
            </label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="driver">Driver</option>
              <option value="volunteer">Volunteer</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="empty-state card">
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={user.id === currentUser.id ? 'current-user' : ''}>
                    <td>
                      <strong>{user.username}</strong>
                      {user.id === currentUser.id && <span className="you-badge">You</span>}
                    </td>
                    <td>{user.full_name || '-'}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <span className={getRoleBadgeClass(user.role)}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEditRole(user)}
                          title="Edit Role"
                          disabled={user.id === currentUser.id}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(user)}
                          title="Delete User"
                          disabled={user.id === currentUser.id}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddForm && (
        <AddUserForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => loadUsers()}
        />
      )}

      {showEditForm && selectedUser && (
        <EditUserRoleForm
          user={selectedUser}
          onClose={() => {
            setShowEditForm(false);
            setSelectedUser(null);
          }}
          onSuccess={() => loadUsers()}
        />
      )}
    </div>
  );
};

export default UsersPage;
