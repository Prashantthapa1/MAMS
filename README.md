# Employee Management System

Simple Employee Management System for a single small business.

## Stack
- Client: React, Vite, TypeScript, Tailwind CSS
- Server: Node.js, Express, TypeScript
- Database: PostgreSQL
- Database access: `pg`
- Auth: JWT and bcrypt
- Validation: Zod

## Project Structure
- `client`: frontend application
- `server`: backend API
- `context.md`: full product context
- `tasks.md`: implementation tracker
- `memory.md`: short agent guidance for future work

## Local Setup
Install dependencies from the repository root:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

Create the backend environment file:

```bash
cp server/.env.example server/.env
```

Set:
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN` (the deployed frontend URL; optional locally)

Run both apps:

```bash
npm run dev
```

Client default URL: `http://localhost:5173`

Server default URL: `http://localhost:4000`

Health check: `http://localhost:4000/api/health`

## Database Setup and Seeding

Create a PostgreSQL database and set `DATABASE_URL`, then apply all schema migrations:

```bash
npm run db:migrate --prefix server
npm run db:seed --prefix server
```

Seed credentials: `admin@example.com` / `admin123` and `staff@example.com` / `staff123`.

## Staff Invitations and Access

An administrator can invite a person by email through `POST /api/auth/invitations`, supplying their name, phone, position (for example, Backend Developer, Frontend Developer, or UI/UX Designer), and access role. The system emails a one-time seven-day password-setup link through SMTP. The recipient accepts it through `POST /api/auth/invitations/accept`.

Access roles are `STAFF`, `MANAGER`, and `ADMIN`. Managers can access operational areas (employees, attendance, leave management, salaries, revenue, expenses, profit, and reports); only administrators can manage invitations, access roles, and company settings. Configure `APP_URL` and all `SMTP_*` variables for invitation delivery.

## Railway Deployment

Create three Railway services: PostgreSQL, `server`, and `client`. Set each app service root directory to its corresponding folder. The included `railway.json` files build and start each service.

Set these backend variables in Railway:

- `DATABASE_URL` — reference the PostgreSQL service's connection URL
- `JWT_SECRET` — a strong secret of at least 16 characters
- `CORS_ORIGIN` — the public frontend URL
- Cloudinary variables when employee image upload is enabled: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Set `VITE_API_URL` on the frontend service to `https://<backend-domain>/api` before its build. After deploying the backend, run its migrations with `railway run --service <backend-service> -- npm run db:migrate`.

## GitHub Actions

On pushes to `main`, the workflow tests and builds the project, deploys the backend, runs migrations, and deploys the frontend. Add these repository secrets:

- `RAILWAY_TOKEN`
- `RAILWAY_PROJECT_ID`
- `RAILWAY_BACKEND_SERVICE`
- `RAILWAY_FRONTEND_SERVICE`

Railway application variables such as `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, and `VITE_API_URL` remain in Railway rather than GitHub secrets.
