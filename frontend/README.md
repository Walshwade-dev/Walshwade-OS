# Wade OS Frontend

This is the Next.js frontend for Project Wade OS. It provides the UI for goals, projects, tasks, weekly plans, execution sessions, reviews, skills, career opportunities, content items, and dashboard KPIs.

## Local development

Create `frontend/.env.local` from `.env.example`. Set `NEXT_PUBLIC_API_URL` to the backend `/api/v1` URL and set `NEXT_PUBLIC_API_KEY` to the same single-user key configured in the backend.

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

The app is available at [http://localhost:3000](http://localhost:3000). The backend must be running separately; see the root [SETUP.md](../SETUP.md).

## Verification

```bash
npm run build
npm run lint
npm audit --omit=dev
```

The production build currently passes. Lint has documented pre-existing findings in [FRONTEND_LOG.md](FRONTEND_LOG.md); the API-key transport change is covered by the production build.

## Production

Deploy the frontend to Vercel or another Next.js-compatible host. Configure `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_API_KEY` as build-time environment variables. The API key is visible in the browser bundle, which is acceptable only for this explicitly single-user MVP.

For the complete backend, database, security, and deployment instructions, see the root [SETUP.md](../SETUP.md).
