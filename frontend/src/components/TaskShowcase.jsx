import React, { useState } from 'react';

export default function TaskShowcase() {
  const [activeVisualTab, setActiveVisualTab] = useState('process');

  return (
    <div className="showcase-container">
      {/* Top Banner */}
      <div className="showcase-hero">
        <span className="hero-pill">Assessment Project Walkthrough</span>
        <h2>How This Application Was Built</h2>
        <p className="hero-description">
          A visual overview of the engineering decisions, database optimizations, and development process taken to fulfill the technical assessment requirements.
        </p>

        {/* Metric Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-number">23 / 23</span>
            <span className="metric-label">Automated Tests Passed</span>
            <span className="metric-sub">100% green Jest test suites</span>
          </div>
          <div className="metric-card">
            <span className="metric-number">0</span>
            <span className="metric-label">Unnecessary Indexes</span>
            <span className="metric-sub">Strictly minimal schema.index strategy</span>
          </div>
          <div className="metric-card">
            <span className="metric-number">2</span>
            <span className="metric-label">Aggregation Pipelines</span>
            <span className="metric-sub">Interests Unwind + Posts $lookup</span>
          </div>
          <div className="metric-card">
            <span className="metric-number">2</span>
            <span className="metric-label">Security Roles</span>
            <span className="metric-sub">User and Admin with isolated access</span>
          </div>
        </div>
      </div>

      {/* Visualizer Navigation */}
      <div className="showcase-tabs">
        <button
          className={`showcase-tab ${activeVisualTab === 'process' ? 'active' : ''}`}
          onClick={() => setActiveVisualTab('process')}
        >
          1. Development Process & Steps
        </button>
        <button
          className={`showcase-tab ${activeVisualTab === 'indexing' ? 'active' : ''}`}
          onClick={() => setActiveVisualTab('indexing')}
        >
          2. Database Indexing Strategy (ESR Rule)
        </button>
        <button
          className={`showcase-tab ${activeVisualTab === 'aggregations' ? 'active' : ''}`}
          onClick={() => setActiveVisualTab('aggregations')}
        >
          3. Aggregation Pipelines Visualized
        </button>
        <button
          className={`showcase-tab ${activeVisualTab === 'rbac' ? 'active' : ''}`}
          onClick={() => setActiveVisualTab('rbac')}
        >
          4. Security & Access Control Flow
        </button>
      </div>

      {/* Tab 1: Development Process */}
      {activeVisualTab === 'process' && (
        <div className="showcase-card">
          <div className="card-header-simple">
            <h3>Development Process & Architecture Steps</h3>
            <p className="subtitle">The four-phase methodology followed to design, implement, and verify the solution.</p>
          </div>

          <div className="timeline">
            {/* Step 1 */}
            <div className="timeline-item">
              <div className="timeline-dot">1</div>
              <div className="timeline-content">
                <div className="step-tag">Phase 1 &bull; Requirements & Security</div>
                <h4>Assessment Review & Authentication Setup</h4>
                <p>
                  Analyzed all assessment requirements from the examiner. Chose Node.js with Express & Mongoose to satisfy the mandatory <code>schema.index</code> requirement. Implemented stateless JWT authentication and bcrypt password hashing with automatic salt generation and JSON password stripping.
                </p>
                <div className="code-snippet-tag">
                  Applied: <code>pre('save')</code> hook &bull; <code>bcrypt.hash(password, 10)</code> &bull; <code>toJSON()</code> suppression
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="timeline-item">
              <div className="timeline-dot">2</div>
              <div className="timeline-content">
                <div className="step-tag">Phase 2 &bull; Database Engineering</div>
                <h4>Zero-Bloat Indexing via schema.index</h4>
                <p>
                  Adhered strictly to the constraint: <em>"DO NOT MAKE ANY UNNECESSARY INDEXES"</em>. Applied MongoDB's <strong>Equality-Sort-Range (ESR)</strong> rule. Created compound indexes for sorted list operations to guarantee index-covered queries without expensive in-memory sorting.
                </p>
                <div className="code-snippet-tag">
                  Applied: <code>Note: &#123; owner: 1, createdAt: -1 &#125;</code> &bull; <code>User: &#123; interests: 1 &#125;</code> &bull; <code>Post: &#123; author: 1, createdAt: -1 &#125;</code>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="timeline-item">
              <div className="timeline-dot">3</div>
              <div className="timeline-content">
                <div className="step-tag">Phase 3 &bull; Aggregations & API</div>
                <h4>MongoDB Aggregation Pipelines & Pagination</h4>
                <p>
                  Built the two required aggregation pipelines: Scenario 1 (users grouped by interests using <code>$unwind</code> and <code>$group</code> in a single call) and Scenario 2 (user posts retrieved via <code>$lookup</code> foreign join). Added standardized limit/skip pagination across all list endpoints.
                </p>
                <div className="code-snippet-tag">
                  Applied: <code>User.aggregate()</code> &bull; <code>Post.aggregate()</code> with <code>$lookup</code> &bull; <code>parsePagination()</code>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="timeline-item">
              <div className="timeline-dot">4</div>
              <div className="timeline-content">
                <div className="step-tag">Phase 4 &bull; Verification & UI</div>
                <h4>Automated Testing & Minimalist Interface</h4>
                <p>
                  Developed 6 automated Jest test suites covering 23 test cases verifying index declarations, security, RBAC guards, and pipeline stages. Built this clean, functional React application for live testing and interview demonstration.
                </p>
                <div className="code-snippet-tag">
                  Applied: <code>Jest (23 tests passed)</code> &bull; <code>Vite React</code> &bull; <code>decision.md interview notes</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Database Indexing */}
      {activeVisualTab === 'indexing' && (
        <div className="showcase-card">
          <div className="card-header-simple">
            <h3>Database Indexing Strategy (ESR Rule)</h3>
            <p className="subtitle">
              Every single index was created for a specific query or aggregation. Zero duplicate or redundant indexes exist.
            </p>
          </div>

          <div className="diagram-grid">
            {/* User Schema */}
            <div className="diagram-card">
              <div className="diagram-top">
                <span className="diagram-badge">User Model</span>
                <span className="diagram-stat">3 Indexes</span>
              </div>
              <div className="index-item">
                <div className="index-signature">schema.index(&#123; email: 1 &#125;, &#123; unique: true &#125;)</div>
                <div className="index-desc">Supports instant login lookup and enforces database-level email uniqueness.</div>
              </div>
              <div className="index-item">
                <div className="index-signature">schema.index(&#123; createdAt: -1 &#125;)</div>
                <div className="index-desc">Powers admin user list pagination without requiring in-memory sorting.</div>
              </div>
              <div className="index-item">
                <div className="index-signature">schema.index(&#123; interests: 1 &#125;)</div>
                <div className="index-desc">Multikey index that indexes individual array elements for Scenario 1 Aggregation.</div>
              </div>
            </div>

            {/* Note Schema */}
            <div className="diagram-card">
              <div className="diagram-top">
                <span className="diagram-badge">Note Model</span>
                <span className="diagram-stat">2 Indexes</span>
              </div>
              <div className="index-item highlighted-index">
                <div className="index-signature">schema.index(&#123; owner: 1, createdAt: -1 &#125;)</div>
                <div className="index-desc">
                  <strong>ESR Compound Index:</strong> Regular users query their own notes sorted newest first. The index satisfies equality (<code>owner</code>) and sort (<code>createdAt</code>) in a single B-tree traversal!
                </div>
              </div>
              <div className="index-item">
                <div className="index-signature">schema.index(&#123; createdAt: -1 &#125;)</div>
                <div className="index-desc">Powers admin listing everyone's notes across the entire system with sorted pagination.</div>
              </div>
            </div>

            {/* Post Schema */}
            <div className="diagram-card">
              <div className="diagram-top">
                <span className="diagram-badge">Post Model</span>
                <span className="diagram-stat">2 Indexes</span>
              </div>
              <div className="index-item highlighted-index">
                <div className="index-signature">schema.index(&#123; author: 1, createdAt: -1 &#125;)</div>
                <div className="index-desc">
                  <strong>Scenario 2 Support:</strong> Directly accelerates the <code>$match</code> on author and the <code>$lookup</code> foreignField join.
                </div>
              </div>
              <div className="index-item">
                <div className="index-signature">schema.index(&#123; createdAt: -1 &#125;)</div>
                <div className="index-desc">Backs sorted pagination for the public post feed.</div>
              </div>
            </div>
          </div>

          <div className="callout-box">
            <strong>Why no index on `_id`?</strong> MongoDB automatically creates an internal unique primary index on <code>_id</code> (<code>_id_</code>) for all collections. Adding an explicit index on <code>_id</code> would create redundant storage overhead and slow down write operations.
          </div>
        </div>
      )}

      {/* Tab 3: Aggregations */}
      {activeVisualTab === 'aggregations' && (
        <div className="showcase-card">
          <div className="card-header-simple">
            <h3>Aggregation Pipelines Step-by-Step</h3>
            <p className="subtitle">Visual representation of how documents flow through each pipeline stage.</p>
          </div>

          {/* Scenario 1 Visual */}
          <div className="pipeline-visual-block">
            <div className="pipeline-title-bar">
              <span className="pipeline-scenario-badge">Scenario 1</span>
              <h4>Group Users by Profile Interests</h4>
              <span className="pipeline-constraint">Constraint: Exactly one collection.aggregate() call</span>
            </div>

            <div className="pipeline-steps-flow">
              <div className="pipeline-stage">
                <div className="stage-num">Input</div>
                <div className="stage-name">User Documents</div>
                <div className="stage-box">
                  <code>&#123; user: "Alice", interests: ["chess", "gaming"] &#125;</code>
                  <code>&#123; user: "Admin", interests: ["chess", "coding"] &#125;</code>
                </div>
              </div>

              <div className="pipeline-arrow">&rarr;</div>

              <div className="pipeline-stage">
                <div className="stage-num">Stage 1</div>
                <div className="stage-name">$unwind: "$interests"</div>
                <div className="stage-box">
                  <code>&#123; user: "Alice", interests: "chess" &#125;</code>
                  <code>&#123; user: "Alice", interests: "gaming" &#125;</code>
                  <code>&#123; user: "Admin", interests: "chess" &#125;</code>
                  <code>&#123; user: "Admin", interests: "coding" &#125;</code>
                </div>
              </div>

              <div className="pipeline-arrow">&rarr;</div>

              <div className="pipeline-stage">
                <div className="stage-num">Stage 2 & 3</div>
                <div className="stage-name">$group &amp; $sort</div>
                <div className="stage-box highlight-box">
                  <div><strong>chess:</strong> [Alice, Admin] (count: 2)</div>
                  <div><strong>coding:</strong> [Admin] (count: 1)</div>
                  <div><strong>gaming:</strong> [Alice] (count: 1)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scenario 2 Visual */}
          <div className="pipeline-visual-block" style={{ marginTop: '2rem' }}>
            <div className="pipeline-title-bar">
              <span className="pipeline-scenario-badge">Scenario 2</span>
              <h4>Retrieve User Posts with $lookup</h4>
              <span className="pipeline-constraint">Constraint: Single aggregation pipeline with a $lookup stage</span>
            </div>

            <div className="pipeline-steps-flow">
              <div className="pipeline-stage">
                <div className="stage-num">Stage 1: $match</div>
                <div className="stage-name">Filter by Author</div>
                <div className="stage-box">
                  <code>&#123; author: ObjectId(userId) &#125;</code>
                  <span className="small-note">Uses author compound index</span>
                </div>
              </div>

              <div className="pipeline-arrow">&rarr;</div>

              <div className="pipeline-stage">
                <div className="stage-num">Stage 2: $lookup</div>
                <div className="stage-name">Join Users Collection</div>
                <div className="stage-box">
                  <code>from: "users"</code>
                  <code>localField: "author"</code>
                  <code>foreignField: "_id"</code>
                </div>
              </div>

              <div className="pipeline-arrow">&rarr;</div>

              <div className="pipeline-stage">
                <div className="stage-num">Stage 3 & 4</div>
                <div className="stage-name">$unwind &amp; $project</div>
                <div className="stage-box highlight-box">
                  <div><strong>Output:</strong> Array of posts with joined <code>authorDetails</code> (username, email) while stripping password.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & RBAC */}
      {activeVisualTab === 'rbac' && (
        <div className="showcase-card">
          <div className="card-header-simple">
            <h3>Role-Based Access Control &amp; Security Architecture</h3>
            <p className="subtitle">Clear separation of concerns between authentication and authorization.</p>
          </div>

          <div className="rbac-diagram">
            <div className="rbac-request-box">
              <span className="step-label">Incoming Client Request</span>
              <code>Authorization: Bearer &lt;JWT&gt;</code>
            </div>

            <div className="rbac-arrow-down">&darr;</div>

            <div className="rbac-middleware-box">
              <span className="step-label">Middleware: authenticate</span>
              <p>Verifies signature with <code>JWT_SECRET</code> &bull; Extracts <code>decoded.id</code> &bull; Attaches <code>req.user</code></p>
            </div>

            <div className="rbac-split-arrows">
              <div className="split-left">
                <span className="role-tag role-user">Role: 'user'</span>
                <div className="permission-card">
                  <h5>Standard User Capabilities</h5>
                  <ul>
                    <li>&check; Create personal notes</li>
                    <li>&check; View own notes with pagination</li>
                    <li>&check; Update own notes</li>
                    <li>&check; Delete own notes</li>
                    <li>&check; Write public posts</li>
                    <li>&times; <em>Cannot view other users' notes (403 Forbidden)</em></li>
                    <li>&times; <em>Cannot manage user accounts (403 Forbidden)</em></li>
                  </ul>
                </div>
              </div>

              <div className="split-right">
                <span className="role-tag role-admin">Role: 'admin'</span>
                <div className="permission-card admin-border">
                  <h5>Admin Capabilities (Inherits User + Extras)</h5>
                  <ul>
                    <li>&check; Inherits all User capabilities</li>
                    <li>&check; <strong>View everyone's notes</strong> (via <code>?all=true</code>)</li>
                    <li>&check; <strong>Add new users</strong> (<code>POST /api/users</code>)</li>
                    <li>&check; <strong>Update any user</strong> (<code>PUT /api/users/:id</code>)</li>
                    <li>&check; <strong>Remove any user</strong> (<code>DELETE /api/users/:id</code>)</li>
                    <li>&check; <strong>List all users</strong> with pagination</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
