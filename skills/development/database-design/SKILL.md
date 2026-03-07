---
name: "Database Schema Design & Migration"
description: "A workflow for the Database Engineer [DB] to design optimized, relational or NoSQL data models and generate migration scripts."
authors: ["Aizen-Gate Team"]
status: "production"
---

# Database Design Skill

Objective: Design a robust database schema based on requirements and generate the necessary migration files.

## Roles Involved

- **[DB] Database Engineer**: Primary designer and architect of the data layer.
- **[ARCH] Architect**: Ensures alignment with the overall system architecture.

## The Workflow

### Phase 1: Requirements Analysis

1. **[DB]** Identifies key entities, relationships, and data access patterns from the PRD/Spec.
2. **[DB]** Determines the best-fit database type (Relational vs NoSQL) based on the project context.

### Phase 2: Logical & Physical Modeling

3. **[DB]** Designs the schema:
   - Tables/Collections, Fields, Data Types.
   - Primary Keys, Foreign Keys, Unique constraints.
   - Indexes for performance optimization.
4. **[DB]** Explains the schema design using the **Pros & Cons** format during a team review.

### Phase 3: Implementation

5. **[DB]** Generates the DDL (Data Definition Language) or ORM schema (e.g., Prisma, Mongoose).
6. **[DB]** Creates the initial migration script (e.g., `001_initial_schema.sql`).
7. **[DB]** Updates the **Shared Memory** with the database connection details and architecture decisions.

## Output Criteria

- A clear ER diagram or schema description in markdown.
- Working schema files (SQL, Prisma, etc.).
- Initial migration scripts.
- Documented data types and constraints.

## Database Best Practices

- **Normalize by default**: Use 3rd Normal Form unless there is a clear performance reason to denormalize.
- **Index wisely**: Add indexes to foreign keys and fields used in frequent filters/joins.
- **Standard naming**: Use snake_case for tables and columns.
- **Atomic migrations**: Each migration should be a single, logical change.
