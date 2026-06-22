# PakkiOra

Full-stack healthcare appointment booking system: patients browse doctors, book time slots, and manage appointments; administrators manage doctors, patients, and schedules.

## Repository structure

```
PakkiOra/
  backend/     Django REST API + PostgreSQL
  frontend/    React + Vite SPA
```

| Component | Documentation |
|-----------|---------------|
| API, database, deployment | [backend/README.md](backend/README.md) |
| UI, routes, Vercel setup | [frontend/README.md](frontend/README.md) |

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Backend | Django, DRF, SimpleJWT, PostgreSQL, drf-spectacular |
| Frontend | React, Vite, Tailwind CSS, Axios, React Query |
| Database | PostgreSQL (e.g. Neon) |
| Typical deploy | Render (API) · Vercel (frontend) · Neon (DB) |

## Quick start (local)

**Terminal 1 — backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env         # then set DATABASE_URL
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Terminal 2 — frontend**

```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| App | http://localhost:5173 |
| API | http://127.0.0.1:8000/api/v1/ |
| API docs | http://127.0.0.1:8000/api/docs/ |

## Environment and secrets

- Copy `backend/.env.example` → `backend/.env` and add your database URL locally
- Copy `frontend/.env.example` → `frontend/.env` only if you need a custom API URL
- **Never commit** `.env` files, database credentials, or `SECRET_KEY` values to Git
- Set production variables in your host dashboards (Render, Vercel, Neon)

## Features

- Patient registration and JWT authentication
- Doctor directory and availability-based slot booking
- Appointment history, reschedule, and cancel
- Patient profile management
- Admin dashboard with doctor, patient, appointment, and slot management
- OpenAPI documentation (Swagger / ReDoc)

## License

University project — see course requirements for usage and attribution.
