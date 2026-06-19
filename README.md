# PakkiOra — Appointment Booking System

Full-stack appointment booking: Django REST API + React frontend, backed by **PostgreSQL** (Neon-ready).

## Quick start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` and set `DATABASE_URL` to your PostgreSQL connection string (Neon example):

```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

Then:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

- API: http://127.0.0.1:8000/api/v1/
- Docs: http://127.0.0.1:8000/api/docs/

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173 — **no frontend `.env` needed** for local dev (Vite proxies `/api` to the backend).

## Before you push to GitHub

Check these in **Source Control** before committing:

| Should appear | Should **NOT** appear |
|---------------|------------------------|
| `backend/`, `frontend/` source code | `backend/.env` |
| `backend/.env.example` (empty template) | `frontend/.env` |
| `frontend/.env.example` | `node_modules/`, `venv/`, `dist/` |
| `README.md`, `.gitignore` | `*.sqlite3`, `db.sqlite3` |

After cloning on another machine: copy `backend/.env.example` → `backend/.env`, add your Neon `DATABASE_URL`, then `migrate`.

## Project structure

```
PakkiOra/
  backend/     # Django REST API (PostgreSQL via DATABASE_URL)
  frontend/    # React + Vite
```

## Tech stack

- **Backend:** Django, DRF, SimpleJWT, PostgreSQL (Neon), drf-spectacular
- **Frontend:** React, Vite, Tailwind CSS, Axios, React Router

## Deploying with Neon

1. Create a Neon project and copy the connection string.
2. Set `DATABASE_URL` in your host environment (Render, Railway, etc.).
3. Run `python manage.py migrate` on deploy.
4. Set `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS` for production.
