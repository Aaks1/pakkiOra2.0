# PakkiOra Backend (Django REST API)

REST API for appointment booking. Uses **PostgreSQL** via the `DATABASE_URL` environment variable (Neon-compatible).

## Quick start

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env
```

Set `DATABASE_URL` in `.env` (from Neon or local PostgreSQL):

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

- API base: http://127.0.0.1:8000/api/v1/
- Root: http://127.0.0.1:8000/ (API status JSON)
- Docs: http://127.0.0.1:8000/api/docs/

## Main endpoints

| Method | URL | Who |
|--------|-----|-----|
| POST | `/api/v1/auth/register/` | Patient signup |
| POST | `/api/v1/auth/login/` | Patient or admin login |
| POST | `/api/v1/auth/refresh/` | Refresh JWT |
| POST | `/api/v1/auth/logout/` | Logout |
| GET/PUT | `/api/v1/profile/` | Patient profile |
| GET | `/api/v1/doctors/` | List doctors |
| GET | `/api/v1/doctors/{id}/slots/?date=YYYY-MM-DD` | Available slots |
| GET/POST | `/api/v1/appointments/` | List / book |
| PATCH | `/api/v1/appointments/{id}/` | Reschedule |
| POST | `/api/v1/appointments/{id}/cancel/` | Cancel |
| GET | `/api/v1/admin/dashboard/` | Admin stats |
| CRUD | `/api/v1/doctors/` | Manage doctors (admin) |
| CRUD | `/api/v1/admin/patients/` | Manage patients |
| CRUD | `/api/v1/admin/appointments/` | Manage appointments |

**Admin users:** create with `createsuperuser` or via `/api/v1/admin/staff/`.

## Project layout

```
backend/
  config/          # settings, urls
  accounts/        # AdminProfile
  doctors/         # Doctor, Patient, availability
  appointments/    # Appointment + booking services
  api/             # DRF serializers, views, permissions
```

## React frontend

Point your React app at `http://127.0.0.1:8000/api/v1` and send JWT in header:

```
Authorization: Bearer <access_token>
```

Set `CORS_ALLOWED_ORIGINS` in `.env` to your frontend URL.

## Neon deployment

1. Add `DATABASE_URL` from the Neon dashboard to your host env vars.
2. Ensure the connection string includes `?sslmode=require`.
3. Run migrations on deploy: `python manage.py migrate`.
