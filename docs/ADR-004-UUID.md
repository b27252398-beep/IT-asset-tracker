# Architecture Decision Record (ADR-004): UUIDs

## Status
Accepted

## Context
Using auto-incrementing integers (`BIGSERIAL`) exposes the size of the database, is vulnerable to enumeration attacks (e.g., iterating through `/api/users/1`, `/api/users/2`), and complicates distributed ID generation or data merging.

## Decision
We will use **UUID v4** as the primary key for all entities.

## Consequences
- Slightly larger index sizes and memory overhead compared to integers.
- Prevents enumeration attacks.
- Guaranteed global uniqueness across decoupled systems or tenant databases.
