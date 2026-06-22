# PakkiOra Backend

Django REST API for the PakkiOra appointment booking platform. Handles authentication, patient profiles, doctor schedules, appointments, and admin operations.

## Tech stack

- Python 3.12+
- Django 4.2+
- Django REST Framework
- SimpleJWT (access + refresh tokens)
- PostgreSQL via `DATABASE_URL`
- drf-spectacular (OpenAPI / Swagger docs)
- django-cors-headers, django-filter

## Prerequisites

- Python 3.12 or newer
- PostgreSQL database (local or hosted, e.g. Neon)
- pip and a virtual environment

## Local setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

Install dependencies and configure environment:

```bash
pip install -r requirements.txt
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
```

Edit `backend/.env` and set your values. **Never commit this file.**

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SECRET_KEY` | Optional locally | Django secret key (required in production) |
| `DEBUG` | Optional | `True` for local dev (default) |
| `ALLOWED_HOSTS` | Optional locally | Comma-separated hostnames |
| `CORS_ALLOWED_ORIGINS` | Optional locally | Frontend origin(s), e.g. `http://localhost:5173` |

Example `DATABASE_URL` format (use your own credentials):

```
postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

Run migrations and create an admin account:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Local URLs

| Resource | URL |
|----------|-----|
| API root | http://127.0.0.1:8000/ |
| API base | http://127.0.0.1:8000/api/v1/ |
| Swagger UI | http://127.0.0.1:8000/api/docs/ |
| ReDoc | http://127.0.0.1:8000/api/redoc/ |
| OpenAPI schema | http://127.0.0.1:8000/api/schema/ |
| Django admin | http://127.0.0.1:8000/admin/ |

Interactive docs at `/api/docs/` are the full endpoint reference.

## Authentication

Most endpoints require a JWT access token.

1. `POST /api/v1/auth/login/` with `username` and `password`
2. Read `data.tokens.access` from the JSON response
3. Send on protected requests:

```
Authorization: Bearer <access_token>
```

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/v1/auth/register/` | Public | Patient registration |
| `POST /api/v1/auth/login/` | Public | Patient or admin login |
| `POST /api/v1/auth/refresh/` | Public | Refresh access token |
| `POST /api/v1/auth/logout/` | Bearer | Blacklist refresh token |

## Main API routes

### Patient

| Method | Path | Description |
|--------|------|-------------|
| GET, PATCH | `/api/v1/profile/` | View / update profile |
| POST | `/api/v1/profile/change-password/` | Change password |
| GET | `/api/v1/doctors/` | List active doctors |
| GET | `/api/v1/doctors/{id}/` | Doctor detail |
| GET | `/api/v1/doctors/{id}/available-dates/` | Bookable dates |
| GET | `/api/v1/doctors/{id}/booking-context/` | Doctor + dates + slots (combined) |
| GET | `/api/v1/doctors/{id}/slots/?date=YYYY-MM-DD` | Slots for a date |
| GET, POST | `/api/v1/appointments/` | List / book appointments |
| GET | `/api/v1/appointments/history/` | Grouped appointment history |
| PATCH | `/api/v1/appointments/{id}/` | Reschedule |
| POST | `/api/v1/appointments/{id}/cancel/` | Cancel |

### Admin

Requires a staff/superuser account (`createsuperuser` or admin staff API).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/dashboard/` | Dashboard statistics |
| CRUD | `/api/v1/doctors/` | Manage doctors |
| CRUD | `/api/v1/admin/patients/` | Manage patients |
| CRUD | `/api/v1/admin/staff/` | Manage admin users |
| CRUD | `/api/v1/admin/appointments/` | Manage appointments |

Admin doctor routes also include slot configuration and slot overview actions. See Swagger for the full list.

## Project structure

```
backend/
  config/           # Django settings, root URLs, WSGI
  accounts/         # Admin profile model
  doctors/          # Doctor, Patient, availability models
  appointments/     # Appointment model and booking services
  api/              # DRF serializers, views, permissions, pagination
  build.sh          # Production build script (migrate + collectstatic)
```

## Testing with Postman

1. Import the OpenAPI schema from `http://127.0.0.1:8000/api/schema/`, or
2. Manually call `POST /api/v1/auth/login/`, copy the access token, then set **Authorization → Bearer Token** on other requests.

Use `Content-Type: application/json` for POST/PATCH bodies.

## Production deployment

Typical stack: **Render** (API) + **Neon** (PostgreSQL) + **Vercel** (frontend).

### Environment variables (host dashboard only)

Set these in your hosting provider — **do not commit real values to Git**:

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | From your PostgreSQL provider |
| `SECRET_KEY` | Long random string |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | Your API hostname |
| `CORS_ALLOWED_ORIGINS` | Your frontend URL (no trailing slash) |

### Build and start (Render example)

- **Root directory:** `backend`
- **Build command:** `./build.sh`
- **Start command:** `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`

`build.sh` installs dependencies, collects static files, and runs migrations.

## Security notes

- Keep `backend/.env` out of version control
- Use strong `SECRET_KEY` and `DEBUG=False` in production
- Restrict `CORS_ALLOWED_ORIGINS` to your real frontend domain
- Create admin users with `createsuperuser`; do not share credentials in documentation or repos
- Rotate database credentials if they are ever exposed

## Troubleshooting

| Issue | Check |
|-------|-------|
| Server won't start | `DATABASE_URL` is set in `.env` |
| `401` on API calls | Valid Bearer token; token may have expired |
| CORS errors from frontend | `CORS_ALLOWED_ORIGINS` includes your frontend URL |
| Schema/docs 404 | Use `/api/docs/`, not `/api/v1/docs/` |
| Migrations pending | Run `python manage.py migrate` |
