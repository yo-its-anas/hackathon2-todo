---
name: database-skill
description: Design, manage, and optimize data persistence using Neon Serverless PostgreSQL and SQLModel in FastAPI applications.
---

# Database Skill

## Instructions

1. **Database Architecture**
   - Serverless PostgreSQL using Neon
   - Environment-based configuration
   - Connection pooling and lifecycle management
   - Separation of schema, models, and queries

2. **SQLModel Design**
   - Declarative table definitions
   - One-to-one, one-to-many, and many-to-many relationships
   - Typed fields and defaults
   - Pydantic-compatible schemas

3. **Async Database Sessions (FastAPI)**
   - Async engine and session setup
   - Dependency-based session injection
   - Proper session scoping and cleanup
   - Transaction handling and rollbacks

4. **Data Integrity & Constraints**
   - Primary and foreign keys
   - Unique and composite constraints
   - Indexing for performance
   - Cascades and referential integrity

## Best Practices
- Prefer async database access for FastAPI
- Enforce constraints at the database level
- Keep models small and focused
- Use migrations for schema changes
- Avoid N+1 query patterns