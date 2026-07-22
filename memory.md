# Agent Memory

## Current State
The repository is an Employee Management System scaffold with separate `client` and `server` apps.

The user requested only setup for now. Future work should follow `tasks.md` feature by feature.

## Important Decisions
- Use TypeScript everywhere.
- Do not use Prisma unless the user explicitly asks to add it later. The original prompt listed Prisma, but the final instruction says: "no need to use prisma orm."
- Backend should use PostgreSQL directly through `pg`.
- Keep the app simple and production-ready without multi-tenancy or enterprise abstractions.
- There is only one company.
- Use Admin and Staff roles only.

## Repository Layout
- `client`: React + Vite + Tailwind frontend
- `server`: Node.js + Express TypeScript backend
- `context.md`: full project context and feature requirements
- `tasks.md`: feature task tracker
- `memory.md`: concise guidance for future agents

## Before Starting Future Work
1. Read `memory.md` first.
2. Check `tasks.md` for the next pending or not-started feature.
3. Inspect only the relevant files for that task instead of reviewing the whole codebase.
4. Keep changes scoped to the feature being implemented.
5. Update `tasks.md` as task statuses change.

## Backend Conventions
- Use `src/controllers` for request handlers.
- Use `src/services` for business logic.
- Use `src/routes` for route registration.
- Use `src/middleware` for auth, error handling, and request concerns.
- Use `src/db` for PostgreSQL connection and database helpers.
- Use `src/config` for environment parsing.
- Use `src/utils` for shared helpers.
- Return consistent JSON responses.
- Validate request bodies and query params with Zod.
- Protect admin-only routes with role middleware.

## Frontend Conventions
- Use React Router for pages.
- Use Axios through a shared API client.
- Use Tailwind for styling.
- Keep reusable components in `src/components`.
- Keep pages in `src/pages`.
- Use a responsive sidebar layout.
- Include loading, empty, and error states on data pages.
- Use confirmation dialogs before destructive actions.

## Auth Rules
- Admin can access everything.
- Staff can login, view their own attendance, view leave history, and submit leave requests.
- Staff cannot edit salaries, expenses, revenue, employees, or settings.

## Default Seed Credentials
- Admin email: `admin@example.com`
- Admin password: `admin123`

## Verification Expectations
After meaningful changes:
- Run frontend type/build checks.
- Run backend type/build checks.
- Run tests if they exist.
- If dependencies are not installed, install them before verification when permitted.
