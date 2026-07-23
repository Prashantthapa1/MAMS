# Database Seeds

This folder contains SQL seeds that can be run directly against any Postgres database, including production.

Run the main demo seed like this:

```bash
psql "$DATABASE_URL" -f server/db/seeds/demo-data.sql
```

The statements are written to be repeatable where possible, so running them again should update the demo users and shared records instead of creating obvious duplicates.
