VisionMeta backend

This folder contains a minimal Express + TypeScript backend used to provide API endpoints and serve the frontend in production.

Quick start (dev):

```bash
cd server
npm install
npm run dev
```

- Dev server runs on port 4000 by default.
- Vite dev runs on port 8080 and proxies `/api` to the backend.

Production build (serve frontend):

1. Build frontend at project root: `npm run build` (produces `dist/`)
2. Install server deps in `server` and run:

```bash
cd server
npm install --production
npm run build
NODE_ENV=production npm start
```

Endpoints implemented:
- `GET /api/download/latest` — redirects to the latest release asset (installer)
- `POST /api/contact` — accepts JSON { name, email, message } for contact form submissions
