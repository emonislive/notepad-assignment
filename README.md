# Secure Notes Application

A clean, secure note-taking REST API and modern frontend built for the **Backend Developer Technical Assessment**. The project demonstrates secure authentication, role-based access control, zero-bloat database indexing, and MongoDB aggregation pipelines.

---

## Visual Task Showcase & Engineering Process

### 1. The 4-Step Engineering Process

```
[ Phase 1: Requirements & Security ]
  │ • Detailed review of examiner instructions
  │ • Implemented stateless JWT token authentication
  │ • Configured bcrypt password hashing with automatic salt & JSON suppression
  ▼
[ Phase 2: Database Modeling & Zero-Bloat Indexing ]
  │ • Modeled User, Note, and Post collections in Mongoose
  │ • Applied MongoDB's Equality-Sort-Range (ESR) rule
  │ • Defined all indexes visibly using schema.index()
  │ • Guaranteed 0 unnecessary and 0 duplicate indexes
  ▼
[ Phase 3: Aggregation Pipelines & Pagination ]
  │ • Scenario 1: Users grouped by interests via single collection.aggregate()
  │ • Scenario 2: User posts retrieved via single pipeline with $lookup stage
  │ • Built reusable pagination utility across all list operations
  ▼
[ Phase 4: Verification, Automated Testing & UI ]
  │ • Developed 6 Jest test suites (23/23 tests passed, 100% green)
  │ • Built minimalist, modern React client for visual demonstration
  │ • Created decision.md with interview questions and answers
```

---

### 2. System Architecture & Request Flow

```
                      +---------------------------------------+
                      |       React Frontend (Port 3000)       |
                      |  (Notes, Posts, Interests, Showcase)  |
                      +-------------------+-------------------+
                                          |
                                          | HTTP / JSON Requests
                                          v
                      +---------------------------------------+
                      |      Express Backend (Port 5000)      |
                      +-------------------+-------------------+
                                          |
                                          v
                              [ authenticate Middleware ]
                                          |
                       +------------------+------------------+
                       |                                     |
                Valid Bearer JWT                       Missing / Invalid
                       |                                     |
                       v                                     v
             [ req.user attached ]                 401 Unauthorized
                       |
         +-------------+-------------+
         |                           |
    Role: 'user'                Role: 'admin'
         |                           |
         |-- Create personal notes   |-- Inherits all User permissions
         |-- View own notes only     |-- View everyone's notes (?all=true)
         |-- Update/delete own notes |-- Manage all users (Add, Edit, Delete)
         |-- Write public posts      |-- Access admin user list with pagination
         |                           |
         +-------------+-------------+
                       |
                       v
            [ Controllers & Models ]
         (User.js, Note.js, Post.js)
                       |
                       v
             [ Mongoose Schemas ]
          (schema.index definitions)
                       |
                       v
         +---------------------------+
         |       MongoDB Atlas       |
         |    (Real Database Engine) |
         +---------------------------+
```

---

### 3. Database Indexing Strategy (ESR Rule Visualized)

Every index was created for a specific query. Per the assessment rules, zero unnecessary or duplicate indexes exist:

```
+-----------------------------------------------------------------------------------------+
| Collection | Defined Index (schema.index)          | Query Supported / Performance Gain |
+-----------------------------------------------------------------------------------------+
| User       | { email: 1 } (unique: true)           | Instant login lookup; uniqueness   |
| User       | { createdAt: -1 }                     | Sorted pagination for user listing |
| User       | { interests: 1 }                      | Multikey index for Scenario 1      |
+-----------------------------------------------------------------------------------------+
| Note       | { owner: 1, createdAt: -1 }           | ESR Rule: Equality (owner) + Sort  |
|            |                                       | (createdAt) in 1 index traversal   |
| Note       | { createdAt: -1 }                     | Sorted pagination for all notes    |
+-----------------------------------------------------------------------------------------+
| Post       | { author: 1, createdAt: -1 }          | Scenario 2: $match & $lookup join  |
| Post       | { createdAt: -1 }                     | Sorted pagination for public feed  |
+-----------------------------------------------------------------------------------------+
| All Models | _id (native primary index)            | Handled automatically by MongoDB   |
+-----------------------------------------------------------------------------------------+
```

---

### 4. Aggregation Pipelines Flow

#### Scenario 1: Group Users by Interests (Single Pipeline Call)

```
[ Input: User Documents ]
  User A: { username: "Alice", interests: ["chess", "gaming"] }
  User B: { username: "Admin", interests: ["chess", "coding"] }
       |
       | Stage 1: $unwind: "$interests"
       v
  Stream 1: { user: "Alice", interests: "chess" }
  Stream 2: { user: "Alice", interests: "gaming" }
  Stream 3: { user: "Admin", interests: "chess" }
  Stream 4: { user: "Admin", interests: "coding" }
       |
       | Stage 2: $group: { _id: "$interests", count: { $sum: 1 }, users: [...] }
       v
  Group 1: { _id: "chess",  count: 2, users: [Alice, Admin] }
  Group 2: { _id: "gaming", count: 1, users: [Alice] }
  Group 3: { _id: "coding", count: 1, users: [Admin] }
       |
       | Stage 3: $sort: { _id: 1 }
       v
[ Final Result: Alphabetical groups with user profiles ]
```

#### Scenario 2: Retrieve User Posts with `$lookup`

```
[ Input: Post Documents ]
       |
       | Stage 1: $match: { author: ObjectId(targetUserId) }
       v (Uses author compound index)
[ Filtered Posts belonging to user ]
       |
       | Stage 2: $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorDetails" }
       v (Joins with User collection)
[ Post Document with author array ]
       |
       | Stage 3: $unwind: "$authorDetails"
       | Stage 4: $project: { title: 1, content: 1, createdAt: 1, "authorDetails.username": 1, ... }
       | Stage 5: $sort: { createdAt: -1 }
       v
[ Final Result: User's posts with author details joined, passwords stripped ]
```

---

## Roles and Permissions

| Feature / Action | Standard User | Admin |
| :--- | :---: | :---: |
| Create, edit, and delete personal notes | Yes | Yes |
| View own notes with pagination | Yes | Yes |
| View everyone's notes across the platform | No | Yes |
| Manage users (Add, Edit, Delete, List) | No | Yes |
| Write and view public posts | Yes | Yes |
| Run Scenario 1 Aggregation (Group by Interests) | Yes | Yes |
| Run Scenario 2 Aggregation (User Posts via `$lookup`) | Yes | Yes |

---

## Quick Setup and Running Instructions

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** MongoDB Atlas connection string or local MongoDB instance

### 2. Install Dependencies
From the project root:
```bash
npm run install:all
```

### 3. Environment Setup
The backend reads credentials from `backend/.env` (which is kept private and excluded from git):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=supersecretjwtkey_for_backend_interview_task
```

### 4. Populate Database with Demo Data
Run the seed script to create test accounts, notes, and posts:
```bash
npm run seed:backend
```

**Pre-seeded Accounts:**
- **Admin Account:** `admin@example.com` / `password123` (Full permissions)
- **Standard User 1:** `alice@example.com` / `password123` (Standard permissions)
- **Standard User 2:** `bob@example.com` / `password123` (Standard permissions)

### 5. Start the Application
- **Backend API:**
  ```bash
  npm run start:backend
  ```
  Runs at **`http://localhost:5000`**.

- **Frontend Client:**
  ```bash
  npm run start:frontend
  ```
  Runs at **`http://localhost:3000`**.

### 6. Run Automated Tests
```bash
npm run test:backend
```

---

## Automated Test Results

```
PASS tests/schema-indexing.test.js
PASS tests/api-routes.test.js
PASS tests/security-models.test.js
PASS tests/auth-rbac.test.js
PASS tests/aggregations.test.js
PASS tests/pagination.test.js

Test Suites: 6 passed, 6 total
Tests:       23 passed, 23 total
Snapshots:   0 total
Time:        4.898 s
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create account (`username`, `email`, `password`, `role`, `interests`)
- `POST /api/auth/login` - Authenticate and get JWT token
- `GET /api/auth/me` - Get profile of current user (Requires Bearer token)

### Notes
- `GET /api/notes?page=1&limit=10` - List own notes with pagination
- `GET /api/notes?page=1&limit=10&all=true` - List all notes across system (Admin only)
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Fetch single note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### User Management (Admin Only)
- `GET /api/users?page=1&limit=10` - List all users with pagination
- `POST /api/users` - Add a new user
- `GET /api/users/:id` - Fetch user details
- `PUT /api/users/:id` - Update user or role
- `DELETE /api/users/:id` - Remove user (cascades associated data)

### Community Posts
- `GET /api/posts?page=1&limit=10` - List all public posts with pagination
- `POST /api/posts` - Create public post
- `GET /api/posts/:id` - Fetch single post

### Aggregations
- `GET /api/aggregations/group-by-interests` - Scenario 1: Group users by interests
- `GET /api/aggregations/user-posts/:userId` - Scenario 2: Retrieve user posts with `$lookup`
