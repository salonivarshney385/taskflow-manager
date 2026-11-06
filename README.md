# TaskFlow – Project and Task Management System

A full-stack web application for managing projects, tasks, teams, and tracking progress with interactive analytics.

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-v1.0.0-6366f1?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Setup](#database-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Default Credentials](#default-credentials)

---

## Overview

TaskFlow helps organizations manage multiple projects, assign tasks to employees, track completed and pending work, monitor deadlines, and visualize progress through interactive charts and graphs.

---

## Features

- **Authentication** — JWT-based login/register with role-based access (Admin, Manager, Employee)
- **Dashboard** — Real-time statistics: projects, tasks, overdue items
- **Project Management** — Create, edit, delete projects with status tracking and completion %
- **Task Management** — Create, assign, prioritize, and filter tasks
- **Analytics** — Interactive charts (bar, pie) powered by real database data
- **Team Management** — View team members, assignments, and performance metrics
- **Responsive UI** — Works on desktop, tablet, and mobile

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Charting | Recharts |
| HTTP Client | Axios |
| Backend | Python 3.11+, FastAPI |
| ORM | SQLAlchemy 2.0 |
| Authentication | JWT (python-jose), bcrypt (passlib) |
| Database | PostgreSQL 15 |

---

## Project Structure

```
TaskFlow Manager/
├── backend/                   # FastAPI backend
│   ├── app/
│   │   ├── main.py            # App entry point, CORS, router registration
│   │   ├── database.py        # SQLAlchemy engine and session
│   │   ├── models/            # ORM models (User, Project, Task)
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── routers/           # API route handlers
│   │   ├── crud/              # Database operation functions
│   │   └── core/              # Config, security, dependencies
│   ├── requirements.txt
│   └── .env
│
└── frontend/                  # React + Vite frontend
    ├── src/
    │   ├── api/               # Axios API client functions
    │   ├── components/        # Reusable UI components
    │   ├── context/           # React Auth context
    │   ├── pages/             # Dashboard, Projects, Tasks, Analytics, Team
    │   ├── utils/             # Helper functions
    │   └── App.jsx            # Router setup
    ├── package.json
    └── .env
```

---

## Database Setup

### Prerequisites
- PostgreSQL 15+ installed and running
- `psql` CLI available

### Create the database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE taskflow_db;

# Exit
\q
```

> The application auto-creates all tables on first startup — no migrations needed.

---

## Backend Setup

### Prerequisites
- Python 3.11+
- pip

### Installation

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux

# Edit .env and set your DATABASE_URL and SECRET_KEY
```

### .env Configuration

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/taskflow_db
SECRET_KEY=your-super-secret-key-at-least-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
BACKEND_CORS_ORIGINS=["http://localhost:5173"]
```

### Start the Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`  
API docs (Swagger UI): `http://localhost:8000/docs`  
ReDoc: `http://localhost:8000/redoc`

---

## Frontend Setup

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux
```

### .env Configuration

```env
VITE_API_URL=http://localhost:8000/api
```

### Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Running Both Simultaneously

Open two terminals:

**Terminal 1 (Backend)**:
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login, get JWT token | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Project Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects/` | List all projects | Yes |
| POST | `/api/projects/` | Create project | Manager/Admin |
| GET | `/api/projects/{id}` | Get project details | Yes |
| PUT | `/api/projects/{id}` | Update project | Manager/Admin |
| DELETE | `/api/projects/{id}` | Delete project | Manager/Admin |
| GET | `/api/projects/{id}/members` | List project members | Yes |
| POST | `/api/projects/{id}/members` | Add project member | Manager/Admin |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks/` | List tasks (with filters) | Yes |
| POST | `/api/tasks/` | Create task | Manager/Admin |
| GET | `/api/tasks/{id}` | Get task details | Yes |
| PUT | `/api/tasks/{id}` | Update task | Yes |
| DELETE | `/api/tasks/{id}` | Delete task | Manager/Admin |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/` | List all users | Admin |
| GET | `/api/users/{id}` | Get user | Yes |
| PUT | `/api/users/{id}` | Update user | Yes |
| DELETE | `/api/users/{id}` | Delete user | Admin |

### Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/dashboard` | Dashboard stats | Yes |
| GET | `/api/analytics/charts` | Chart data | Yes |

### Request/Response Examples

#### Register
```bash
POST /api/auth/register
{
  "email": "admin@taskflow.com",
  "full_name": "Admin User",
  "password": "securepassword",
  "role": "admin"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded
username=admin@taskflow.com&password=securepassword
```

Response:
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer"
}
```

#### Create Project
```bash
POST /api/projects/
Authorization: Bearer <token>
{
  "name": "Website Redesign",
  "description": "Redesign the company website",
  "status": "ongoing",
  "start_date": "2024-01-01",
  "deadline": "2024-03-31",
  "completion_percentage": 45,
  "manager_id": 1
}
```

---

## Default Credentials

After starting the application, register an account through the UI at `http://localhost:5173/register`.

Set role to **Admin** for the first account to have full access.

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SECRET_KEY` | JWT signing secret (32+ chars) | Required |
| `ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifespan | 10080 (7 days) |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins (JSON array) | `["http://localhost:5173"]` |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api` |

---

## License

MIT License — free to use for personal and commercial projects.

