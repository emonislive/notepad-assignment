import React, { useState } from 'react';
import { apiRequest } from '../api/client';

export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    interests: 'chess, reading',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          interests: formData.interests
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        };
        const data = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user, data.token);
      } else {
        const payload = {
          email: formData.email,
          password: formData.password,
        };
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user, data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h2>{isRegister ? 'Create Account' : 'Sign In'}</h2>
      <p className="subtitle">
        {isRegister
          ? 'Register to create and manage your secure notes'
          : 'Enter your credentials to access your notes'}
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. John Doe"
            />
          </div>
        )}

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. user@example.com"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
          />
        </div>

        {isRegister && (
          <>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">User (Standard Access)</option>
                <option value="admin">Admin (Full User & Note Management)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Interests (comma separated)</label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="e.g. chess, reading, coding"
              />
              <small className="help-text">Used for Aggregation Scenario 1 (group by interests)</small>
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
        </button>
      </form>

      <div className="auth-toggle">
        {isRegister ? (
          <p>
            Already have an account?{' '}
            <button type="button" className="btn-link" onClick={() => setIsRegister(false)}>
              Sign In here
            </button>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <button type="button" className="btn-link" onClick={() => setIsRegister(true)}>
              Register here
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
