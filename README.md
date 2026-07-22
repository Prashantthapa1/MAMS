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

Run both apps:

```bash
npm run dev
```

Client default URL: `http://localhost:5173`

Server default URL: `http://localhost:4000`

Health check: `http://localhost:4000/api/health`

## Next Steps
Follow `tasks.md`. The first pending backend work is PostgreSQL schema setup and seed data. The first pending frontend work is connecting pages to real API endpoints.
