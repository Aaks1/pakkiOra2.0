# PakkiOra Frontend

React + Vite patient/admin UI.

## Local dev (no `.env` required)

```bash
npm install
npm run dev
```

With the backend on port 8000, Vite proxies `/api` → `http://127.0.0.1:8000`, so the app works **without** a frontend `.env`.

## Optional `frontend/.env`

Only needed if you change the API URL locally:

```env
VITE_API_URL=/api/v1
```

## Production (Vercel)

Set in **Vercel → Project → Environment Variables** (not in git):

```env
VITE_API_URL=https://YOUR-BACKEND-URL/api/v1
```

No secrets go in the frontend `.env` — only the public API URL.
