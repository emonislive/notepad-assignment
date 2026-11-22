import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

export default function Aggregations() {
  const [data, setData] = useState([]);
  const [totalInterests, setTotalInterests] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInterestGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequest('/aggregations/group-by-interests');
      setData(response.data || []);
      setTotalInterests(response.totalInterests || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterestGroups();
  }, []);

  return (
    <div className="aggregations-container">
      <div className="section-header">
        <div>
          <h2>Explore by Interests</h2>
          <p className="subtitle">
            Users grouped by shared profile interests (e.g. chess, reading, coding). Generated using a single MongoDB <code>collection.aggregate()</code> pipeline.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchInterestGroups} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="pipeline-info card">
        <div className="pipeline-header-row">
          <h4>MongoDB Aggregation Pipeline</h4>
          <span className="badge">{totalInterests} Distinct Interests</span>
        </div>
        <p className="pipeline-stage-text">
          <code>$unwind: '$interests'</code> &rarr; <code>$group: &#123; _id: '$interests', count: &#123; $sum: 1 &#125;, users: &#123; $push: ... &#125; &#125;</code> &rarr; <code>$sort: &#123; _id: 1 &#125;</code>
        </p>
        <div className="pipeline-meta">
          <span>Supported by multikey index: <code>userSchema.index(&#123; interests: 1 &#125;)</code></span>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Executing aggregation pipeline...</p>
      ) : data.length === 0 ? (
        <div className="empty-state">
          <p>No interests found across user profiles. Add users with interests in the Admin tab or during registration.</p>
        </div>
      ) : (
        <div className="interests-grid">
          {data.map((group) => (
            <div key={group._id} className="interest-card">
              <div className="interest-header">
                <h3 className="interest-title">{group._id}</h3>
                <span className="badge badge-count">
                  {group.count} {group.count === 1 ? 'member' : 'members'}
                </span>
              </div>
              <div className="interest-users-list">
                <span className="interest-users-label">Users with this interest</span>
                <div className="interest-users-group">
                  {group.users.map((u) => (
                    <div key={u._id} className="interest-user-item">
                      <div className="user-avatar-initial">
                        {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="user-info-column">
                        <span className="user-name">{u.username}</span>
                        <span className="user-email-muted">{u.email}</span>
                      </div>
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
