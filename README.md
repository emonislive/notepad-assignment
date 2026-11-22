# Secure Note-Taking Application

A secure, high-performance REST API and functional frontend developed for the **Backend Developer Technical Assessment**. The solution implements role-based access control (RBAC), strict database indexing optimization, and aggregation pipelines using **Node.js, Express, MongoDB with Mongoose, and React**.

---

## Table of Contents

1. [Features & Architecture Overview](#features--architecture-overview)
2. [Roles & Permissions (RBAC)](#roles--permissions-rbac)
3. [Database Indexing Strategy (Strictly Optimized)](#database-indexing-strategy-strictly-optimized)
4. [Aggregation Pipelines](#aggregation-pipelines)
5. [Tech Stack](#tech-stack)
6. [Prerequisites](#prerequisites)
7. [Installation & Setup](#installation--setup)
8. [Running the Application](#running-the-application)
9. [Running Automated Tests](#running-automated-tests)
10. [REST API Documentation](#rest-api-documentation)

---

## Features & Architecture Overview

- **Secure Authentication:** Stateless authentication powered by JSON Web Tokens (JWT) with secure password hashing (`bcryptjs`).
- **Role-Based Access Control:** Strict permission boundaries for `user` and `admin` roles.
- **Strict Indexing Strategy:** Every query and aggregation is supported by strictly required indexes defined via `schema.index()`. No unnecessary or duplicate indexes exist.
- **Pagination Optimization:** All list endpoints implement standardized limit/offset pagination with metadata (`page`, `limit`, `totalCount`, `totalPages`, `hasNextPage`, `hasPrevPage`).
- **Aggregation Pipelines:**
  - **Scenario 1:** Users grouped by profile interests using a single `collection.aggregate()` call.
  - **Scenario 2:** Posts belonging to a user retrieved using a single aggregation pipeline with a `$lookup` stage.
- **Functional Frontend:** Clean, minimal React single-page application focused on testing and integration without unnecessary bloat.

---

## Roles & Permissions (RBAC)

| Capability | `user` | `admin` |
| :--- | :---: | :---: |
| Create, view, update, delete own notes | ✅ | ✅ |
| View list of own notes with pagination | ✅ | ✅ |
| View everyone's notes across the system | ❌ | ✅ |
| Manage users (add, list, update, remove) | ❌ | ✅ |
| Write public posts | ✅ | ✅ |
| View public posts & user posts aggregation | ✅ | ✅ |
| View users grouped by interests aggregation | ✅ | ✅ |

---

## Database Indexing Strategy (Strictly Optimized)

Per the examiner's instructions, all indexes are defined explicitly in the codebase using the `schema.index()` method for code review visibility. Redundant or unnecessary indexes have been strictly avoided.

### 1. `User` Schema
- `userSchema.index({ email: 1 }, { unique: true })`
  - **Purpose:** Optimizes authentication lookup (`findOne({ email })`) and enforces email uniqueness at the database level.
- `userSchema.index({ createdAt: -1 })`
  - **Purpose:** Backs sorted pagination for Admin listing all users (`User.find().sort({ createdAt: -1 })`), avoiding in-memory sort.
- `userSchema.index({ interests: 1 })`
  - **Purpose:** Multikey index supporting **Aggregation Scenario 1** (grouping and querying users by the `interests` array).

### 2. `Note` Schema
- `noteSchema.index({ owner: 1, createdAt: -1 })`
  - **Purpose:** Compound index following the **ESR (Equality, Sort, Range)** rule. Satisfies regular user list queries (`owner: userId`) sorted newest first (`createdAt: -1`) directly from the index.
- `noteSchema.index({ createdAt: -1 })`
  - **Purpose:** Backs sorted pagination when an Admin views all notes across all users.

### 3. `Post` Schema
- `postSchema.index({ author: 1, createdAt: -1 })`
  - **Purpose:** Compound index strictly supporting **Aggregation Scenario 2** (`$match` on `author` and `$lookup` join), sorted chronologically.
- `postSchema.index({ createdAt: -1 })`
  - **Purpose:** Backs sorted pagination for the public post feed.

### Primary Key `_id`
MongoDB automatically creates a unique primary index on `_id` for every collection. All single-document GET operations (e.g. `User.findById`, `Note.findById`) are inherently index-covered.

---

## Aggregation Pipelines

### Scenario 1: Group by Interests
- **Requirement:** Specific view to see users grouped by interests using **exactly one `collection.aggregate()` call**.
- **Endpoint:** `GET /api/aggregations/group-by-interests`
- **Pipeline Implementation:**
  ```javascript
  User.aggregate([
    { $unwind: '$interests' },
    {
      $group: {
        _id: '$interests',
        count: { $sum: 1 },
        users: {
          $push: {
            _id: '$_id',
            username: '$username',
            email: '$email',
            role: '$role',
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  ```
- **Supporting Index:** Multikey index `userSchema.index({ interests: 1 })`.

---

### Scenario 2: User Posts ($lookup)
- **Requirement:** Retrieve all posts belonging to a particular user using **a single aggregation pipeline with a `$lookup` stage**.
- **Endpoint:** `GET /api/aggregations/user-posts/:userId`
- **Pipeline Implementation:**
  ```javascript
  Post.aggregate([
    { $match: { author: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'authorDetails',
      },
    },
    { $unwind: '$authorDetails' },
    {
      $project: {
        title: 1,
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        'authorDetails._id': 1,
        'authorDetails.username': 1,
        'authorDetails.email': 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);
  ```
- **Supporting Indexes:** Compound index `postSchema.index({ author: 1, createdAt: -1 })` on Post, and default primary index on `User._id`.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database & ODM:** MongoDB with Mongoose (v8.9+)
- **Security:** JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`)
- **Testing:** Jest, Supertest
- **Frontend:** React.js, Vite

---

## Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** A running MongoDB instance (local `mongodb://localhost:27017` or MongoDB Atlas URI)

---

## Installation & Setup

### 1. Clone & Install Dependencies

From the project root:

```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Alternatively, install in each folder individually:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory (or copy from `backend/.env.example`):

```bash
cp backend/.env.example backend/.env
```

Default configuration in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/secure_notes
JWT_SECRET=supersecretjwtkey_for_backend_interview_task
```

### 3. (Optional) Seed the Database with Sample Data

To instantly populate the database with sample users (both admin and standard user), notes, posts, and interest tags:

```bash
npm run seed:backend
```

**Pre-seeded Test Accounts:**
- **Admin Account:** `admin@example.com` / `password123` (Role: `admin`)
- **Standard User 1:** `alice@example.com` / `password123` (Role: `user`)
- **Standard User 2:** `bob@example.com` / `password123` (Role: `user`)

---

## Running the Application

### Start the Backend Server

```bash
# From the root directory:
npm run start:backend

# Or from backend/:
cd backend
npm start
```
The REST API will run at **`http://localhost:5000`**.

### Start the Frontend Client

```bash
# From the root directory:
npm run start:frontend

# Or from frontend/:
cd frontend
npm run dev
```
The React frontend will be accessible at **`http://localhost:3000`**.

---

## Running Automated Tests

Run the full Jest test suite verifying schemas, index declarations, RBAC middlewares, pagination, and aggregation pipelines:

```bash
# From the root directory:
npm run test:backend

# Or from backend/:
cd backend
npm test
```

### Test Coverage Highlights:
- `tests/schema-indexing.test.js`: Verifies exact `schema.index()` declarations on User, Note, and Post models, and guarantees 0 unnecessary or duplicate indexes.
- `tests/security-models.test.js`: Verifies bcrypt hashing, password verification, toJSON password omission, and role validation.
- `tests/auth-rbac.test.js`: Verifies JWT issuance, header parsing, 401 Unauthorized handling, and 403 Forbidden role enforcement.
- `tests/pagination.test.js`: Verifies limit/offset calculations, skip formula, and boundary clamping.
- `tests/aggregations.test.js`: Verifies exact pipeline stages and single-call constraints for Scenario 1 and Scenario 2.
- `tests/api-routes.test.js`: Integration tests for health check, 404 handler, and request validations.

---

## REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`username`, `email`, `password`, `role`, `interests`).
- `POST /api/auth/login` — Sign in and receive a JWT token (`email`, `password`).
- `GET /api/auth/me` — Retrieve authenticated user profile (Requires Bearer token).

### Notes (`/api/notes`)
- `GET /api/notes?page=1&limit=10` — List own notes with pagination (User).
- `GET /api/notes?page=1&limit=10&all=true` — List everyone's notes with pagination (Admin only).
- `POST /api/notes` — Create a new note (`title`, `content`).
- `GET /api/notes/:id` — Get note by ID (User can view own, Admin can view any).
- `PUT /api/notes/:id` — Update note (Owner or Admin).
- `DELETE /api/notes/:id` — Delete note (Owner or Admin).

### User Management (`/api/users` - Admin Only)
- `GET /api/users?page=1&limit=10` — List all users with pagination.
- `POST /api/users` — Create a user.
- `GET /api/users/:id` — Get user profile.
- `PUT /api/users/:id` — Update user details or role.
- `DELETE /api/users/:id` — Remove user and cascade delete notes/posts.

### Community Posts (`/api/posts`)
- `GET /api/posts?page=1&limit=10` — List all public posts with pagination.
- `POST /api/posts` — Create a public post (Authenticated).
- `GET /api/posts/:id` — Get specific post by ID.

### Aggregations (`/api/aggregations`)
- `GET /api/aggregations/group-by-interests` — **Scenario 1:** View users grouped by interests (`collection.aggregate()`).
- `GET /api/aggregations/user-posts/:userId` — **Scenario 2:** Retrieve all posts belonging to a user using single `$lookup` aggregation.
