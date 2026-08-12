# Architecture Decision Record (ADR-001): PostgreSQL

## Status
Accepted

## Context
The application initially used H2 (in-memory) for rapid prototyping. As we transition to an enterprise IT Asset Management System, we need a robust, scalable, and ACID-compliant relational database that supports concurrent users, advanced querying, and robust data integrity constraints.

## Decision
We will use **PostgreSQL**.

## Consequences
- Requires external database infrastructure (Docker for local, managed DB for production).
- Provides JSONB support for potential dynamic attributes.
- Requires migrations (handled via Flyway).
