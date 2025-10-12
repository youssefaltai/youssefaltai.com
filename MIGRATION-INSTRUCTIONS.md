# Database Migration Instructions

## Transaction Filtering Implementation

New database indexes have been added to the Prisma schema to optimize transaction queries. You need to apply these migrations to your database.

### Schema Changes

Added the following indexes to the `Transaction` model:
- `@@index([userId, date(sort: Desc)])` - Optimize date-based queries per user
- `@@index([userId, deletedAt, date(sort: Desc)])` - Optimize filtered date queries
- `@@index([description])` - Optimize text search on descriptions

### How to Apply Migration

#### Option 1: Using Docker (Recommended for Development)

1. Start the Docker containers:
   ```bash
   docker compose up -d postgres
   ```

2. Wait for PostgreSQL to be ready (check with `docker compose logs postgres`)

3. Run the migration:
   ```bash
   cd packages/db
   DATABASE_URL="postgresql://postgres:166288@localhost:5432/youssefaltai?schema=public" pnpm prisma migrate dev --name add_transaction_indexes
   ```

#### Option 2: Production Deployment

The migration will be automatically applied when you rebuild and deploy the Docker containers:

```bash
docker compose down
docker compose up -d --build
```

### Verification

After applying the migration, verify the indexes were created:

```sql
-- Connect to the database
psql -U postgres -d youssefaltai

-- List indexes on transactions table
\d transactions
```

You should see the new indexes listed.

### Rollback (if needed)

If you need to rollback the migration:

```bash
cd packages/db
DATABASE_URL="postgresql://postgres:166288@localhost:5432/youssefaltai?schema=public" pnpm prisma migrate resolve --rolled-back add_transaction_indexes
```

### Notes

- The migration is safe and non-destructive (only adds indexes)
- No data loss will occur
- The indexes improve query performance for filtered transaction lists
- Expected migration time: < 1 second for small databases, up to a few seconds for large databases

