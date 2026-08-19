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

---

## 2. Start the Backend API (FastAPI)
Open a new terminal window, navigate to the `backend` directory, activate the virtual environment, and run the server:

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

- **API URL:** [http://localhost:8000](http://localhost:8000)
- **Interactive API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 3. Start the Frontend App (Next.js)
Open another terminal window, navigate to the `frontend` directory, and start the Next.js development server:

```bash
cd frontend
npm run dev
```

- **Frontend URL:** [http://localhost:3000](http://localhost:3000)
