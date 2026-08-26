# Wade OS Setup

## Local development

Prerequisites: Docker Compose, Python 3.12+, Node.js 18+, and npm.

1. Copy `.env.example` to `.env` and replace `API_KEY` with a private value.
2. Copy `frontend/.env.example` to `frontend/.env.local` and use the same API key.
3. Start Postgres: `docker compose up -d db`.
4. Create or update the schema:

   ```bash
   cd backend
   source venv/bin/activate
   PYTHONPATH=. alembic upgrade head
   ```

5. Start the API with `PYTHONPATH=. uvicorn app.main:app --reload`.
6. In another terminal, run `cd frontend && npm install && npm run dev`.

The frontend is at `http://localhost:3000`, the API is at `http://localhost:8000`, and health is checked at `http://localhost:8000/health`. API documentation is at `/docs`.

## Verification

Run backend tests with `cd backend && PYTHONPATH=. ./venv/bin/pytest -q`. Run frontend checks with `cd frontend && npm run lint && npm run build`. Run dependency checks with `pip-audit -r backend/requirements.txt` and `npm audit --omit=dev`.

The API requires `X-API-Key` for all domain routes, including reads. `/health` is intentionally unauthenticated for deployment health probes. A task status cannot be changed through generic PATCH; use the controlled session and failure workflows.

## Production deployment

Deploy the backend and managed Postgres on Railway, Render, or Fly.io. Deploy the Next.js frontend separately on Vercel or the same provider. Configure these values in the platform secret/environment settings, never in committed files:

```text
ENV=production
DEBUG=False
API_KEY=<strong-random-secret>
CORS_ORIGINS=["https://your-frontend.example"]
DATABASE_URL=<managed-postgres-url>
```

The backend accepts either the local `POSTGRES_*` variables or a provider-supplied `DATABASE_URL`.

Set `NEXT_PUBLIC_API_URL` to the deployed API's `/api/v1` URL and `NEXT_PUBLIC_API_KEY` to the same single-user key. Because the Next.js public variable is shipped to the browser, this is suitable only for the explicitly single-user MVP.

## Known limitations

- Authentication is a single shared API key, not multi-user identity, roles, sessions, OAuth, or rate limiting.
- Skill-gap matching is exact-match logic; there is no semantic skill taxonomy or job scraping.
- There is no automated backup, CI/CD pipeline, WAF, or advanced monitoring configured by the application.
- Dependency audit results depend on the audit date and upstream advisories; review and record accepted findings before release.
- The deployment platform, managed Postgres instance, DNS, and production smoke test require provider credentials and cannot be completed from this repository alone.