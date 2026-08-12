# Architecture Decision Record (ADR-002): Flyway

## Status
Accepted

## Context
When collaborating across teams or deploying to production, database schemas must evolve deterministically. Relying on Hibernate `ddl-auto: update` is extremely dangerous in production and leads to inconsistent states.

## Decision
We will use **Flyway** for database migrations.

## Consequences
- All schema changes must be written as versioned SQL scripts (`V1__...sql`).
- Application starts will verify migration history.
- Hibernate `ddl-auto` is restricted to `validate` in all environments.
