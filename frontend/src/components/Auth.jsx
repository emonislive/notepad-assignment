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

  const handleQuickLogin = (email, password) => {
    setFormData((prev) => ({ ...prev, email, password }));
    doLogin(email, password);
  };

  const doLogin = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isRegister) {
      return doLogin(formData.email, formData.password);
    }

    setError('');
    setLoading(true);
    try {
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <div className="auth-header">
        <h2>{isRegister ? 'Create an account' : 'Welcome back'}</h2>
        <p className="subtitle">
          {isRegister
            ? 'Enter your details to create your secure notes account'
            : 'Enter your credentials to access your workspace'}
        </p>
      </div>

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
          <label>Email address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
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
            placeholder="••••••••"
          />
        </div>

        {isRegister && (
          <>
            <div className="form-group">
              <label>Account Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">User (Standard Access)</option>
                <option value="admin">Admin (Manage Users & View All Notes)</option>
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
              <span className="help-text">Used for Aggregation Scenario 1 (group by interests)</span>
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      {!isRegister && (
        <div className="quick-login-section">
          <div className="divider">
            <span>Or test with sample account</span>
          </div>
          <div className="quick-login-buttons">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('admin@example.com', 'password123')}
            >
              Sign in as Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('alice@example.com', 'password123')}
            >
              Sign in as Alice (User)
            </button>
          </div>
        </div>
      )}

      <div className="auth-toggle">
        {isRegister ? (
          <p>
            Already have an account?{' '}
            <button type="button" className="btn-link" onClick={() => setIsRegister(false)}>
              Sign in
            </button>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <button type="button" className="btn-link" onClick={() => setIsRegister(true)}>
              Register
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
