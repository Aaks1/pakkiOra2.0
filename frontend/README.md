# PakkiOra Frontend

React single-page application for the PakkiOra appointment booking platform. Includes a public landing page, patient portal, and admin console.

## Tech stack

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4
- Axios
- TanStack React Query
- Framer Motion, Lucide React

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm
- Backend API running locally on port **8000** (see `backend/README.md`)

## Local development

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### API proxy (default)

No frontend `.env` is required for local dev. Vite proxies `/api` to `http://127.0.0.1:8000`, so the app talks to the backend automatically.

Optional `frontend/.env` (copy from `.env.example`):

```env
VITE_API_URL=/api/v1
```

Only change this if you need a different local API base path.

## Application routes

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Sign in (patient or admin) |
| `/register` | Public | Patient registration |
| `/patient/dashboard` | Patient | Overview and quick actions |
| `/patient/doctors` | Patient | Browse doctors |
| `/patient/book` | Patient | Book an appointment |
| `/patient/appointments` | Patient | View and manage appointments |
| `/patient/notifications` | Patient | Notifications |
| `/patient/profile` | Patient | Profile and password |
| `/admin/dashboard` | Admin | Admin overview |
| `/admin/doctors` | Admin | Manage doctors |
| `/admin/patients` | Admin | Manage patients |
| `/admin/appointments` | Admin | Manage appointments |
| `/admin/slots` | Admin | Slot management |
| `/admin/admins` | Admin | Manage staff accounts |

Authenticated users are redirected to the correct portal based on their role.

## Project structure

```
frontend/
  src/
    api/              # Axios client and API helpers
    components/
      admin/          # Admin layout, pages, modals
      auth/           # Login and registration
      landing/        # Public marketing pages
      patient/        # Patient portal UI
      ui/             # Shared buttons, inputs, alerts
    context/          # Auth and patient UI state
    hooks/            # React Query hooks, utilities
    lib/              # Query client config
    pages/            # Route entry re-exports (if used)
  public/             # Static assets
  vite.config.js      # Dev server and API proxy
```

## Environment variables

Frontend env vars are **public** (bundled into the client). Only store non-secret configuration here.

| Variable | When | Example |
|----------|------|---------|
| `VITE_API_URL` | Production deploy | `https://your-api-host.example.com/api/v1` |

**Do not** put database URLs, secret keys, or private API keys in frontend env files.

### Production (Vercel)

Set in the hosting dashboard under **Environment Variables**:

```env
VITE_API_URL=https://your-backend-host.example.com/api/v1
```

The value must include `/api/v1` at the end.

Redeploy after changing environment variables.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Connecting to the backend

1. Start the Django API (`python manage.py runserver` in `backend/`)
2. Start this frontend (`npm run dev`)
3. Register a patient at `/register`, or sign in with an account created via `createsuperuser` for admin access

JWT tokens are stored in the browser and attached automatically to API requests.

## Production deployment

Typical host: **Vercel**

1. Connect the GitHub repository
2. Set **Root Directory** to `frontend` (if deploying from monorepo)
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set `VITE_API_URL` to your deployed backend URL (with `/api/v1`)

Ensure the backend `CORS_ALLOWED_ORIGINS` includes your Vercel frontend URL.

## Security notes

- Never commit `frontend/.env` with production URLs if they are sensitive to your workflow; use the host dashboard instead
- Do not store secrets in `VITE_*` variables — they are visible in the built JavaScript
- Log out from shared machines; tokens are kept in browser storage

## Troubleshooting

| Issue | Check |
|-------|-------|
| Network error on login | Backend running on port 8000 |
| API hits wrong host in production | `VITE_API_URL` includes `/api/v1` |
| CORS error | Backend `CORS_ALLOWED_ORIGINS` matches frontend URL |
| Blank page after deploy | Vercel SPA rewrites configured; check build logs |
| Admin sent to patient portal | Account must have staff/superuser flag |
