import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiRequest } from '../api/client';
import { IconPlus, IconFilter, IconClose } from './Icons';

export default function Posts({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cached authors list across all posts
  const [knownAuthorsMap, setKnownAuthorsMap] = useState({});

  // Post creation form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  // Aggregation $lookup filter state
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [aggregationInfo, setAggregationInfo] = useState(null);

  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/posts?page=${page}&limit=6`);
      const fetchedPosts = data.data || [];
      setPosts(fetchedPosts);
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 });
      setAggregationInfo(null);

      // Extract and cache distinct authors for the filter dropdown
      setKnownAuthorsMap((prev) => {
        const next = { ...prev };
        fetchedPosts.forEach((p) => {
          const a = p.authorDetails || p.author;
          if (a && a._id && a.username) {
            next[String(a._id)] = a.username;
          }
        });
        return next;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchUserPostsViaLookup = async (userId, authorName = '') => {
    setLoading(true);
    setError('');
    setSelectedUserId(userId);
    try {
      const data = await apiRequest(`/aggregations/user-posts/${userId}`);
      const authorPosts = data.posts || [];
      setPosts(authorPosts);
      
      const resolvedName =
        authorName ||
        knownAuthorsMap[String(userId)] ||
        (authorPosts[0]?.authorDetails?.username) ||
        'Selected Author';

      setAggregationInfo({
        scenario: data.scenario,
        count: data.count,
        userId: data.userId,
        authorName: resolvedName,
      });

      // Also ensure this author is recorded
      if (resolvedName && resolvedName !== 'Selected Author') {
        setKnownAuthorsMap((prev) => ({ ...prev, [String(userId)]: resolvedName }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedUserId) {
      fetchAllPosts();
    }
  }, [fetchAllPosts, selectedUserId]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPostLoading(true);
    try {
      await apiRequest('/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });
      setTitle('');
      setContent('');
      setSuccess('Post published successfully!');
      setSelectedUserId(null);
      fetchAllPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setPostLoading(false);
    }
  };

  const handleResetFilter = () => {
    setSelectedUserId(null);
    setAggregationInfo(null);
    fetchAllPosts();
  };

  const authorOptions = useMemo(() => {
    return Object.entries(knownAuthorsMap).map(([id, name]) => ({ id, name }));
  }, [knownAuthorsMap]);

  return (
    <div className="posts-container">
      <div className="section-header">
        <div>
          <h2>Community Notes</h2>
          <p className="subtitle">
            Shared notes and updates published across the community. Filter by author to view a specific user's posts.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Write Note / Post Card */}
      <div className="card note-create-card">
        <h3>Share a Note</h3>
        <form onSubmit={handleCreatePost}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Note title..."
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="What would you like to share?"
              rows="3"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={postLoading}>
            <IconPlus size={15} /> {postLoading ? 'Publishing...' : 'Publish Note'}
          </button>
        </form>
      </div>

      {/* Toolbar with Author Filter (Appropriately Placed in Header) */}
      <div className="posts-toolbar">
        <div className="posts-toolbar-left">
          <h3>
            {selectedUserId ? "Author's Notes" : 'All Notes'}{' '}
            <span className="badge badge-accent">
              Total: {aggregationInfo ? aggregationInfo.count : pagination.totalCount}
            </span>
          </h3>
        </div>

        <div className="posts-toolbar-right">
          <div className="author-filter-control">
            <label htmlFor="author-select" className="filter-label">
              <IconFilter size={13} /> Filter:
            </label>
            <select
              id="author-select"
              className="author-select-dropdown"
              value={selectedUserId || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const author = authorOptions.find((a) => a.id === val);
                  fetchUserPostsViaLookup(val, author?.name);
                } else {
                  handleResetFilter();
                }
              }}
            >
              <option value="">All Authors</option>
              {authorOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Bar (Clean pill & clear action) */}
      {aggregationInfo && (
        <div className="active-filter-bar">
          <div className="filter-chip">
            <span>Author: <strong>{aggregationInfo.authorName}</strong></span>
            <button
              className="filter-clear-btn"
              onClick={handleResetFilter}
              title="Clear author filter"
            >
              <IconClose size={12} />
            </button>
          </div>
          <span className="filter-meta-tag">
            Showing {aggregationInfo.count} note{aggregationInfo.count === 1 ? '' : 's'} via Scenario 2 ($lookup)
          </span>
        </div>
      )}

      {/* Posts Grid */}
      {loading ? (
        <p className="loading-text">Loading notes...</p>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>No notes found.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {posts.map((post) => {
            const author = post.authorDetails || post.author || {};
            const authorId = author._id || post.author;
            const authorName = author.username || 'Author';

            return (
              <div key={post._id} className="note-card">
                <div className="note-top">
                  <h4 className="note-title">{post.title}</h4>
                  {authorId && (
                    <button
                      type="button"
                      className="note-author-byline"
                      onClick={() => fetchUserPostsViaLookup(authorId, authorName)}
                      title={`Filter notes by ${authorName}`}
                    >
                      By {authorName}
                    </button>
                  )}
                </div>
                <p className="note-content">{post.content}</p>
                <div className="note-footer">
                  <small className="note-date">
                    {new Date(post.createdAt).toLocaleString()}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!selectedUserId && pagination.totalPages > 1 && (
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
