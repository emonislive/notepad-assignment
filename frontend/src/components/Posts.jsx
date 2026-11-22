import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api/client';
import { IconPlus, IconInterests } from './Icons';

export default function Posts({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Post form
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
      setPosts(data.data || []);
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 });
      setAggregationInfo(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchUserPostsViaLookup = async (userId) => {
    setLoading(true);
    setError('');
    setSelectedUserId(userId);
    try {
      const data = await apiRequest(`/aggregations/user-posts/${userId}`);
      setPosts(data.posts || []);
      setAggregationInfo({
        scenario: data.scenario,
        count: data.count,
        userId: data.userId,
      });
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

  return (
    <div className="posts-container">
      <div className="section-header">
        <div>
          <h2>Community Posts</h2>
          <p className="subtitle">
            Public notes and updates shared by users. Demonstrates MongoDB <code>$lookup</code> aggregation by filtering posts by author.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Write Post Card */}
      <div className="card">
        <h3>Share a Post</h3>
        <form onSubmit={handleCreatePost}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Post title..."
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
            <IconPlus size={15} /> {postLoading ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </div>

      {/* Aggregation Mode Banner */}
      {aggregationInfo && (
        <div className="alert alert-info" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Aggregation Active:</strong> {aggregationInfo.scenario}
            <div>Showing {aggregationInfo.count} post(s) for user ID: <code>{aggregationInfo.userId}</code></div>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={handleResetFilter}>
            Show All Posts
          </button>
        </div>
      )}

      {/* Posts Grid */}
      <div className="notes-list-header" style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>
        <h3>
          {selectedUserId ? "Author's Filtered Posts" : 'All Posts'}{' '}
          <span className="badge badge-accent">
            Total: {aggregationInfo ? aggregationInfo.count : pagination.totalCount}
          </span>
        </h3>
      </div>

      {loading ? (
        <p className="loading-text">Loading posts...</p>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>No posts found.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {posts.map((post) => {
            const author = post.authorDetails || post.author || {};
            const authorId = author._id || post.author;

            return (
              <div key={post._id} className="note-card">
                <div className="note-top">
                  <h4 className="note-title">{post.title}</h4>
                  <span className="note-author-tag">
                    By: {author.username || 'Author'}
                  </span>
                </div>
                <p className="note-content">{post.content}</p>
                <div className="note-footer">
                  <small className="note-date">
                    {new Date(post.createdAt).toLocaleString()}
                  </small>
                  {authorId && (
                    <button
                      className="btn btn-sm btn-outline"
                      title="Run Aggregation Scenario 2 ($lookup)"
                      onClick={() => fetchUserPostsViaLookup(authorId)}
                    >
                      <IconInterests size={13} /> Filter by Author ($lookup)
                    </button>
                  )}
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
