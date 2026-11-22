import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api/client';
import { IconPlus, IconEdit, IconTrash, IconCheck } from './Icons';

export default function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add user form
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    interests: 'reading, coding',
  });
  const [addLoading, setAddLoading] = useState(false);

  // Edit user state
  const [editingUserId, setEditingUserId] = useState(null);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    role: 'user',
    interests: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/users?page=${page}&limit=5`);
      setUsers(data.data || []);
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAddLoading(true);
    try {
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify({
          ...newUser,
          interests: newUser.interests
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      setSuccess('User created successfully!');
      setNewUser({ username: '', email: '', password: '', role: 'user', interests: 'reading, coding' });
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user._id);
    setEditData({
      username: user.username,
      email: user.email,
      role: user.role,
      interests: (user.interests || []).join(', '),
    });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
  };

  const handleUpdateUser = async (userId) => {
    setError('');
    setSuccess('');
    try {
      await apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          username: editData.username,
          email: editData.email,
          role: editData.role,
          interests: editData.interests
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      setSuccess('User updated successfully!');
      cancelEdit();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser._id) {
      alert('You cannot delete your own admin account.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? All their notes and posts will be removed.')) return;

    setError('');
    setSuccess('');
    try {
      await apiRequest(`/users/${userId}`, {
        method: 'DELETE',
      });
      setSuccess('User removed successfully!');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-container">
      <div className="section-header">
        <div>
          <h2>User Management</h2>
          <p className="subtitle">Add, update, and manage accounts and permission roles.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Add User Form */}
      <div className="card">
        <h3>Add New User</h3>
        <form onSubmit={handleCreateUser}>
          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                required
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Username"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Temporary Password"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="user">User (Standard)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Interests (comma separated)</label>
            <input
              type="text"
              value={newUser.interests}
              onChange={(e) => setNewUser({ ...newUser, interests: e.target.value })}
              placeholder="e.g. chess, reading, coding"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={addLoading}>
            <IconPlus size={15} /> {addLoading ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>
          All Users <span className="badge badge-accent">Total: {pagination.totalCount}</span>
        </h3>

        {loading ? (
          <p className="loading-text">Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Interests</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isEditing = editingUserId === u._id;
                  return (
                    <tr key={u._id}>
                      {isEditing ? (
                        <>
                          <td>
                            <input
                              type="text"
                              value={editData.username}
                              onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              type="email"
                              value={editData.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            />
                          </td>
                          <td>
                            <select
                              value={editData.role}
                              onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                            >
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editData.interests}
                              onChange={(e) => setEditData({ ...editData, interests: e.target.value })}
                            />
                          </td>
                          <td>-</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleUpdateUser(u._id)}
                            >
                              <IconCheck size={13} /> Save
                            </button>
                            <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td><strong>{u.username}</strong></td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {(u.interests || []).map((i) => (
                              <span key={i} className="tag">
                                {i}
                              </span>
                            ))}
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="table-actions">
                              <button className="btn btn-sm btn-outline" onClick={() => startEdit(u)} title="Edit user">
                                <IconEdit size={13} /> Edit
                              </button>
                              {u._id !== currentUser._id && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeleteUser(u._id)}
                                  title="Delete user"
                                >
                                  <IconTrash size={13} /> Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination-bar">
            <button
              className="btn btn-secondary"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="page-indicator">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-secondary"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
