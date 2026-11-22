import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api/client';
import { IconPlus, IconEdit, IconTrash, IconCheck } from './Icons';

function formatNoteDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create note form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit note state
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: '6',
        ...(user.role === 'admin' && viewAll ? { all: 'true' } : {}),
      });
      const data = await apiRequest(`/notes?${query.toString()}`);
      setNotes(data.data || []);
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, viewAll, user.role]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreateLoading(true);
    try {
      await apiRequest('/notes', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      setNewTitle('');
      setNewContent('');
      setSuccess('Note created successfully!');
      fetchNotes();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const startEdit = (note) => {
    setEditingNoteId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleUpdate = async (noteId) => {
    setError('');
    setSuccess('');
    try {
      await apiRequest(`/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      setSuccess('Note updated successfully!');
      cancelEdit();
      fetchNotes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    setError('');
    setSuccess('');
    try {
      await apiRequest(`/notes/${noteId}`, {
        method: 'DELETE',
      });
      setSuccess('Note deleted successfully!');
      fetchNotes();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="notes-container">
      {/* Header and Controls */}
      <div className="section-header">
        <div>
          <h2>Notes</h2>
          <p className="subtitle">
            {viewAll
              ? "Showing notes from all users across the platform (Admin privilege)"
              : 'Your private, personal notes'}
          </p>
        </div>

        {user.role === 'admin' && (
          <div className="toggle-admin-notes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={viewAll}
                onChange={(e) => {
                  setViewAll(e.target.checked);
                  setPage(1);
                }}
              />
              <span>View everyone's notes</span>
            </label>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Create Note Card */}
      <div className="card note-create-card">
        <h3>Write a Note</h3>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Note title..."
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Write your note here..."
              rows="3"
              required
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={createLoading}>
            <IconPlus size={15} /> {createLoading ? 'Saving...' : 'Save Note'}
          </button>
        </form>
      </div>

      {/* Notes List */}
      <div className="notes-list-header" style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>
        <h3>
          {viewAll ? 'All Notes' : 'My Notes'}{' '}
          <span className="badge badge-accent">Total: {pagination.totalCount}</span>
        </h3>
      </div>

      {loading ? (
        <p className="loading-text">Loading notes...</p>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <p>No notes found. Create your first note above!</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => {
            const isOwner = note.owner?._id === user._id || note.owner === user._id;
            const isEditing = editingNoteId === note._id;

            return (
              <div key={note._id} className="note-card">
                {isEditing ? (
                  <div className="note-edit-form">
                    <input
                      type="text"
                      className="edit-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea
                      rows="4"
                      className="edit-textarea"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    ></textarea>
                    <div className="note-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(note._id)}>
                        <IconCheck size={14} /> Save
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="note-top">
                      <h4 className="note-title">{note.title}</h4>
                      {viewAll && note.owner && (
                        <span className="note-author-tag">
                          Owner: {note.owner.username || 'User'}
                        </span>
                      )}
                    </div>
                    <p className="note-content">{note.content}</p>
                    <div className="note-footer">
                      <span className="note-date">
                        {formatNoteDate(note.createdAt)}
                      </span>
                      <div className="note-actions">
                        {(isOwner || user.role === 'admin') && (
                          <>
                            <button
                              type="button"
                              className="note-action-btn"
                              onClick={() => startEdit(note)}
                              title="Edit note"
                            >
                              <IconEdit size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              className="note-action-btn note-action-btn-danger"
                              onClick={() => handleDelete(note._id)}
                              title="Delete note"
                            >
                              <IconTrash size={13} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
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
  );
}
