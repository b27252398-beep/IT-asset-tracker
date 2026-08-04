# Enterprise IT Asset Management System - Project Progress

## Current State
- Baseline project is functional.
- Transitioning to **Enterprise Architecture**.
- Commencing **Milestone 1**.

## Completed Milestones
*(None yet)*

## Current Architecture
- Frontend: React + Vite (Vanilla JS, migrating to TS)
- Backend: Spring Boot 3 (currently using H2 database locally) + Mock Node.js backend
- Database: H2 (migrating to PostgreSQL)

## Pending Work
- **Milestone 1**: Docker, PostgreSQL, Flyway, SLF4J, Swagger, Base Package Structure.
- **Milestone 2**: BaseEntity, ApiResponse, ExceptionHandler.
- **Milestone 3**: Refactor Asset Module incrementally.
- **Milestone 4**: Authentication & Security.

## Known Issues
- Currently requires Node.js mock backend for local testing due to missing Java dependencies. Will be resolved via Dockerization in M1.

## Decisions Made
- Use Incremental Refactoring Strategy (no deleting existing working code).
- Adopt Clean Architecture.
- Use Docker Compose for local environments.
