# Database Master - Schema Design & Migration Rules

## Normalization Forms

### 1NF - First Normal Form
- Atomic values (no lists/arrays in columns)
- Unique column names
- Consistent data types
- Each row unique (primary key)

### 2NF - Second Normal Form
- Meet 1NF
- No partial dependencies
- All non-key columns depend on entire primary key

### 3NF - Third Normal Form
- Meet 2NF
- No transitive dependencies
- Non-key columns depend only on primary key

### When to Denormalize
- Read-heavy workloads
- Aggregated reports
- Cached frequently-calculated values
- Legacy system integration

## Indexing Strategies

### B-Tree Index (Default)
```sql
CREATE INDEX idx_users_email ON users(email);
-- Best for: =, <, >, BETWEEN, LIKE 'prefix%'
```

### Composite Index
```sql
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);
-- Order matters! Left-to-right usage
```

### Partial Index
```sql
CREATE INDEX idx_orders_active ON orders(created_at)
WHERE status = 'active';
-- For filtered queries
```

### When NOT to Index
- Low cardinality columns
- Frequently updated tables
- Small tables
- Full table scans more efficient

## Migration Best Practices

### Version Control
```bash
# Migration naming
migrations/
  001_create_users.sql
  002_add_user_emails.sql
  003_create_orders.sql
```

### Safe Migration Template
```sql
-- Migration: add_user_phone
-- Description: Add phone column to users table

BEGIN;

-- Add column (nullable first)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Backfill existing data
UPDATE users SET phone = 'unknown' WHERE phone IS NULL;

-- Add constraint
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;

COMMIT;
```

### Rollback Template
```sql
-- Rollback: add_user_phone

BEGIN;

ALTER TABLE users DROP COLUMN IF EXISTS phone;

COMMIT;
```

## Common Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| UUID | Primary keys | `gen_random_uuid()` |
| Soft delete | Archives | `deleted_at` timestamp |
| Timestamps | Audit | `created_at`, `updated_at` |
| Enums | Status | `status VARCHAR(20) CHECK` |
| JSONB | Flexible data | Metadata fields |
