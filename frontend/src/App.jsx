import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Notes from './components/Notes';
import AdminUsers from './components/AdminUsers';
import Posts from './components/Posts';
import Aggregations from './components/Aggregations';
import TaskShowcase from './components/TaskShowcase';
import { apiRequest } from './api/client';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [activeTab, setActiveTab] = useState('notes');
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const data = await apiRequest('/auth/me');
          setUser(data.user);
          setToken(storedToken);
        } catch (err) {
          console.error('Session expired or invalid:', err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setInitializing(false);
    };

    initAuth();
  }, []);

  const handleLogin = (loggedUser, authToken) => {
    setUser(loggedUser);
    setToken(authToken);
    setActiveTab('notes');
    setShowcaseOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setActiveTab('notes');
    setShowcaseOpen(false);
  };

  if (initializing) {
    return (
      <div className="init-screen">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-title-row">
            <h1>Secure Notes</h1>
            <span className="version-badge">Backend Assessment</span>
          </div>
          <span className="app-subtitle">
            Private note-taking with role-based security, optimized indexing, and MongoDB aggregations.
          </span>
        </div>

        <div className="header-actions">
          <button
            className={`btn btn-sm ${showcaseOpen ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowcaseOpen(!showcaseOpen)}
          >
            {showcaseOpen ? '✕ Close Showcase' : '✨ Process & Task Showcase'}
          </button>

          {user && (
            <div className="user-profile-header">
              <div className="user-details">
                <span className="username">{user.username}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                {user.role}
              </span>
              <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {showcaseOpen ? (
          <TaskShowcase />
        ) : !user ? (
          <Auth onLogin={handleLogin} />
        ) : (
          <>
            {/* Navigation Tabs */}
            <nav className="tab-nav">
              <button
                className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                My Notes
              </button>
              <button
                className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                Community Posts
              </button>
              <button
                className={`tab-btn ${activeTab === 'aggregations' ? 'active' : ''}`}
                onClick={() => setActiveTab('aggregations')}
              >
                Explore Interests
              </button>
              {user.role === 'admin' && (
                <button
                  className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admin')}
                >
                  Manage Users
                </button>
              )}
            </nav>

            {/* Tab Views */}
            <div className="tab-content">
              {activeTab === 'notes' && <Notes user={user} />}
              {activeTab === 'posts' && <Posts currentUser={user} />}
              {activeTab === 'aggregations' && <Aggregations />}
              {activeTab === 'admin' && user.role === 'admin' && <AdminUsers currentUser={user} />}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Technical Interview Task &bull; Built with Node.js, Express, MongoDB with Mongoose, and React.
        </p>
      </footer>
    </div>
  );
}
