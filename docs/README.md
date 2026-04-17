# Gavell Intelligence (New Site)

This is the new Gavell Intelligence stack:

- Frontend: React + Vite (this folder root)
- Backend API: Flask + SQLAlchemy (`./backend`)
- Database: PostgreSQL on Render (SQLite fallback for local dev)

## Local Run

### 1. Start backend (`127.0.0.1:8000`)

```powershell
cd backend
python -m pip install -r requirements.txt
copy .env.example .env
python main.py
```

### 2. Start frontend (`127.0.0.1:5173`)

```powershell
cd ..
npm install
copy .env.example .env
npm run dev -- --host 127.0.0.1 --port 5173
```

### 3. Access

- Site: `http://127.0.0.1:5173`
- Admin login: `http://127.0.0.1:5173/admin/login`

Default admin login if unchanged:

- Email: `admin@gavellintelligence.local`
- Password: `ChangeThisPassword123!`

## Render

Use `render.yaml` in this folder to create:

- `gavell-intelligence-api` (Python web service)
- `gavell-intelligence` (static frontend)
- `gavell-intelligence-db` (PostgreSQL)

Update `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `CORS_ORIGINS` in Render before going live.
