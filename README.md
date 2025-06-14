# BD Library Fullstack App

## Backend (FastAPI)
- Python FastAPI backend with SQLAlchemy models based on schema.sql
- REST API endpoints for all tables
- Connects to MySQL using DATABASE_URL from .env

## Frontend (React + Vite)
- React app bootstrapped with Vite
- CRUD UI for all tables

## Setup

### Backend
Use docker 
 docker run -d \
  --name mysql-bookdb \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=bookdb \
  -e MYSQL_USER=appuser \
  -e MYSQL_PASSWORD=apppassword \
  -p 3306:3306 \
  mysql:8.0 \
  --default-authentication-plugin=mysql_native_password
1. `cd backend`
2. `python -m venv venv && source venv/bin/activate`
3. `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and set your DB credentials
5. `uvicorn app.main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

### Current progress
Current backend and frontend stack working seperatly