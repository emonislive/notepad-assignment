import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Notes from './components/Notes';
import AdminUsers from './components/AdminUsers';
import Posts from './components/Posts';
import Aggregations from './components/Aggregations';
import { apiRequest } from './api/client';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [activeTab, setActiveTab] = useState('notes');
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
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setActiveTab('notes');
  };

  if (initializing) {
    return (
      <div className="init-screen">
        <p>Initializing Secure Notes application...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-brand">
          <h1>Secure Note-Taking Platform</h1>
          <span className="app-subtitle">REST API &bull; RBAC &bull; MongoDB Indexing &bull; Aggregations</span>
        </div>

        {user && (
          <div className="user-profile-header">
            <div className="user-details">
              <span className="username">{user.username}</span>
              <span className="user-email">{user.email}</span>
              <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
            <button className="btn btn-sm btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {!user ? (
          <Auth onLogin={handleLogin} />
        ) : (
          <>
            {/* Navigation Tabs */}
            <nav className="tab-nav">
              <button
                className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                Notes
              </button>
              <button
                className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                Community Posts ($lookup)
              </button>
              <button
                className={`tab-btn ${activeTab === 'aggregations' ? 'active' : ''}`}
                onClick={() => setActiveTab('aggregations')}
              >
                Interests Aggregation
              </button>
              {user.role === 'admin' && (
                <button
                  className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admin')}
                >
                  Admin: User Management
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

      {/* Minimal Footer */}
      <footer className="app-footer">
        <p>Technical Assessment: Secure Note-Taking Application &bull; MongoDB + Mongoose &bull; JWT Authentication</p>
      </footer>
    </div>
  );
}
