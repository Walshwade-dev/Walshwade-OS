# Project Wade OS - Local Development Guide

This guide outlines how to start and run the Project Wade OS environment locally.

## Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Python (3.12+)

---

## 1. Start the Database
The backend relies on a PostgreSQL database. Start it in the background using Docker from the project root:

```bash
docker compose up -d
```
*(Note: The database runs on port `5433` to prevent conflicts with local Postgres instances).*

Copy `.env.example` to `.env` before starting the database and API. Set a private `API_KEY`; use the same value as `NEXT_PUBLIC_API_KEY` in `frontend/.env.local`.

---

## 2. Start the Backend API (FastAPI)
Open a new terminal window, navigate to the `backend` directory, activate the virtual environment, and run the server:

```bash
cd backend
source venv/bin/activate
PYTHONPATH=. uvicorn app.main:app --reload
```

- **API URL:** [http://localhost:8000](http://localhost:8000)
- **Interactive API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 3. Start the Frontend App (Next.js)
Open another terminal window, navigate to the `frontend` directory, and start the Next.js development server:

```bash
cd frontend
npm install
npm run dev
```

- **Frontend URL:** [http://localhost:3000](http://localhost:3000)

## Security and production

All Wade OS API routes require the `X-API-Key` header; only `/health` is public. For production, set `ENV=production`, `DEBUG=False`, a strong `API_KEY`, and `CORS_ORIGINS` to the deployed frontend origin in the platform environment settings. Never commit `.env` or frontend environment files.

See [SETUP.md](SETUP.md) for the complete local, migration, audit, and deployment checklist.
