# PakkiOra — Appointment Booking System

Full-stack appointment booking: Django REST API + React frontend.

## Quick start

### Backend

```bash
cd backend
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API: http://127.0.0.1:8000/api/v1/ · Docs: http://127.0.0.1:8000/api/docs/

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

App: http://localhost:5173

## Project structure

```
PakkiOra/
  backend/     # Django REST API (SQLite)
  frontend/    # React + Vite + Axios
```

## Tech stack

- **Backend:** Django, DRF, SimpleJWT, SQLite, drf-spectacular
- **Frontend:** React, Vite, Tailwind CSS, Axios, React Router, TanStack Query
