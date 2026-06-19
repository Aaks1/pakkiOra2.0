# Deploy backend on Render

## 1. Create Web Service

1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect GitHub repo **`Aaks1/pakkiOra2.0`** (or your repo name)
3. Use these settings:

| Field | Value |
|-------|--------|
| **Name** | `pakkiora-api` |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` |

## 2. Environment variables

Add in **Environment** tab:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Your Neon connection string (same as local `.env`) |
| `SECRET_KEY` | Long random string ([generate one](https://djecrety.ir)) |
| `DEBUG` | `False` |
| `CORS_ALLOWED_ORIGINS` | Your Vercel URL, e.g. `https://pakki-ora2-0.vercel.app` |

`ALLOWED_HOSTS` is set automatically via Render’s `RENDER_EXTERNAL_HOSTNAME`.

## 3. Deploy

Click **Create Web Service**. Build runs `migrate` automatically via `build.sh`.

## 4. Create admin (first time)

After deploy: **Shell** tab on Render:

```bash
python manage.py createsuperuser
```

## 5. Connect Vercel frontend

On Vercel → **Environment Variables**:

```
VITE_API_URL=https://YOUR-SERVICE.onrender.com/api/v1
```

Redeploy Vercel after adding this.

## 6. Test API

Open: `https://YOUR-SERVICE.onrender.com/api/v1/`  
Docs: `https://YOUR-SERVICE.onrender.com/api/docs/`

## Notes

- Free tier may **sleep** after inactivity — first request can take ~30s
- Keep `backend/.env` local only — set secrets on Render dashboard
- Update `CORS_ALLOWED_ORIGINS` if your Vercel URL changes
