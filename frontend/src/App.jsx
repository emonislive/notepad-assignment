import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Notes from './components/Notes';
import AdminUsers from './components/AdminUsers';
import Posts from './components/Posts';
import Aggregations from './components/Aggregations';
import TaskShowcase from './components/TaskShowcase';
import { IconNotes, IconPosts, IconInterests, IconUsers, IconShowcase, IconClose, IconLogout } from './components/Icons';
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
      {/* Top Navbar */}
      <header className="app-navbar">
        <div className="navbar-brand">
          <div className="brand-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="brand-title-group">
            <span className="brand-title">Secure Notes</span>
            <span className="version-badge">Assessment</span>
          </div>
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className={`btn btn-sm ${showcaseOpen ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowcaseOpen(!showcaseOpen)}
          >
            {showcaseOpen ? (
              <>
                <IconClose size={14} /> Close Showcase
              </>
            ) : (
              <>
                <IconShowcase size={14} /> Task Showcase &amp; Process
              </>
            )}
          </button>

          {user && (
            <div className="user-account-chip">
              <div className="user-avatar-pill">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-meta-stack">
                <span className="user-account-name">{user.username}</span>
                <span className="user-account-email">{user.email}</span>
              </div>
              <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                {user.role}
              </span>
              <button
                type="button"
                className="user-logout-btn"
                onClick={handleLogout}
                title="Log out of account"
              >
                <IconLogout size={14} />
                <span>Logout</span>
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
                <IconNotes size={16} /> My Notes
              </button>
              <button
                className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                <IconPosts size={16} /> Community Posts
              </button>
              <button
                className={`tab-btn ${activeTab === 'aggregations' ? 'active' : ''}`}
                onClick={() => setActiveTab('aggregations')}
              >
                <IconInterests size={16} /> Explore Interests
              </button>
              {user.role === 'admin' && (
                <button
                  className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admin')}
                >
                  <IconUsers size={16} /> Manage Users
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
    </div>
  );
}
