---
trigger: glob
glob: "**/*.{sql,prisma,mongodb,json}"
---

# DATABASE.MD - Data Integrity & Schema Mastery

> **Objective**: Ensure standard data structure, high query performance, and absolute data safety.

---

## 1. SCHEMA DESIGN

### 1.1 Normalization
1. **3NF**: Follow Third Normal Form. Avoid data redundancy.
2. **Naming**: Use `snake_case` for Tables and Columns.
3. **Primary Keys**: Use UUID or auto-increment integers.

### 1.2 Auditing
1. **Timestamps**: Every business table must have:
   - `created_at` (timestamp)
   - `updated_at` (timestamp)
2. **Soft Delete**: Use `deleted_at` instead of physical delete for important data.

### 1.3 Foreign Keys
1. **Integrity**: Always define FK constraints.
2. **Cascade**: Define ON DELETE behavior explicitly.

---

## 2. PERFORMANCE & INDEXING

### 2.1 Indexes
1. **Foreign Keys**: Index all FK columns.
2. **Search Columns**: Index columns in WHERE clauses.
3. **Composite Indexes**: Use for multi-column queries (order matters).

### 2.2 Query Optimization
1. **Explain Plan**: Check query cost before deployment.
2. **Select Only Needed**: Never use `SELECT *`.
3. **Pagination**: Always use Cursor or Limit/Offset.

### 2.3 N+1 Problem
1. **Batch Fetch**: Use `IN` clause or eager loading.
2. **Limit Queries**: Avoid running queries in loops.

---

## 3. MIGRATION PROTOCOL

### 3.1 Best Practices
1. **Atomic Changes**: Each migration does one logical change only.
2. **Reversible**: Always provide Down migration.
3. **Idempotent**: Can be run multiple times safely.

### 3.2 Production Safety
1. **Backup First**: Always backup data before schema changes.
2. **No Direct Edits**: Never edit columns directly in Production.
3. **Zero-Downtime**: Use online migrations for large tables.

---

## 4. DATA TYPES

| Data | Type |
|------|------|
| UUID | UUID |
| DateTime | TIMESTAMP |
| Money | DECIMAL(10,2) |
| Text | TEXT |
| Boolean | BOOLEAN |

---

## 5. QUERY CHECKLIST

- [ ] Uses parameterized queries
- [ ] Has proper indexes
- [ ] Uses pagination
- [ ] Avoids SELECT *
- [ ] Has migration rollback