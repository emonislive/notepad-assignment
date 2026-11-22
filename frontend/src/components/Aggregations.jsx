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
          <h2>Aggregation Scenario 1: Group by Interests</h2>
          <p className="subtitle">
            Displays all users grouped by their profile interests using a single <code>collection.aggregate()</code> pipeline ($unwind &rarr; $group &rarr; $sort).
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchInterestGroups} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Aggregation'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="pipeline-info card">
        <h4>Pipeline Details</h4>
        <p><strong>Query Execution:</strong> Single <code>User.aggregate()</code> call</p>
        <p><strong>Stages:</strong> <code>$unwind: '$interests'</code> &rarr; <code>$group: &#123; _id: '$interests', count: &#123; $sum: 1 &#125;, users: &#123; $push: ... &#125; &#125;</code> &rarr; <code>$sort: &#123; _id: 1 &#125;</code></p>
        <p><strong>Supporting Index:</strong> <code>userSchema.index(&#123; interests: 1 &#125;)</code> (multikey index)</p>
        <p><strong>Distinct Interests Found:</strong> <span className="badge">{totalInterests}</span></p>
      </div>

      {loading ? (
        <p className="loading-text">Executing aggregation pipeline...</p>
      ) : data.length === 0 ? (
        <div className="empty-state">
          <p>No interests found across user profiles. Add users with interests in the Admin tab or during registration!</p>
        </div>
      ) : (
        <div className="interests-grid">
          {data.map((group) => (
            <div key={group._id} className="card interest-card">
              <div className="interest-header">
                <span className="interest-title">{group._id}</span>
                <span className="badge badge-count">{group.count} {group.count === 1 ? 'user' : 'users'}</span>
              </div>
              <div className="interest-users-list">
                <h5>Users with this interest:</h5>
                <ul>
                  {group.users.map((u) => (
                    <li key={u._id} className="interest-user-item">
                      <strong>{u.username}</strong> ({u.email})
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`} style={{ marginLeft: '8px' }}>
                        {u.role}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
